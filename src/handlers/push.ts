import { Context } from 'probot' // eslint-disable-line @typescript-eslint/no-unused-vars
import Run from '../models/runs.model'
import { organization_repository, app_route } from "../constants";

export const repository_dispatch_type = 'org-workflow-bot'

async function handlePush(context: Context): Promise<void> {
  const sha = context.payload.after
  const webhook = await context.octokit.apps.getWebhookConfigForApp()
  const token = await context.octokit.apps.createInstallationAccessToken({ installation_id: context?.payload?.installation?.id || 0 })

  const data = {
    sha,
    callback_url: `${webhook.data.url}${app_route}/register`,
    repository: {
      owner: context.payload.repository.owner.login,
      name: context.payload.repository.name,
      full_name: context.payload.repository.full_name
    }
  }

  console.log('saving run...', data);
  const run = new Run(data);
  const { _id } = await run.save()
  console.log('saved run...', _id);

  await context.octokit.repos.createDispatchEvent({
    owner: context.payload.repository.owner.login,
    repo: organization_repository,
    event_type: repository_dispatch_type,
    client_payload: {
      id: _id.toString(),
      ...data,
      token: token.data.token
    }
  })
}

export default handlePush;