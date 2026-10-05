#!/bin/bash
# Repack a vendor OpenKiosk release with this fork's autoconfig, re-signed and notarized.
#
# No compilation: it takes the vendor's released universal DMG, drops ecuad/openkiosk.cfg
# into Contents/Resources, re-signs so the bundle seal is valid again, notarizes, staples,
# and leaves a DMG in ecuad/out/.
#
# Usage: ./ecuad/repack-mac.sh [--dmg <path>] [--no-notarize]
#   --dmg          vendor DMG to repack; downloaded from the vendor when omitted
#   --no-notarize  sign only, for a local smoke test
#
# Environment:
#   SIGN_IDENTITY             codesign identity (required unless --no-notarize is a no-sign run)
#   NOTARY_KEYCHAIN_PROFILE   notarytool keychain profile (required to notarize)
#   OPENKIOSK_DMG_URL         override the vendor download
set -euo pipefail

FORK_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$FORK_ROOT/ecuad/out"
CFG="$FORK_ROOT/ecuad/openkiosk.cfg"

VENDOR_DMG_URL="${OPENKIOSK_DMG_URL:-https://www.mozdevgroup.com/dropbox/okcd/115/release/OpenKiosk115.20.0-2025-02-16-universal.dmg}"

DMG=""
NOTARIZE=1
while [ $# -gt 0 ]; do
  case "$1" in
    --dmg)         DMG="$2"; shift 2 ;;
    --no-notarize) NOTARIZE=0; shift ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

[ -f "$CFG" ] || { echo "missing $CFG" >&2; exit 1; }
: "${SIGN_IDENTITY:?set SIGN_IDENTITY to a codesign identity}"
[ "$NOTARIZE" -eq 1 ] && : "${NOTARY_KEYCHAIN_PROFILE:?set NOTARY_KEYCHAIN_PROFILE, or pass --no-notarize}"

STAGE="$(mktemp -d)"
cleanup() { hdiutil detach "$STAGE/mnt" -quiet 2>/dev/null || true; rm -rf "$STAGE"; }
trap cleanup EXIT

if [ -z "$DMG" ]; then
  DMG="$STAGE/vendor.dmg"
  echo "==> downloading $VENDOR_DMG_URL"
  curl -fL --progress-bar -o "$DMG" "$VENDOR_DMG_URL"
fi

echo "==> extracting OpenKiosk.app"
mkdir -p "$STAGE/mnt"
hdiutil attach "$DMG" -mountpoint "$STAGE/mnt" -nobrowse -readonly -quiet
cp -R "$STAGE/mnt/OpenKiosk.app" "$STAGE/OpenKiosk.app"
hdiutil detach "$STAGE/mnt" -quiet

VERSION="$(/usr/bin/defaults read "$STAGE/OpenKiosk.app/Contents/Info.plist" CFBundleShortVersionString)"
echo "    vendor build $VERSION"

echo "==> installing autoconfig"
cp "$CFG" "$STAGE/OpenKiosk.app/Contents/Resources/openkiosk.cfg"

# Writing into the bundle breaks the vendor's seal, so everything is signed again below.
# Clear extended attributes first: a stale quarantine or resource-fork xattr makes
# codesign fail on some of the nested binaries.
xattr -cr "$STAGE/OpenKiosk.app"

echo "==> re-signing as $SIGN_IDENTITY"
ENTITLEMENTS="$FORK_ROOT/mozilla/security/mac/hardenedruntime/browser.production.entitlements.xml"
SIGN_ARGS=(--force --timestamp --options runtime --sign "$SIGN_IDENTITY")
[ -f "$ENTITLEMENTS" ] && SIGN_ARGS+=(--entitlements "$ENTITLEMENTS")

# Inside out: nested bundles, then loose Mach-O, then the outer bundle.
find "$STAGE/OpenKiosk.app/Contents" -mindepth 1 -type d -name '*.app' -print0 \
  | while IFS= read -r -d '' nested; do codesign "${SIGN_ARGS[@]}" "$nested"; done
find "$STAGE/OpenKiosk.app/Contents" -type f \( -name '*.dylib' -o -perm -u+x \) -print0 \
  | while IFS= read -r -d '' f; do codesign "${SIGN_ARGS[@]}" "$f" >/dev/null 2>&1 || true; done
codesign "${SIGN_ARGS[@]}" "$STAGE/OpenKiosk.app"
codesign --verify --strict --verbose=2 "$STAGE/OpenKiosk.app"

mkdir -p "$OUT_DIR"
FINAL_DMG="$OUT_DIR/OpenKiosk-$VERSION.dmg"
echo "==> building $FINAL_DMG"
rm -f "$FINAL_DMG"
mkdir -p "$STAGE/dmgroot"
cp -R "$STAGE/OpenKiosk.app" "$STAGE/dmgroot/"
hdiutil create -format UDZO -volname OpenKiosk -fs HFS+ -srcfolder "$STAGE/dmgroot" -ov -quiet "$FINAL_DMG"

if [ "$NOTARIZE" -eq 1 ]; then
  echo "==> notarizing"
  # A credential rejection is never retried: repeated attempts lock the Apple ID. Only
  # transient failures get another go.
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
echo "OpenKiosk $VERSION with autoconfig: $FINAL_DMG"
