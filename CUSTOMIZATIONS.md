# Fork customizations

Every change this fork makes on top of upstream, what it is for, and whether it belongs
upstream. Keep the list short: anything generally useful should be offered to the vendor as
a patch rather than carried here (see `FORK_WORKFLOW.md`).

## Packaging — fork only

`ecuad/repack-mac.sh` installs `ecuad/openkiosk.cfg` into a vendor release, re-signs the
bundle, notarizes, staples and emits a DMG. `ecuad/build-mac.sh` does the same around a
build from source. Both take the signing identity and notarization keychain profile from
the environment and hold no site-specific values.

`README.ECUAD.md`, `CUSTOMIZATIONS.md` and `FORK_WORKFLOW.md` describe the fork and stay
out of any patch offered upstream.

## Behaviour

### WebAuthn is disabled on this base

`ecuad/openkiosk.cfg` locks `security.webauth.webauthn` and
`security.webauth.webauthn_enable_usbtoken` off.

On the Firefox 115 ESR base there is no macOS platform authenticator — `dom/webauthn` on
this tree routes non-Android requests to authenticator-rs, which only speaks to USB and NFC
security keys, and a `WinWebAuthnManager` exists for Windows with no macOS equivalent.
Platform authenticator support arrived in Firefox 122.

On a public kiosk that combination is a dead end. An identity provider that offers or
requests a passkey hands the browser a request it cannot satisfy, because nobody at a kiosk
carries a security key, and kiosk mode suppresses the dialog that would carry the cancel
control and the "other ways to sign in" path. The session is stuck until the inactivity
timer resets it. With WebAuthn unavailable, `navigator.credentials` advertises no
public-key support, the provider never puts the method forward, and sign-in falls back to
another factor.

This is a workaround for the base version, not a fix. Two directions remain open and are
not mutually exclusive:

1. Make the WebAuthn prompt dismissible in kiosk mode, so a kiosk can decline a request it
   cannot serve instead of trapping the session. That is a genuine kiosk-browser bug and is
   the part worth offering upstream.
2. Move the base to an ESR that supports platform authenticators on macOS, after which the
   pref lock above should be removed. That is a rebase rather than a patch, and it changes
   the revision pinned in `openkiosk-client.mk`.
