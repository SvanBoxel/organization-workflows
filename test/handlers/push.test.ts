import mockingoose from 'mockingoose';
import { Context } from 'probot'
import handlePush from '../../src/handlers/push'
import runsModel from '../../src/models/runs.model';

describe('push handler', () => {
  let event: any
  let context: Context
  let token: string;
  let id: string;
  let callback_url: string;

  beforeEach(async () => {
    id = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    callback_url = 'https://geocities.com'
    token = 'secret42'
    event = {
      id: '123',
      name: 'push',
      payload: {
        ref: "refs/heads/main",
        before: "bc5b6d4f4a5b2eb3d89f52d46d75f2129c63b074",
        after: "89c9e6dc89fce3971570dba9b07052973bff7e13",
        repository: {
          id: 33241,
          name: 'rudolph',
          full_name: 'santa/rudolph',
          owner: {
            login: 'santa'
          }
        },
        installation: {
          id: 42
        }
      }
    }

    context = new Context(event, {} as any, {} as any)
    context.octokit.apps = {
      getWebhookConfigForApp: jest.fn().mockImplementation(async () => ({
        data: { url: callback_url }
      })),
      createInstallationAccessToken: jest.fn().mockImplementation(async () => ({ data: { token }}))
    } as any

    context.octokit.repos = {
      createDispatchEvent: jest.fn().mockImplementation(async () => {})
    } as any

    context.octokit.config = {
      get: jest.fn().mockImplementation(async () => ({ config: { workflows_repository: '.github' } }))
    }

    mockingoose(runsModel).toReturn({ _id: id }, 'save');
  })

  test('should createInstallationAccessToken that is scoped to push repository', async () => {
    await handlePush(context);
    expect(context.octokit.apps.createInstallationAccessToken).toBeCalledWith({
      installation_id: event.payload.installation.id,
      repository_ids: [event.payload.repository.id]
    })
  })

  test('should call octokit createDispatchEvent correct data', async () => {
    await handlePush(context);
    expect(context.octokit.repos.createDispatchEvent).toBeCalledWith({
      owner: context.payload.repository.owner.login, 
      repo: ".github",
      event_type: "org-workflow-bot",
      client_payload: {
        sha: context.payload.after, 
        token: token,
        callback_url: `${callback_url}/org-workflows/register`, 
        id: id, 
        repository: { 
          full_name: context.payload.repository.full_name, 
          name: context.payload.repository.name, 
          owner: context.payload.repository.owner.login, 
        }
      }
    })
  })
});