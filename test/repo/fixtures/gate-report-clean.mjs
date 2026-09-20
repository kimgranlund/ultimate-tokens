// gate-report-clean.mjs -- synthetic "gate file" for test/repo/gate-report.mjs's meta-test
// (#699 F1, assertion a). Never imported or executed; gateReport()'s siteNamesIn() only reads
// this file's TEXT via a regex to find FAIL(...) call sites, exactly as it does for a real gate
// file. Every name below has exactly one matching declared entry in the meta-test, on purpose --
// this fixture stays report-static-clean so assertion (a) exercises only the runtime union-print
// path (an undeclared name that fires at runtime, never mentioned in this file at all), with no
// static site/declared mismatch noise from this fixture mixed in.
function FAIL(name, msg) {}
FAIL("known-gate", "message");
