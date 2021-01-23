module.exports = async (APP_ID, TEST_ORG, { github, core }, { repository, shouldRun = true } = {}) => {
  const repoName = repository || Math.random().toString(36).substring(7);
  const buffer = new Buffer('Test commit');
  const content = buffer.toString('base64');

  // Create repository
  console.log('creating repository...', repoName)
  await github.repos.createInOrg({
    org: TEST_ORG,
    name: repoName
  });
  
  // Push content
  console.log('creating and pushing commit...')
  const result = await github.repos.createOrUpdateFileContents({
    owner: TEST_ORG,
    repo: repoName,
    path: "test-file.md",
    message: "Test commit for https://github.com/SvanBoxel/organization-workflows",
    content: content,
    commiter: {
      name: "github-actions[bot]",
      email: "github-actions[bot]@users.noreply.github.com"
    }
  });
  
  // Wait 45 seconds
  console.log('Waiting for run...')
  await new Promise(r => setTimeout(r, 60000));
  
  // Check whether commit check is created
  console.log('Checking result...')
  const checkResult = await github.checks.listForRef({
    owner: TEST_ORG,
    repo: repoName,
    ref: result.data.commit.sha
  });
  
  // Delete repository
  console.log('Deleting result...')
  github.repos.delete({
    owner: TEST_ORG,
    repo: repoName
  });
  
  const foundCheckRun = checkResult.data.check_runs.some(check => check.app.id === APP_ID);
  // Check whether check is created by this app

  if(shouldRun && !foundCheckRun) {
    core.setFailed(`central workflow wasn't triggered, repo: ${repoName}`);
  }

  if(!shouldRun && foundCheckRun) {
    core.setFailed(`central workflow was triggered (while is shouldn't), repo: ${repoName}`);
  }
}
