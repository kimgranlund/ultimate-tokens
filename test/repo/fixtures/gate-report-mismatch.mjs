// gate-report-mismatch.mjs -- synthetic "gate file" for test/repo/gate-report.mjs's meta-test
// (#699 F1, assertions b and c). Never imported or executed; gateReport()'s siteNamesIn() only
// reads this file's TEXT via a regex to find FAIL(...) call sites, exactly as it does for a real
// gate file. Two deliberate mismatches live here, each exercised by a separate assertion:
//   - "real-site" has a call site below, but the meta-test's declared list omits it
//     (assertion c: a call site not declared reds report-static).
//   - "phantom-declared" is declared by the meta-test but never called anywhere in this file
//     (assertion b: a declared name with no call site reds report-static).
// Do not add, remove, or rename the FAIL(...) call below without updating gate-report.mjs's
// test expectations to match.
function FAIL(name, msg) {}
FAIL("real-site", "message");
