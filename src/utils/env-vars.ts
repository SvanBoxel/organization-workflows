import * as fs from 'fs';

let envVars: any;

export const getEnv = (name: string): string | undefined => {
    if (process.env.ENV_VARS_JSON_FILE_PATH) {
        envVars = JSON.parse(fs.readFileSync(process.env.ENV_VARS_JSON_FILE_PATH).toString())
    }

    return envVars ? envVars[name] ?? process.env[name] : process.env[name];
}