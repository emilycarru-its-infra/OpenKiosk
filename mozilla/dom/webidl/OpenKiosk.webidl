/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

[JSImplementation="@mozilla.org/openkioskdom;1", Exposed=Window]
interface IOpenKiosk
{
  undefined quit();
  undefined settings();
  readonly attribute boolean PDFDownloadEnabled;
  readonly attribute boolean fullscreenEnabled;
};

