import { Context } from 'probot' // eslint-disable-line @typescript-eslint/no-unused-vars
import Runs from '../models/runs.model'
import { organization_repository } from "../constants";

async function handleReRun(context: Context): Promise<void> {
  if (!context?.payload?.check_run?.id) return

  const run = await Runs.findOne({ 'check.checks_run_id': context.payload.check_run.id })
  if (!run) return

  await context.octokit.actions.reRunWorkflow({
    owner: run.repository.owner,
    repo: organization_repository,
    run_id: run?.check?.run_id || 0
  })
}

export default handleReRun; 