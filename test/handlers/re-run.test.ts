import mockingoose from 'mockingoose';
import { Context } from 'probot'
import handleReRun from '../../src/handlers/re-run'
import runsModel from '../../src/models/runs.model';

describe('rerun handler', () => {
  let event: any
  let context: Context

  beforeEach(async () => {
    event = {
      id: '123',
      name: 'check_run',
      payload: {
        action: 'rerequested',
        check_run: {}
      }
    }

    context = new Context(event, {} as any, {} as any)
    context.octokit.actions = {
      reRunWorkflow: jest.fn().mockImplementation(async () => {})
    } as any
  })

  describe('run id is empty', () => {
    beforeEach(async () => {
      context.payload.check_run.id = null
      await handleReRun(context)
    })

    test('should not call reRunWorkflow method', () => {
      expect(context.octokit.actions.reRunWorkflow).not.toBeCalled();
    })
  });

  describe('no run is found in database', () => {
    beforeEach(async () => {
      context.payload.check_run.id = '123'
      mockingoose(runsModel).toReturn(null, 'findOne');
      await handleReRun(context)
    })

    test('should not call reRunWorkflow method', () => {
      expect(context.octokit.actions.reRunWorkflow).not.toBeCalled();
    })
  });

  describe('run is found in database', () => {
    const _doc = {
      _id: '123',
      sha: 'sha123sha',
      callback_url: 'https://thisapp.com',
      check: {
        run_id: 1,
        name: 'workflow check test',
        checks_run_id: 1001
      },
      repository: {
        owner: 'santa',
        name: 'rudolph',
        full_name: 'santa/rudolph'
      }
    };
 
    beforeEach(async () => {
      context.payload.check_run.id = '123'
      mockingoose(runsModel).toReturn(_doc, 'findOne');
      await handleReRun(context)
    })

    test('should call reRunWorkflow method with correctArguments', () => {
      expect(context.octokit.actions.reRunWorkflow).not.toBeCalledWith({
        owner: _doc.repository.owner,
        repo: './github',
        run_id: _doc.check.run_id
      });
    })
  });
});