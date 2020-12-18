# Organization workflows app

This GitHub app allows you to centrally manage and run multiple [GitHub Actions](https://github.com/features/actions) workflows across multiple repositories. Currently this is a limitation in GitHub Actions, as it only allows you to configure and manage Actions workflows on a repository level. This app helps you to - for example - define central workflows for linting, compliance checks, and more.

## Installation
You can install the app by clicking here<placeholder_url>. Make sure you install it on all repositories:
<img width="400" alt="Screenshot 2020-12-18 at 17 12 00" src="https://user-images.githubusercontent.com/24505883/102635920-4247eb80-4154-11eb-9ec2-0cb8bc58196c.png">

If you don't want to install it on all repositories, then make sure to at least include the `.github` repository of your organization. 

<img width="400" alt="Screenshot 2020-12-18 at 17 14 27" src="https://user-images.githubusercontent.com/24505883/102636098-81763c80-4154-11eb-80f5-50e21b33020f.png">

After you've installed the app, you can create a centrally managed workflow. There are a couple of things to keep in mind when you do this: 

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

## How it works
When installed in an organization, the app's logic is triggered by any `push` event. When this happens, the app collects all relevant information and [dispatches](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#repository_dispatch) this to the `.github` repository of your organization. Here, all central workflow files configured with the `repository_dispatch` event and `org-workflow-bot` type are triggered.

```yml
name: compliance-check

on:
  repository_dispatch:
    types: [org-workflow-bot]  
```

### Experimental mode
When the workflow run starts, it sends the information back to the app which then sets a [status check](https://docs.github.com/en/free-pro-team@latest/rest/guides/getting-started-with-the-checks-api) with the `in_progress` status and a link to the workflow run on the original commit. 

When the workflow run finishes, the app receives and forwards the status of the workflow on the original commit. 

## How it works
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

If you have suggestions for how central-workflows-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Sebass van Boxel <svboxel@gmail.com>
