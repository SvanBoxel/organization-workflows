import mockingoose from 'mockingoose';
import { Context } from 'probot'
import handleCompletedRun from '../../src/handlers/completed-run'
import runsModel from '../../src/models/runs.model';

describe('completed run handler', () => {
  let event: any
  let context: Context
  let _doc: any;

  beforeEach(async () => {
    event = {
      id: '123',
      name: 'workflow_run',
      payload: {
        action: "completed",
        repository: {
          name: '.github',
          full_name: 'santa/.github',
          owner: {
            login: 'santa'
          }
        },
        workflow_run: {
          id: 2910,
          run_id: 2910,
          status: "completed",
          conclusion: "failure"
        },
        installation: {
          id: 42
        }
      }
    }

    context = new Context(event, {} as any, {} as any)
    context.octokit.checks = {
      update: jest.fn().mockImplementation(async () => {})
    } as any

    _doc = {
      repository: {
        owner: 'santa',
        name: 'harold'
      },
      checks: [{
        name: "org-workflow/santa-linter",
        run_id: 2910,
        checks_run_id: 29104,
      }]
    }

    mockingoose(runsModel).toReturn(_doc, 'findOne');
  })

  describe('repository is not .github', () => {
    beforeEach(async () => {
      context.payload.repository.name = 'foo'
      await handleCompletedRun(context)
    })
    test('should not call octokit checks update method', () => {
      expect(context.octokit.checks.update).not.toBeCalled();
    });
  })

  describe('run is found', () => {
    beforeEach(async () => {
      await handleCompletedRun(context)
    })
    test('should call octokit checks update method', () => {
      expect(context.octokit.checks.update).toBeCalledWith({
        check_run_id: _doc.checks[0].checks_run_id,
        conclusion: context.payload.workflow_run.conclusion,
        name: _doc.checks[0].name,
        owner: _doc.repository.owner,
        repo: _doc.repository.name,
        status: context.payload.workflow_run.status,
      });
    });
  })

  describe('run is not found', () => {
    beforeEach(async () => {
      mockingoose(runsModel).toReturn(null, 'findOne');
      await handleCompletedRun(context)
    })
    test('should not call octokit checks update method', () => {
      expect(context.octokit.checks.update).not.toBeCalled();
    });
  })
});