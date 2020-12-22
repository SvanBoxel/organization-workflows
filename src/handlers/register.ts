import { Probot } from 'probot' // eslint-disable-line @typescript-eslint/no-unused-vars
import { Request, Response } from "express";

import Runs, { ICheck } from '../models/runs.model'
import enforceProtection from '../utils/enforce-protection'
import { organization_repository, github_host } from "../constants";

async function handleRegister(
  req: Request, 
  res: Response, 
  { app }: { app: Probot}
): Promise<any> {
  const { id, run_id, name, sha, require, enforce_admin, documentation } = req.query
  const run = await Runs.findById(id);
  
  if (!run) return res.sendStatus(404)
  if (run.sha !== sha) return res.sendStatus(404) // Although unlikely, make sure that people can't create checks by submitting random IDs (mongoose IDs are not-so-random)

  const data: any = {
    owner: run.repository.owner,
    repo: run.repository.name,
    head_sha: run.sha,
    name: name as string,
    details_url: `${github_host}/${run.repository.owner}/${organization_repository}/actions/runs/${run_id}`,
    status: 'in_progress'
  }

  let octokit = await app.auth()
  const installation = await octokit.apps.getOrgInstallation({ org: run.repository.owner })
  octokit = await app.auth(installation.data.id)

  if (documentation) {
    try {
      const docs = await octokit.repos.getContent({
        owner: run.repository.owner,
        repo: organization_repository,
        path: documentation as string
      })

      const summary = Buffer.from((docs.data as any).content, (docs.data as any).encoding).toString()
      data.output = { title: name, summary }
    } catch (e) {
      // console.error(e)
    }
  }

  const checks_run = await octokit.checks.create(data)

  if (require === 'true') {
    enforceProtection(
      octokit,
      { owner: run.repository.owner, repo: run.repository.name },
      data.name,
      enforce_admin === 'true'
    )
  }
  
  const checkInfo: ICheck = {
    name: data.name,
    run_id: Number(run_id),
    checks_run_id: checks_run.data.id
  };

  await Runs.findByIdAndUpdate(
    id, 
    { $push: { checks: checkInfo } }
  )

  return res.sendStatus(200)
}

export default handleRegister