import { getEnv } from '../../src/utils/env-vars';
const envVarName = 'TEST_ENV';

describe('env vars from json file', () => {
    beforeEach(async () => {
        process.env[envVarName] = 'test'
    });

    describe('no json env var file is found', () => {
        expect(getEnv(envVarName)).toEqual('test');
    })

    describe('json env var file is found and equal to the regular env vars', () => {
        process.env[envVarName] = 'test';
        expect(getEnv(envVarName)).toEqual('test');
    })

    describe('json env var file is found and not equal to the regular env vars', () => {
        process.env[envVarName] = 'test1';
        expect(getEnv(envVarName)).toEqual('test1');
    })
});