import * as fs from 'fs';

let envVars: any;

export const getEnv = (name: string): string | undefined => {
    if (process.env.envVarsJsonFilePath) {
        envVars = JSON.parse(fs.readFileSync(process.env.envVarsJsonFilePath).toString())
    }

    return envVars ? envVars[name] ?? process.env[name] : process.env[name];
}