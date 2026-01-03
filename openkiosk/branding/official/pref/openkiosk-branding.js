// OPENKISOK CUSTOM BRANDING PREFS

pref("browser.startup.homepage", "https://openkiosk.mozdevgroup.com/");
pref("startup.homepage_override_url", "");
pref("startup.homepage_welcome_url", "https://openkiosk.mozdevgroup.com/faq.html");
pref("startup.homepage_welcome_url.additional", "");

// Interval: Time between checks for a new version (in seconds)
pref("app.update.interval", 43200); // 12 hours
// Give the user x seconds to react before showing the big UI. default=192 hours
pref("app.update.promptWaitTime", 691200);
// app.update.url.manual: URL user can browse to manually if for some reason
// all update installation attempts fail.
// app.update.url.details: a default value for the "More information about this
// update" link supplied in the "An update is available" page of the update
// wizard.
#if MOZ_UPDATE_CHANNEL == beta
  pref("app.update.url.manual", "https://www.mozilla.org/%LOCALE%/firefox/beta");
  pref("app.update.url.details", "https://www.mozilla.org/%LOCALE%/firefox/beta/notes");
  pref("app.releaseNotesURL", "https://www.mozilla.org/%LOCALE%/firefox/%VERSION%beta/releasenotes/?utm_source=firefox-browser&utm_medium=firefox-browser&utm_campaign=whatsnew");
  pref("app.releaseNotesURL.aboutDialog", "https://www.mozilla.org/%LOCALE%/firefox/%VERSION%beta/releasenotes/?utm_source=firefox-browser&utm_medium=firefox-desktop&utm_campaign=about-dialog");
#else
  pref("app.update.url.manual", "https://www.mozilla.org/%LOCALE%/firefox/");
  pref("app.update.url.details", "https://www.mozilla.org/%LOCALE%/firefox/notes");
  pref("app.releaseNotesURL", "https://www.mozilla.org/%LOCALE%/firefox/%VERSION%/releasenotes/?utm_source=firefox-browser&utm_medium=firefox-browser&utm_campaign=whatsnew");
  pref("app.releaseNotesURL.aboutDialog", "https://www.mozilla.org/%LOCALE%/firefox/%VERSION%/releasenotes/?utm_source=firefox-browser&utm_medium=firefox-desktop&utm_campaign=about-dialog");
#endif

// The number of days a binary is permitted to be old
// without checking for an update.  This assumes that
// app.update.checkInstallTime is true.
pref("app.update.checkInstallTime.days", 63);

// Give the user x seconds to reboot before showing a badge on the hamburger
// button. default=4 days
pref("app.update.badgeWaitTime", 345600);

// Number of usages of the web console.
// If this is less than 5, then pasting code into the web console is disabled
pref("devtools.selfxss.count", 0);

/** 
 * BEGIN OPENKIOSK PREFS
 */

// Screens
pref("openkiosk.attractscreen.enabled", false);
pref("openkiosk.attractscreen.url", "https://openkiosk.mozdevgroup.com/attract.html");
pref("openkiosk.attractscreen.url.default", "https://openkiosk.mozdevgroup.com/attract.html");

pref("openkiosk.fullscreen.enabled", false);
pref("openkiosk.fullscreen.url", "");
pref("openkiosk.fullscreen.tabs.enabled", false);

pref("openkiosk.redirectscreen.enabled", false);
pref("openkiosk.redirectscreen.url", "https://openkiosk.mozdevgroup.com/redirect.html");
pref("openkiosk.redirectscreen.url.default", "https://openkiosk.mozdevgroup.com/redirect.html");

// Admin
pref("openkiosk.admin.password", "admin");
pref("openkiosk.admin.mode", false);

/**
 *  Preferences
 */
pref("openkiosk.preferences.selectedTabIndex", 0);
pref("openkiosk.preferences.firstTimeRun", true);

// General
pref("openkiosk.tabs.enabled", true);

// UI
pref("openkiosk.ui.personalbar.enabled", false);
pref("openkiosk.ui.personalbar.bookmarks.enabled", false);
pref("openkiosk.ui.personalbar.bookmarks.context.enable", false);
pref("openkiosk.ui.urlbar.enabled", true);
pref("openkiosk.ui.urlbar.context.enabled", false);
pref("openkiosk.ui.toolbar.context.enabled", true);
pref("openkiosk.ui.context.menu.enabled", true);
pref("openkiosk.ui.context.search.enabled", true);
pref("openkiosk.ui.quit.withpass.enabled", true);
pref("openkiosk.ui.notification.large.enabled", false);
pref("openkiosk.ui.master.zoom.size", "1");
pref("openkiosk.ui.statusbar.enabled", true);

// Filters
pref("openkiosk.filters.enabled", false);
pref("openkiosk.filters.file", "");
pref("openkiosk.filters.whitelist.enabled", true);
pref("openkiosk.filters.protocol.about.enabled", false);
pref("openkiosk.filters.protocol.blob.enabled", true);
pref("openkiosk.filters.protocol.data.enabled", true);
pref("openkiosk.filters.protocol.mailto.enabled", false);
pref("openkiosk.filters.protocol.file.enabled", false);
pref("openkiosk.filters.protocol.ftp.enabled", false);
pref("openkiosk.filters.protocol.res.enabled", false);
pref("openkiosk.filters.protocol.javascript.enabled", false);
pref("openkiosk.filters.protocol.sms.enabled", false);
pref("openkiosk.filters.protocol.tel.enabled", false);
pref("openkiosk.filters.protocol.viewsource.enabled", false);

// session
pref("openkiosk.session.inactiveTerminal.enabled", true);
pref("openkiosk.session.inactiveTerminal.warn.enabled", true);
pref("openkiosk.session.inactiveTerminal.minutes", 5);
pref("openkiosk.session.inactiveTerminal.seconds", 0);
pref("openkiosk.session.inactiveTerminal.warn.seconds", 10);
pref("openkiosk.session.inactiveTerminal.warn.manual.enabled", true);
pref("openkiosk.session.diskcache.enabled", false);
pref("openkiosk.session.history.enabled", false);
pref("openkiosk.session.cookies.enabled", false);
pref("openkiosk.session.aup.enabled", false);
pref("openkiosk.session.aup.url", "chrome://browser/content/AUP.html");
pref("openkiosk.session.aup.accepted", false);

// buttons
pref("openkiosk.reset.buttontext", "Continue Session");

// admin
pref("openkiosk.admin.clearsession.onexit.enabled", true);
pref("openkiosk.admin.externalapps.enabled", false);
pref("openkiosk.admin.multimonitor.enabled", false);

// file upload
pref("openkiosk.file.upload.enabled", false);

// keys
pref("openkiosk.keys.navigation.enabled", true);
pref("openkiosk.keys.settings.enabled", true);
pref("openkiosk.osk.enabled", false);

// downloads
pref("openkiosk.downloads.enabled", false);
pref("openkiosk.pdf.downloads.enabled", false);

// web printing
pref("openkiosk.print.silent.enabled", false);
pref("openkiosk.print.web.enabled", false);
pref("print.always_print_silent", true);

// enable javascript
pref("openkiosk.javascript.enabled", true);

// crypto
pref("openkiosk.crypto.key", "6f2d54080295e91fb151d85acd6885ae");

// about
pref("app.releaseNotesURL", "");
pref("app.vendorURL", "openkiosk.mozdevgroup.com");

// content frame
pref("openkiosk.contentframe.observers.added", false);
pref("openkiosk.content.selection.enabled", true);

