#!/bin/bash
# Build OpenKiosk for macOS: bootstrap, universal build, sign, notarize, staple.
# Leaves a signed universal DMG in ecuad/out/.
#
# Environment:
#   SIGN_IDENTITY             codesign identity (required)
#   NOTARY_KEYCHAIN_PROFILE   notarytool keychain profile (required to notarize)
#
# Usage: ./ecuad/build-mac.sh [--clobber] [--skip-checkout] [--no-notarize]
set -euo pipefail

FORK_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$FORK_ROOT/ecuad/out"

CLOBBER=0
SKIP_CHECKOUT=0
NOTARIZE=1
for arg in "$@"; do
  case "$arg" in
    --clobber)       CLOBBER=1 ;;
    --skip-checkout) SKIP_CHECKOUT=1 ;;
    --no-notarize)   NOTARIZE=0 ;;
    *) echo "unknown argument: $arg" >&2; exit 2 ;;
  esac
done

: "${SIGN_IDENTITY:?set SIGN_IDENTITY to a codesign identity}"
[ "$NOTARIZE" -eq 1 ] && : "${NOTARY_KEYCHAIN_PROFILE:?set NOTARY_KEYCHAIN_PROFILE, or pass --no-notarize}"

for tool in hg python3 xcrun codesign hdiutil; do
  command -v "$tool" >/dev/null || { echo "missing required tool: $tool" >&2; exit 1; }
done

# Upstream's makefile pulls the pinned gecko revision into mozilla/, applies
# openkiosk-core-changes.patch and writes the mozconfig. It is idempotent but slow, so a
# rebuild of an already-bootstrapped tree can skip it.
if [ "$SKIP_CHECKOUT" -eq 0 ]; then
  echo "==> checkout / patch / mozconfig"
  make -C "$FORK_ROOT" -f openkiosk-client.mk checkout
fi

echo "==> universal build (x86_64 + arm64, then unify)"
OK_CLOBBER=$( [ "$CLOBBER" -eq 1 ] && echo 1 || echo "" ) \
  bash -c "cd '$FORK_ROOT/scripts/mac' && ./auto.sh"

# auto.sh leaves the unified DMG in scripts/mac/installer/.
DMG="$(find "$FORK_ROOT/scripts/mac/installer" -maxdepth 1 -name '*.dmg' -print -quit)"
[ -n "$DMG" ] || { echo "no DMG produced by scripts/mac/auto.sh" >&2; exit 1; }

mkdir -p "$OUT_DIR"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"; hdiutil detach "$STAGE/mnt" >/dev/null 2>&1 || true' EXIT

echo "==> signing OpenKiosk.app"
mkdir -p "$STAGE/mnt"
hdiutil attach "$DMG" -mountpoint "$STAGE/mnt" -nobrowse -quiet
cp -R "$STAGE/mnt/OpenKiosk.app" "$STAGE/OpenKiosk.app"
hdiutil detach "$STAGE/mnt" -quiet

# Sign inside out: nested code first, then the bundle, with the hardened runtime that
# notarization requires. Firefox-derived bundles need the JIT and unsigned-memory
# entitlements, which upstream ships in the source tree.
ENTITLEMENTS="$FORK_ROOT/mozilla/security/mac/hardenedruntime/browser.production.entitlements.xml"
SIGN_ARGS=(--force --timestamp --options runtime --sign "$SIGN_IDENTITY")
[ -f "$ENTITLEMENTS" ] && SIGN_ARGS+=(--entitlements "$ENTITLEMENTS")

find "$STAGE/OpenKiosk.app/Contents" \
  -type f \( -name '*.dylib' -o -perm -u+x \) -print0 2>/dev/null \
  | while IFS= read -r -d '' f; do
      codesign "${SIGN_ARGS[@]}" "$f" >/dev/null 2>&1 || true
    done
codesign "${SIGN_ARGS[@]}" "$STAGE/OpenKiosk.app"
codesign --verify --deep --strict --verbose=2 "$STAGE/OpenKiosk.app"

VERSION="$(/usr/bin/defaults read "$STAGE/OpenKiosk.app/Contents/Info.plist" CFBundleShortVersionString)"
FINAL_DMG="$OUT_DIR/OpenKiosk-$VERSION.dmg"

echo "==> building $FINAL_DMG"
rm -f "$FINAL_DMG"
mkdir -p "$STAGE/dmgroot"
cp -R "$STAGE/OpenKiosk.app" "$STAGE/dmgroot/"
hdiutil create -format UDZO -volname OpenKiosk -fs HFS+ -srcfolder "$STAGE/dmgroot" -ov -quiet "$FINAL_DMG"

if [ "$NOTARIZE" -eq 1 ]; then
  echo "==> notarizing"
  # A credential rejection is never retried: repeated attempts lock the Apple ID. Only
  # transient failures are retried, which is the same rule the repo's pipelines follow.
  for att in 1 2 3 4 5; do
    log="$(mktemp)"
    if xcrun notarytool submit "$FINAL_DMG" \
         --keychain-profile "$NOTARY_KEYCHAIN_PROFILE" --wait --timeout 30m >"$log" 2>&1; then
      cat "$log"; rm -f "$log"; break
    fi
    cat "$log"
    if grep -qiE '401|Invalid credentials|has been locked|app-specific password|Unable to authenticate' "$log"; then
      rm -f "$log"
      echo "notarization rejected the credentials; not retrying. Fix the keychain profile." >&2
      exit 1
    fi
    rm -f "$log"
    [ "$att" -eq 5 ] && { echo "notarization failed after 5 attempts" >&2; exit 1; }
    echo "attempt $att failed (transient); retrying in $((att*20))s"; sleep $((att*20))
  done
  xcrun stapler staple "$FINAL_DMG"
fi

echo
echo "OpenKiosk $VERSION: $FINAL_DMG"

