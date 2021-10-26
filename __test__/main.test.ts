import main from "../src/main";

import * as core from '@actions/core';
import * as path from "path";

describe('Test with invalid inputs', () => {
    const initialEnv = process.env;

    beforeEach(() => {
        process.env = {...initialEnv};
        jest.resetModules();
    })

    afterAll(() => {
        process.env = initialEnv;
        jest.resetModules();
    })

    it('should failed with empty origin report', async () => {
        const coreSpy: jest.SpyInstance = jest.spyOn(core, 'setFailed');
        process.env['INPUT_NEW_REPORT']=path.join(__dirname, 'reports', 'new-a.json');

        await main();
        expect(coreSpy).toHaveBeenCalledWith("Origin report path is required");
    });

    it('should failed with empty new report', async () => {
        const coreSpy: jest.SpyInstance = jest.spyOn(core, 'setFailed');
        process.env['INPUT_ORIGIN_REPORT']=path.join(__dirname, 'reports', 'origin.json');

        await main();
        expect(coreSpy).toHaveBeenCalledWith("New report path is required");
    });

    it('should failed with inaccessible origin report', async () => {
        const coreSpy: jest.SpyInstance = jest.spyOn(core, 'setFailed');
        process.env['INPUT_ORIGIN_REPORT']=path.join(__dirname, 'reports', 'origin-not-accessible.json');
        process.env['INPUT_NEW_REPORT']=path.join(__dirname, 'reports', 'new-a.json');

        await main();
        expect(coreSpy).toHaveBeenCalledWith("Origin report is not accessible for read");
    });

    it('should failed with inaccessible new report', async () => {
        const coreSpy: jest.SpyInstance = jest.spyOn(core, 'setFailed');
        process.env['INPUT_ORIGIN_REPORT']=path.join(__dirname, 'reports', 'origin.json');
        process.env['INPUT_NEW_REPORT']=path.join(__dirname, 'reports', 'new-not-accessible.json');

        await main();
        expect(coreSpy).toHaveBeenCalledWith("New report is not accessible for read");
    });
});

describe('Test actions outputs', () => {
    const initialEnv = process.env;

    beforeEach(() => {
        process.env = {...initialEnv};
        jest.resetModules();
    })

    afterAll(() => {
        process.env = initialEnv;
        jest.resetModules();
    })

    it('should find nothing on identical reports', async () => {
        const coreInfoSpy: jest.SpyInstance = jest.spyOn(core, 'info');
        const coreErrorSpy: jest.SpyInstance = jest.spyOn(core, 'error');
        const coreFailedSpy: jest.SpyInstance = jest.spyOn(core, 'setFailed');

        process.env['INPUT_ORIGIN_REPORT'] = path.join(__dirname, 'reports', 'origin.json');
        process.env['INPUT_NEW_REPORT'] = path.join(__dirname, 'reports', 'origin.json');

        await main();

        expect(coreInfoSpy).not.toBeCalled();
        expect(coreErrorSpy).not.toBeCalled();
        expect(coreFailedSpy).not.toBeCalled();
    });

    it('should find resolved errors', async () => {
        const coreInfoSpy: jest.SpyInstance = jest.spyOn(core, 'info');
        const coreErrorSpy: jest.SpyInstance = jest.spyOn(core, 'error');
        const coreFailedSpy: jest.SpyInstance = jest.spyOn(core, 'setFailed');

        process.env['INPUT_ORIGIN_REPORT'] = path.join(__dirname, 'reports', 'origin.json');
        process.env['INPUT_NEW_REPORT'] = path.join(__dirname, 'reports', 'new-a.json');

        await main();

        expect(coreInfoSpy).toHaveBeenCalledWith('PHPStan found 3 resolved errors');
        expect(coreInfoSpy).toHaveBeenCalledWith('- ClassA.php[1]: Error #1 on ClassA');
        expect(coreInfoSpy).toHaveBeenCalledWith('- ClassA.php[2]: Error #2 on ClassA');
        expect(coreInfoSpy).toHaveBeenCalledWith('- ClassB.php[2]: Error #2 on ClassB');

        expect(coreErrorSpy).not.toBeCalled();
        expect(coreFailedSpy).not.toBeCalled();
    });

    it('should find new errors', async () => {
        const coreInfoSpy: jest.SpyInstance = jest.spyOn(core, 'info');
        const coreErrorSpy: jest.SpyInstance = jest.spyOn(core, 'error');
        const coreFailedSpy: jest.SpyInstance = jest.spyOn(core, 'setFailed');

        process.env['INPUT_ORIGIN_REPORT'] = path.join(__dirname, 'reports', 'origin.json');
        process.env['INPUT_NEW_REPORT'] = path.join(__dirname, 'reports', 'new-b.json');

        await main();

        expect(coreInfoSpy).not.toBeCalled();

        expect(coreFailedSpy).toHaveBeenCalledWith('PHPStan found 3 new errors');
        expect(coreErrorSpy).toHaveBeenCalledWith('Error #3 on ClassC', {file: "ClassC.php", startLine: 3});
        expect(coreErrorSpy).toHaveBeenCalledWith('Error #1 on ClassD', {file: "ClassD.php", startLine: 1});
        expect(coreErrorSpy).toHaveBeenCalledWith('Error #2 on ClassD', {file: "ClassD.php", startLine: 2});
    });
});