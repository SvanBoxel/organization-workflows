import { Context } from 'probot' // eslint-disable-line @typescript-eslint/no-unused-vars
import pick from "lodash.pick"

import Run from '../models/runs.model'
import { default_organization_repository, app_route, config_keys } from "../constants";

export const repository_dispatch_type = 'org-workflow-bot'
export const config_path = 'organization-workflows-settings.yml'

async function handlePush(context: Context): Promise<void> {
  const { config } = await context.octokit.config.get({
    owner: context.payload.repository.owner.login,
    repo: default_organization_repository,
    path: config_path,
    defaults: {
      workflows_repository: default_organization_repository,
    }
  });

  const sha = context.payload.after
  const webhook = await context.octokit.apps.getWebhookConfigForApp()
  const token = await context.octokit.apps.createInstallationAccessToken({ 
    installation_id: context?.payload?.installation?.id || 0,
    repository_ids: [context.payload.repository.id] 
  })

  const data = {
    sha,
    callback_url: `${webhook.data.url}${app_route}/register`,
    repository: {
      owner: context.payload.repository.owner.login,
      name: context.payload.repository.name,
      full_name: context.payload.repository.full_name
    }
  }
  
  const run = new Run({
    ...data,
    checks: [],
    config: pick(config, config_keys)
  });
  
  const { _id } = await run.save()

  await context.octokit.repos.createDispatchEvent({
    owner: context.payload.repository.owner.login,
    repo: config.workflows_repository,
    event_type: repository_dispatch_type,
    client_payload: {
      id: _id.toString(),
      ...data,
      token: token.data.token
    }
  })
}

export default handlePush;