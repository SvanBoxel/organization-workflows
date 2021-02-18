import { Context } from 'probot' // eslint-disable-line @typescript-eslint/no-unused-vars

async function enforceProtection (
  octokit: Context['octokit'],
  repository: { owner: string, repo: string },
  context_name: string,
  enforce: boolean,
  enforce_admin = false
): Promise<boolean> {
  const repo = await octokit.repos.get({
    ...repository,
    mediaType: {
      previews: ['symmetra']
    }
  })
  
  let protection: any;

  try {
    protection = await octokit.repos.getBranchProtection({
      ...repository,
      branch: repo.data.default_branch
    })
  } catch (e) {
    console.error(e)
  }

  const contexts = protection.data.required_status_checks.contexts;
  const enforce_admins_current_setting = protection && protection.data.enforce_admins.enabled
  const adminForceChange = enforce_admins_current_setting !== enforce_admin
  const contextIndex = contexts.indexOf(context_name)

  // noop actions
  if (!adminForceChange) { // Admin enforce didn't change
    if (contextIndex > -1 && enforce) return false; // Context is already enforced
    if (contextIndex === -1 && !enforce) return false; // Context isn't enforced and shouldn't be.
  }

  if (contextIndex > -1 && !enforce) {
    contexts.splice(contextIndex, 1);
  } else if (contextIndex === -1 && enforce) {
    contexts.push(context_name)
  }

  await octokit.repos.updateBranchProtection({
    ...repository,
    branch: repo.data.default_branch,
    required_status_checks: {
      strict: protection ? protection.data.required_status_checks.strict : false,
      contexts
    },
    enforce_admins: adminForceChange ? !enforce_admins_current_setting : enforce_admins_current_setting,
    required_pull_request_reviews: protection?.data?.required_pull_request_reviews ? {
      dismiss_stale_reviews: protection ? protection.data.required_pull_request_reviews.dismiss_stale_reviews : false,
      require_code_owner_reviews: protection ? protection.data.required_pull_request_reviews.require_code_owner_reviews : 0
    } : null,
    required_linear_history: protection && protection.data.required_linear_history.enabled,
    allow_force_pushes: protection && protection.data.allow_force_pushes.enabled,
    allow_deletions: protection && protection.data.allow_deletions.enabled,
    restrictions: null
  })

  return true;
}

export default enforceProtection
