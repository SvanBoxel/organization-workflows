# Organization workflows app

This GitHub app allows you to centrally manage and run multiple [GitHub Actions](https://github.com/features/actions) workflows across multiple repositories. Currently this is a limitation in GitHub Actions, as it only allows you to configure and manage Actions workflows on a repository level. This app helps you - for example - to centrally define central workflows for linting, compliance checks, and more.

## Installation
You can install the app by [clicking here](https://github.com/apps/organization-workflows-production). Make sure you install it on all repositories:
<img width="400" alt="Screenshot 2020-12-18 at 17 12 00" src="https://user-images.githubusercontent.com/24505883/102635920-4247eb80-4154-11eb-9ec2-0cb8bc58196c.png">

If you don't want to install it on all repositories, then make sure to at least include the `.github` repository of your organization. 

<img width="400" alt="Screenshot 2020-12-18 at 17 14 27" src="https://user-images.githubusercontent.com/24505883/102636098-81763c80-4154-11eb-80f5-50e21b33020f.png">

After you've installed the app, you can create a centrally managed workflow. There are a couple of things to keep in mind when you do this: 

### Listening to the right event
This app dispatches workflow runs with the `repository_dispatch` event and the `org-workflow-bot` type. Create a new workflow in the `.github` repository with the yml definition below:

```yml
name: compliance-check 

on:
  repository_dispatch:
    types: [org-workflow-bot]  # <-- requirement to trigger central workflows 
```

### Registering the run
To let this app keep track of Action runs and expose this information back to the original commit in the source repository it needs to register the workflow run. Like in the example below, start the workflow by registering the run. After this you can add your steps and jobs like you would in a typical Actions workflow.

```yml
name: compliance-check 

on:
  repository_dispatch:
    types: [org-workflow-bot]  
   
jobs:
  register-and-lint:
    runs-on: ubuntu-latest
    steps:
    - uses: SvanBoxel/organization-workflow@master
      with:
        id: ${{ github.event.client_payload.id }}
        callback_url: ${{ github.event.client_payload.callback_url }}
        sha: ${{ github.event.client_payload.sha }}
        run_id: ${{ github.run_id }}
        name: ${{ github.workflow }} # Default: name of workflow. This name is shown with the check, but can be changed.

# ... the checks and jobs that need to happen in your workflow.
``` 
Make sure to not change the `id`, `callback_url`, `sha`, and `run_id`. The `name` argument is shown next to the check on the original commit and can be changed. (default is the name of the workflow)

<img width="500" alt="Screenshot 2020-12-22 at 10 05 34" src="https://user-images.githubusercontent.com/24505883/102870418-479b8380-443d-11eb-9fe7-ea78a20a09fb.png"> 

_(☝ source repository)_

[More information about the available input for the action](#action-inputs). 

> 👀 Optional: If you don't register the run, the workflow is triggered without providing information to the user that pushed the commit like in the image above. You can still manually provide this information using one of the [Check Actions](https://github.com/marketplace?type=actions&query=checks) that is available in the GitHub Marketplace. 

### Checking out code
Because the [GITHUB_SECRET](https://docs.github.com/en/free-pro-team@latest/actions/reference/authentication-in-a-workflow#about-the-github_token-secret) is scoped to the repository it is running in, you need to leverage the GitHub App to get access to the repository that triggered the workflow. You can use the repository, ref, and token that is supplied in the dispatch payload by the app for this:

```yml
    - name: Checkout
      uses: actions/checkout@v2.3.4
      with:
        repository: ${{ github.event.client_payload.repository.full_name }}
        ref: ${{ github.event.client_payload.sha }}
        token: ${{ github.event.client_payload.token }}
    - name: Markdown Lint  
```

> ❗ The token in the dispatch payload is redacted in the workflow logs and cannot be used by users that only have read access to the `.github` repository. Any user who has _push access to the main branch of the `.github` repository_ can however use this token in a workflow and execute commands that are within the scope of this application. (See [App permissions](#app-permission))

### 🚀
You're ready to go! A full example of a centralized workflow can be found here, an example organization that uses this here, and the video below explains from start to end how to set this up yourself. 

// todo

### App permissions
This app needs the following permissions:

- **Repository admimistration**: To set or enforce protected branch settings.
- **Checks**: To interact with the checks API.
- **Contents**: To checkout the code in a workflow run.
- **Metadata**: To retrieve repository metadata information.

## How it works
When installed in an organization, the app's logic is triggered by any `push` event. When this happens, the app collects all relevant information and [dispatches](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#repository_dispatch) this to the `.github` repository of your organization. Here, all central workflow files configured with the `repository_dispatch` event and `org-workflow-bot` type are triggered.

```yml
name: compliance-check

on:
  repository_dispatch:
    types: [org-workflow-bot]  
```

## Development
## Codespaces
// todo
## Setup

```sh
# Install dependencies
npm install

# Run with hot reload
npm run build:watch

# Compile and run
npm run build
npm run start
```

## Contributing

If you have suggestions for how this GitHub app could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Sebass van Boxel <hello@svboxel.com>

