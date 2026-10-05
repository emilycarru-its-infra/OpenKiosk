# OpenKiosk Fork Workflow

## Repositories

```
This fork:  github.com/emilycarru-its-infra/OpenKiosk
Mirror:     github.com/zcomputerwiz/OpenKiosk
Work:       ecuad/main
```

OpenKiosk is Mozdev Group's. Its own git is on MDG's private server
(`ssh://git@mozdevgroup.com:9889/git/okcd`) and releases come as signed builds plus a source
tarball, so there is no public repository to open a pull request against. The GitHub
repository above is a community mirror of the tarball, it is the parent of this fork, and it
is the practical place to publish a change — contributing it to MDG means sending them the
patch.

## Remotes

Inside the submodule (`packages/OpenKiosk` in the Munki repo):

```
origin    → https://github.com/emilycarru-its-infra/OpenKiosk
upstream  → https://github.com/zcomputerwiz/OpenKiosk
```

```
git remote add upstream https://github.com/zcomputerwiz/OpenKiosk
```

## Branches

The mirror branches `main` and `ESR128` are never committed to directly, so that a diff
against them is exactly ECU's changes. All work lives on `ecuad/main`, which is the branch a
consuming repository tracks as a submodule.

## Sync from upstream

Fast-forward the mirror branch, then merge it into the ECU branch, pushing each to the fork
with `git push origin <branch>`:

```
git fetch upstream
git switch main
git merge --ff-only upstream/main
```

```
git switch ecuad/main
git merge main
```

## Fork changes

```
git switch ecuad/main
git commit -m "<what changed>"
```

Then move the submodule pointer in the consuming repository, which is a normal change there
and ships through a pull request like any other:

```
git -C ../.. add packages/OpenKiosk
git -C ../.. commit -m "Bump OpenKiosk fork to <sha>"
```

## Publishing a fix beyond ECU

Packaging and documentation stay in the fork; a behavioural fix should not. Keep the
source change on a branch off the mirror branch carrying only that change, never off
`ecuad/main`, which also holds `ecuad/`, `README.ECUAD.md`, `CUSTOMIZATIONS.md` and this
file. That branch is what gets offered to the mirror as a pull request, and what gets sent
to MDG as a patch (`git format-patch`) for the vendor's own tree:

```
git switch -c fix/<slug> upstream/main
git cherry-pick <the source commit from ecuad/main>
```

```
gh pr create --repo zcomputerwiz/OpenKiosk --head emilycarru-its-infra:fix/<slug> --base main
```

Confirm the fix on real kiosks before offering it anywhere. If the vendor takes it into a
later release, drop the cherry-picked commit from `ecuad/main` on the next sync so the
change is carried upstream rather than here.
