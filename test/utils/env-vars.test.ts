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
        const getEnv = await (await import('../../src/utils/env-vars')).getEnv;
        process.env[envVarName] = 'test';
        expect(getEnv(envVarName)).toEqual('test');
    })

    test('json env var file is found and not equal to the regular env vars', async () => {
        const getEnv = await (await import('../../src/utils/env-vars')).getEnv;
        process.env[envVarName] = 'test1';
        expect(getEnv(envVarName)).toEqual('test1');
    })
});