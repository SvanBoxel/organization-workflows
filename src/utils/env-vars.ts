import * as fs from 'fs';

let envVars: Map<string, string>;

export const getEnv = (name: string): string | undefined => {
    if (process.env.envVarsJsonFilePath) {
        envVars = JSON.parse(fs.readFileSync(process.env.envVarsJsonFilePath).toString())
    }

    return envVars.get(name) ?? process.env[name];
}