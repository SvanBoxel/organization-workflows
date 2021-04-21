import * as fs from 'fs';
jest.mock('fs');
const envVarName = 'TEST_ENV';

describe('env vars from json file', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        process.env = {
            [envVarName]: 'test'
        };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    })

    test('no json env var file is found', async () => {
        const getEnv = await (await import('../../src/utils/env-vars')).getEnv;
        expect(getEnv(envVarName)).toEqual('test');
    })

    test('json env var file is found and equal to the regular env vars', async () => {
        const readFileSyncMock = jest.spyOn(fs, 'readFileSync');
        readFileSyncMock.mockImplementation(() => {
            return JSON.stringify({
                [envVarName]: 'test'
            })
        });
        process.env.ENV_VARS_JSON_FILE_PATH = 'envVars.json';
        const getEnv = await (await import('../../src/utils/env-vars')).getEnv;
        expect(getEnv(envVarName)).toEqual('test');
    })

    test('json env var file is found and not equal to the regular env vars', async () => {
        const readFileSyncMock = jest.spyOn(fs, 'readFileSync');
        readFileSyncMock.mockImplementation(() => {
            return JSON.stringify({
                [envVarName]: 'test1'
            })
        });
        process.env.ENV_VARS_JSON_FILE_PATH = 'envVars.json';
        const getEnv = await (await import('../../src/utils/env-vars')).getEnv;
        expect(getEnv(envVarName)).toEqual('test1');
    })
});