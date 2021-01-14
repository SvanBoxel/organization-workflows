import { Context } from 'probot' // eslint-disable-line @typescript-eslint/no-unused-vars
import Runs from '../models/runs.model'
 
async function handleCompletedRun(context: Context): Promise<void> {
  if (!context.payload.workflow_run.id) return;
  const run = await Runs.findOne({ 'checks.run_id': { $in: context.payload.workflow_run.id }})

  if (!run) return
  if (context.payload.repository.name !== run.config.workflows_repository) return
  
  const check = run.checks.find((check) => check.run_id === context.payload.workflow_run.id )
  if (!check) return;

  const data: any = {
    owner: run.repository.owner,
    repo: run.repository.name,
    check_run_id: check.checks_run_id,
    name: `${check.name}`,
    status: context.payload.workflow_run?.status,
    conclusion: context.payload.workflow_run?.conclusion
  }

  await context.octokit.checks.update(data)
}

export default handleCompletedRun;