# openkiosk-client.mk
#
# Automate checkout of the base mozilla firefox code and the open kiosk client code.

# set this for latest target branch
TARGET_REV = "-r FIREFOX_115_9_0esr_RELEASE"
BUNDLE_HOST=https://hg.cdn.mozilla.net
BUNDLE_TAG=mozilla-esr115
BUNDLE_CONFIG_FILE=$(BUNDLE_HOST)/bundles.json
BUNDLE_PATH=""
BUNDLE_EXT=gzip-v2.hg
MERCURIAL_URL=https://hg.mozilla.org/releases/$(BUNDLE_TAG)/
TARGET_SRC_DIR=91
DATE_STAMP=$(shell date +"%Y-%m-%d")
GIT_OK_OKCD_URL=${MDG_GIT_URL_OKCD}
GIT_OK_SRC_URL=${MDG_GIT_URL_SRC}
SRC_TARBALL=openkiosk$(TARGET_SRC_DIR)-latest-src.tar.bz2

PATCH = openkiosk-core-changes.patch

MOZ_CONFIG = mozilla/.mozconfig

OS_ARCH = $(shell uname -s)

all: checkout

checkout: bundle-checkout openkiosk-checkout patch mozconfig

mozilla-checkout: bundle-checkout

pull:
	@cd mozilla; hg pull $(MERCURIAL_URL);

mercurial-checkout: 
	@if [ ! -d mozilla ]; then \
	  hg clone $(MERCURIAL_URL) mozilla/; \
	cd mozilla; hg update $(TARGET_REV); \
	hg identify; \
	fi

fetch-bundle:
	echo fetching bundle file [$(BUNDLE_CONFIG_FILE)];
	curl -O $(BUNDLE_CONFIG_FILE); wait; 

bundle-checkout: fetch-bundle
	@if [ ! -d mozilla ]; then hg init mozilla; fi
	export BUNDLE_PATH=$(shell grep $(BUNDLE_TAG) bundles.json | grep $(BUNDLE_EXT) | sed -e's:^.*"r:r:g' | sed -e's:",::g;');                     \
	export BUNDLE_FILE=$(shell grep $(BUNDLE_TAG) bundles.json | grep $(BUNDLE_EXT) | sed -e's:^.*"r:r:g' | sed -e's:",::g;' | sed -e's:^.*/::g'); \
	export BUNDLE_URL=$(BUNDLE_HOST)/$$BUNDLE_PATH;                                                                                                  \
	echo Fetching Mercurial Bundle [$$BUNDLE_URL];                                                                                                   \
	curl -O $$BUNDLE_URL;                                                                                                                            \
	cd mozilla; hg unbundle ../$$BUNDLE_FILE; wait; hg up $(TARGET_REV); wait; hg up;

openkiosk-checkout:
	@if [ ! -d mozilla/openkiosk ]; then \
	  git clone $(GIT_OK_SRC_URL) mozilla/openkiosk/; \
	  git config --global credential.helper store; \
	fi

