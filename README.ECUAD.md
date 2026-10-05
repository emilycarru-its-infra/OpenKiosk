# OpenKiosk fork — kiosk deployment notes

A fork of OpenKiosk, the Firefox-derived kiosk browser, carrying packaging helpers for
deploying it to a managed macOS fleet.

- **Source mirror this fork is based on**: https://github.com/zcomputerwiz/OpenKiosk
- **Vendor**: Mozdev Group — https://openkiosk.tech (formerly openkiosk.mozdevgroup.com)

OpenKiosk is Mozdev Group's. It is distributed as signed builds plus a source tarball, and
its own git lives on a private server (`ssh://git@mozdevgroup.com:9889/git/okcd`). There is
no public repository and therefore no pull request to open against the project itself: a
change goes back to the vendor as a patch. The GitHub mirror above is a community copy of
the tarball and is what this fork is based on, because it is the only full source tree with
git history.

Note that openkiosk.org is an unrelated project (kiosk hardware protocols), not this
browser.

## Layout

```
mozilla/                       gecko source tree, checked in by upstream
openkiosk/                     the OpenKiosk application on top of gecko
openkiosk-core-changes.patch   gecko patch applied by the checkout target
openkiosk-client.mk            upstream checkout/bootstrap makefile
scripts/{mac,linux,win}/       upstream build scripts
ecuad/                         packaging helpers added by this fork
```

Everything outside `ecuad/`, this file, `CUSTOMIZATIONS.md` and `FORK_WORKFLOW.md` is
upstream's. Changes are kept to the smallest possible diff so a patch offered to the vendor
stays reviewable.

## Base version

The checked-in `mozilla/` tree is Firefox 115.9.0esr. The vendor's newest release is
OpenKiosk 115.20.0 (2025-02-16), and there is no vendor build on a later ESR.
`openkiosk-client.mk` pins the gecko revision:

```
TARGET_REV = "-r FIREFOX_115_9_0esr_RELEASE"
BUNDLE_TAG = mozilla-esr115
```

Bumping that to a later 115 ESR, or moving the base to a current ESR, is the first decision
in any build from here. It matters for WebAuthn in particular: see `CUSTOMIZATIONS.md`.

## Repack a vendor release

No compilation. Takes the vendor's universal DMG, installs an autoconfig file into the app
bundle, re-signs so the bundle seal is valid again, notarizes and emits a DMG:

```
SIGN_IDENTITY="Developer ID Application: <your org> (<team id>)" \
NOTARY_KEYCHAIN_PROFILE=<profile> \
./ecuad/repack-mac.sh
```

The autoconfig channel works because `openkiosk/app/profile/openkiosk.js` sets
`general.config.filename` to `openkiosk.cfg` with `general.config.obscure_value` 0, so
`Contents/Resources/openkiosk.cfg` is read as plain text at every start and `lockPref`
values there survive a profile reset.

## Build from source

macOS builds are universal: an x86_64 pass and an arm64 pass, unified into one DMG.

```
make -f openkiosk-client.mk checkout
```

```
cd scripts/mac && ./auto.sh
```

With signing and notarization, and a DMG ready to import into a deployment tool:

```
SIGN_IDENTITY="Developer ID Application: <your org> (<team id>)" \
NOTARY_KEYCHAIN_PROFILE=<profile> \
./ecuad/build-mac.sh
```

Building a tree of this vintage on a current macOS and Xcode is not something upstream
supports; expect toolchain work.

## License

Mozilla Public License 2.0, as a Firefox derivative. See the license headers in the source
tree.
