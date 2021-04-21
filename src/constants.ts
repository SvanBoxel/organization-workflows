import { getEnv } from './utils/env-vars';

export const github_host = getEnv('GITHUB_HOST') ?? 'https://github.com'
export const default_organization_repository = getEnv('DEFAULT_ORGANIZATION_REPOSITORY') ?? '.github'
export const app_route = getEnv('APP_ROUTE') ?? '/org-workflows'
export const config_keys = ['workflows_repository']
