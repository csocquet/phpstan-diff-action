"use strict";

import * as core from '@actions/core';
import * as phpstan from './phpstan';

try {
    const oldReportPath = core.getInput('old-report', {trimWhitespace: true});
    const oldReport = phpstan.readJsonReport(oldReportPath);

    const newReportPath = core.getInput('new-report', {trimWhitespace: true});
    const newReport = phpstan.readJsonReport(newReportPath);

    let resolvedErrors = oldReport.diff(newReport);
    if (resolvedErrors.totals.file_errors > 0) {
        core.info(`PHPStan found ${resolvedErrors.totals.file_errors} resolved errors`);
        core.startGroup('Resolved errors');
        for (let error of resolvedErrors.getIterator()) {
            core.info(`- ${error.file}[${error.line}]: ${error.message}`);
        }
        core.endGroup();
    }

    let newErrors = newReport.diff(oldReport);
    if (newErrors.totals.file_errors > 0) {
        core.setFailed(`PHPStan found ${newErrors.totals.file_errors} new errors`);
        core.startGroup('New errors');
        for (let error of newErrors.getIterator()) {
            core.error(error.message, {file: error.file, startLine: error.line});
        }
        core.endGroup();
    }

} catch (err: any) {
    core.setFailed(err);
}