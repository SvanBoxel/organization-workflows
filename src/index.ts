import { Probot } from "probot" 
import { uuid } from 'uuidv4';
import enforceProtection from './enforce-protection';

const repository_dispatch_type = 'org-workflow-bot';
const organization_repository = '.github';
const app_route = "/org-workflows";

let runs: {[key: string]: {
  id: string;
  sha: string;
  callback_url: string;
  check?: {
    run_id: number; // The run in the central workflow
    name?: string; // Name of the status check
    checks_run_id: number; // ID of status check on commit
  }
  repository: {
    owner: string;
    name: string;
    full_name: string;
  }
}} = {}

module.exports = (app: Probot, { getRouter }: { getRouter: any }) => {
  const router = getRouter(app_route);

  app.on('push', async (context) => {
    const webhook = await context.octokit.apps.getWebhookConfigForApp();
    
    const id = uuid();
    const sha = context.payload.after;

    runs[id] = {
      id,
      sha,
      callback_url: `${webhook.data.url}${app_route}/register`,
      repository: {
        owner: context.payload.repository.owner.login,
        name: context.payload.repository.name,
        full_name: context.payload.repository.full_name
      },
    };

    await context.octokit.repos.createDispatchEvent({
      owner: context.payload.repository.owner.login,
      repo: organization_repository,
      event_type: repository_dispatch_type,
      client_payload: runs[id]
    });
  })

  app.on('workflow_run.completed', async (context) => {
    if (context.payload.repository.name !== organization_repository) return;
    
    const id = Object.keys(runs).find(key => {
      runs[key].check?.run_id === context?.payload?.workflow_run?.id
    }) || 0;

    if (!id) return;
    context.log('finishing check...', id);

    const data: any = {
      owner: runs[id].repository.owner,
      repo: runs[id].repository.name,
      check_run_id: runs[id].check?.checks_run_id,
      name: `${runs[id].check?.name}`,
      status: context.payload.workflow_run?.status,
      conclusion: context.payload.workflow_run?.conclusion
    }

    await context.octokit.checks.update(data)

    context.log(`${Object.keys(runs).length} runs in memory`);
  })
  
  router.get("/register", async (req: any, res: any) => {
    console.log(req.query)
    let octokit = await app.auth()
    const installation = await octokit.apps.getOrgInstallation({ org: 'moon-organization' })
    octokit = await app.auth(installation.data.id)

    let id = (req.query.id || "").toString();
    let run_id = req.query.run_id
    let name = req.query.name
    let require = req.query.require === 'true'
    let enforce_admin = req.query.enforce_admin === 'true'

    console.log('registering check')
    const checks_run = await octokit.checks.create({
      owner: runs[id].repository.owner,
      repo: runs[id].repository.name,
      head_sha: runs[id].sha,
      name,
      details_url: `https://github.com/${runs[id].repository.owner}/${organization_repository}/actions/runs/${run_id}`,
      status: 'in_progress'
    })

    if (require) {
      enforceProtection(
        octokit, 
        { owner: runs[id].repository.owner, repo: runs[id].repository.name},
        name, 
        enforce_admin
      ) 
    }

    runs[id] = {
      ...runs[id],
      check: {
        ...runs[id].check,
        name,
        run_id: Number(run_id),
        checks_run_id: checks_run.data.id
      }
    }

    res.sendStatus(200);
  });
}