mozconfig:
	echo '# OKCD Release Build' > $(MOZ_CONFIG);
  ifeq ($(OS_ARCH),Linux)
	echo '. $$topsrcdir/openkiosk/config/mozconfig.linux32' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
	echo '# . $$topsrcdir/openkiosk/config/mozconfig.linux64' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
	echo '# . $$topsrcdir/openkiosk/config/mozconfig.linux32.arm' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
  else
    ifeq ($(OS_ARCH),Darwin)
	echo '. $$topsrcdir/openkiosk/config/mozconfig.mac' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
    else
	echo '. $$topsrcdir/openkiosk/config/mozconfig.win' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
	echo '# . $$topsrcdir/openkiosk/config/mozconfig.win64' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
    endif
  endif
	echo '# OKCD Debug Build' >> $(MOZ_CONFIG);
  ifeq ($(OS_ARCH),Linux)
	echo '# . $$topsrcdir/openkiosk/config/mozconfig.debug.'$(OS_ARCH) >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
  else
    ifeq ($(OS_ARCH),Darwin)
	echo '# . $$topsrcdir/openkiosk/config/mozconfig.debug.mac' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
    else
	echo '# . $$topsrcdir/openkiosk/config/mozconfig.debug.WINNT' >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
    endif
  endif
	echo '# Vanilla Firefox Release Build' >> $(MOZ_CONFIG);
  ifeq ($(OS_ARCH),Linux)
	echo '# . $$topsrcdir/browser/config/mozconfigs/linux32/release' >> $(MOZ_CONFIG);
  else
    ifeq ($(OS_ARCH),Darwin)
	echo '# . $$topsrcdir/browser/config/mozconfigs/macosx-universal/release' >> $(MOZ_CONFIG);
    else
	echo '# important comment out reference to "mozconfig.vs2013-win64" in win32/commmon-opt' >> $(MOZ_CONFIG);
	echo '# it has mozilla specific build paths that will break this build' >> $(MOZ_CONFIG);
	echo '# . $$topsrcdir/browser/config/mozconfigs/win32/nightly' >> $(MOZ_CONFIG);
    endif
  endif
	echo  '# mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/../opt-vanilla-@CONFIG_GUESS@' >> $(MOZ_CONFIG);
	echo  '# ac_add_options --disable-tests' >> $(MOZ_CONFIG);

ifeq ($(OS_ARCH),Linux)
mozconfig-linux64:
	echo '# OKCD Linux 64 bit Release Build' > $(MOZ_CONFIG);
	echo '. $$topsrcdir/kiosk/config/mozconfig.'$(OS_ARCH)_64 >> $(MOZ_CONFIG);
	echo  >> $(MOZ_CONFIG);
endif

mozconfig-pi:
  ifeq ($(OS_ARCH),Linux)
	echo '# OKCD RasPi Build' > $(MOZ_CONFIG);
	echo '. $$topsrcdir/openkiosk/config/mozconfig.linux.pi' >> $(MOZ_CONFIG);
  endif

patch: 
ifeq (Windows_NT,$(OS))
	dos2unix $(PATCH);
endif
	# remove added webild file if it exists so patch can apply
	cd mozilla; rm -f dom/webidl/OpenKiosk.webidl toolkit/components/pdfjs/content/web/images/home.svg;
	cd mozilla; patch -p1 -i ../$(PATCH);
	cd mozilla; \
	hg add dom/webidl/OpenKiosk.webidl; \
	hg add toolkit/components/pdfjs/content/web/images/home.svg;

repatch: cleanpatch patch 

cleanpatch: 
	@cd mozilla; hg update -C; hg up $(TARGET_REV);

custom-patch:
	@sed -e"s:'browser', :'browser', 'openkiosk', :g" mozilla/toolkit/components/search/moz.build > /tmp/moz.build.modified; \
	mv /tmp/moz.build.modified mozilla/toolkit/components/search/moz.build;

test-patch:
	cd mozilla; patch --dry-run -s -p1 < ../openkiosk-core-changes.patch;

build: bundle-checkout patch mozconfig
	mv openkiosk mozilla;
	cd mozilla; ./mach build;
	
src: package-src

package-src:
	@echo "Packaging source code...";   \
	rm -f $(SRC_TARBALL);               \
	cd  /tmp/;                          \
	rm -rf okcd;                        \
	git clone $(GIT_OK_OKCD_URL);       \
	cd okcd;                            \
	rm -rf .git*;                       \
	git clone $(GIT_OK_SRC_URL);        \
	rm -rf openkiosk/.git*;
	cd /tmp; tar cfj $(SRC_TARBALL) okcd/;
	mv /tmp/$(SRC_TARBALL) . ;
	rm -rf /tmp/okcd;

hgignore:
	@echo openkiosk >> mozilla/.hgignore

hgrc:
	@echo "[paths]" > mozilla/.hg/hgrc;
	echo  "default = https://hg.mozilla.org/releases/mozilla-esr91/" >> mozilla/.hg/hgrc;

help:
	@echo build targets: checkout mercurial-checkout mozilla-checkout openkiosk-checkout jslib-checkout mozconfig patch repatch cleanpatch test package-src build test-patch

test:
	@echo $(OS);

