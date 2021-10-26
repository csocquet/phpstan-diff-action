"use strict";

import * as core from '@actions/core';
import * as phpstan from './phpstan';
import * as fs from "fs";

export default async function main() {
    try {
        await run();
    } catch (err: any) {
        core.setFailed(err.message);
    }
}

export async function run() {
    const originReportPath = core.getInput('origin_report', {trimWhitespace: true});
    if (!originReportPath) {
        throw new Error('Origin report path is required');
    }

    try {
        fs.accessSync(originReportPath, fs.constants.R_OK);
    } catch (err) {
        throw new Error('Origin report is not accessible for read');
    }

    const newReportPath = core.getInput('new_report', {trimWhitespace: true});
    if (!newReportPath) {
        throw new Error('New report path is required');
    }

    try {
        fs.accessSync(newReportPath, fs.constants.R_OK);
    } catch (err) {
        throw new Error('New report is not accessible for read');
    }

    const oldReport = phpstan.readJsonReport(originReportPath);
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
}

main();