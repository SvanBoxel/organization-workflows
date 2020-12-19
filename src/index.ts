import { Probot } from 'probot' // eslint-disable-line @typescript-eslint/no-unused-vars
import enforceProtection from './enforce-protection'

import mongoose from 'mongoose'
import Runs from './runs.model'

const repository_dispatch_type = 'org-workflow-bot'
const organization_repository = '.github'
const app_route = '/org-workflows'
const mongoUri = process.env.DB_HOST || 'localhost'

mongoose.connect(mongoUri, {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

console.log("DB connection established");

module.exports = (app: Probot, { getRouter }: { getRouter: any }) => {
  const router = getRouter(app_route)

  app.on('push', async (context) => {
    const webhook = await context.octokit.apps.getWebhookConfigForApp()
    const sha = context.payload.after
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

    const { _id } = await Runs.create(data)

    await context.octokit.repos.createDispatchEvent({
      owner: context.payload.repository.owner.login,
      repo: organization_repository,
      event_type: repository_dispatch_type,
      client_payload: {
        id: _id,
        ...data,
        token: token.data.token
      }
    })
  })

  app.on('workflow_run.completed', async (context) => {
    if (context.payload.repository.name !== organization_repository) return

    const run = await Runs.findOne({ 'check.run_id': context?.payload?.workflow_run?.id })
    if (!run) return

    const data: any = {
      owner: run.repository.owner,
      repo: run.repository.name,
      check_run_id: run.check?.checks_run_id,
      name: `${run.check?.name}`,
      status: context.payload.workflow_run?.status,
      conclusion: context.payload.workflow_run?.conclusion
    }

    await context.octokit.checks.update(data)
  })

  app.on('check_run.rerequested', async (context) => {
    const run = await Runs.findOne({ 'check.checks_run_id': context?.payload?.check_run?.id })
    if (!run) return

    return await context.octokit.actions.reRunWorkflow({
      owner: run.repository.owner,
      repo: organization_repository,
      run_id: run?.check?.run_id || 0
    })
  })

  router.get('/register', async (req: any, res: any) => {
    let octokit = await app.auth()
    const installation = await octokit.apps.getOrgInstallation({ org: 'moon-organization' })
    octokit = await app.auth(installation.data.id)

    const { id, run_id, name, sha, require, enforce_admin, documentation } = req.query
    const run = await Runs.findById((req.query.id || '').toString())

    if (!run) return res.sendStatus(404)
    if (run.sha !== sha) res.sendStatus(404) // Although unlikely, make sure that people can't create checks by only submitting random IDs (mongoose IDs are not-so-random)

    const data: any = {
      owner: run.repository.owner,
      repo: run.repository.name,
      head_sha: run.sha,
      name,
      details_url: `https://github.com/${run.repository.owner}/${organization_repository}/actions/runs/${run_id}`,
      status: 'in_progress'
    }


    if (documentation) {
      try {
        const docs = await octokit.repos.getContent({
          owner: run.repository.owner,
          repo: organization_repository,
          path: documentation
        })

        const summary = Buffer.from((docs.data as any).content, (docs.data as any).encoding).toString()
        data.output = { title: name, summary }
      } catch (e) {
        console.error(e)
      }
    }

    const checks_run = await octokit.checks.create(data)

    if (require === 'true') {
      enforceProtection(
        octokit,
        { owner: run.repository.owner, repo: run.repository.name },
        name,
        enforce_admin === 'true'
      )
    }

    await Runs.findByIdAndUpdate(id, {
      check: {
        name,
        run_id: Number(run_id),
        checks_run_id: checks_run.data.id
      }
    })

    res.sendStatus(200)
  })
}
