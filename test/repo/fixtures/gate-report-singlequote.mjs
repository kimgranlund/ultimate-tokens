// gate-report-singlequote.mjs -- synthetic "gate file" for test/repo/gate-report.mjs's meta-test
// (#699 F2). Never imported or executed; proves LITERAL_CALL resolves a single-quoted FAIL(...)
// first argument the same way it resolves a double-quoted one. Do not add, remove, or rename the
// FAIL(...) call below without updating gate-report.mjs's test expectations to match.
function FAIL(name, msg) {}
FAIL('single-quoted-site', "message");
