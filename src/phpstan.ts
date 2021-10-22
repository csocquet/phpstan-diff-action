"use strict";

import * as fs from 'fs';

type FilePath = string;

export type PHPStanReport = {
    totals: {
        errors: number;
        file_errors: number;
    };
    files: {
        [file: FilePath]: {
            errors: number;
            messages: Array<{
                message: string;
                line: number;
                ignorable: boolean;
            }>
        }
    };

    errors: Array<string>;
}

export type FileError = {
    file: FilePath;
    message: string;
    line: number;
    ignorable: boolean;
}

export class Report {

    get totals() {
        return this.report.totals
    };

    get files() {
        return this.report.files;
    }

    get errors() {
        return this.report.errors;
    }

    static newEmpty(): Report {
        return new Report({
            totals: {
                errors: 0,
                file_errors: 0
            },
            files: {},
            errors: []
        });
    }

    constructor(private report: PHPStanReport) {}

    public* getIterator(): Generator<FileError> {
        for (let path in this.report.files) {
            for (let message of this.report.files[path].messages) {
                yield {file: path, ...message};
            }
        }
    }

    public hasError(error: FileError): boolean {
        if (!(error.file in this.report.files)){
            return false;
        }

        for (let message of this.report.files[error.file].messages) {
            if (message.line === error.line && message.ignorable === error.ignorable  && message.message === error.message) {
                return true;
            }
        }

        return false;
    }

    public addError(error: FileError): this {

        if (!(error.file in this.report.files)){
            this.report.files[error.file] = {errors: 0, messages: []};
        }

        this.report.totals.file_errors++;
        this.report.files[error.file].errors++;
        this.report.files[error.file].messages.push({
            line: error.line,
            message: error.message,
            ignorable: error.ignorable
        });

        return this;
    }

    public diff(report: Report): Report {
        let diff = Report.newEmpty();

        for (let error of this.getIterator()) {
            if (!report.hasError(error)) {
                diff.addError(error);
            }
        }

        return diff;
    }
}


export function readJsonReport(path: FilePath): Report {
    return new Report(
        JSON.parse(
            fs.readFileSync(path).toString()
        )
    );
}