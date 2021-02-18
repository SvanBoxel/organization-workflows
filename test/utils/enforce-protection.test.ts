import enforceProtection from '../../src/utils/enforce-protection';

describe('enforce protection util', () => {
  let octokit: any;
  let repository: any;
  let context_name: string;
  let owner: string;
  let repo: string;
  let enforce: boolean;
  let enforce_admins: boolean;
  let default_branch: string;
  let current_settings: any;
  let result: any;

  beforeEach(async () => {
    context_name = 'a_check';
    owner = 'octocat';
    repo = 'mona';
    repository = { owner, repo };
    enforce = false;
    enforce_admins = false;
    default_branch = 'main_foo'

    current_settings = {
      data: {
        enforce_admins: {
          enabled: true
        },
        required_status_checks: {
          contexts: []
        },
        required_linear_history: {
          enabled: false
        },
        allow_force_pushes: {
          enabled: false
        },
        allow_deletions: {
          enabled: false
        },
      }
    }

    octokit = {
      repos: {
        get: jest.fn().mockImplementation(async () => ({ data: { default_branch } })),
        getBranchProtection: jest.fn().mockImplementation(async () => ( current_settings )),
        updateBranchProtection: jest.fn()
      }
    }

    // run_function = async () => await enforceProtection(octokit, repository, context_name, enforce, enforce_admins)
  })
  
  describe('...', () => {
    test('should call octokit.repos.get', async () => {
      await enforceProtection(octokit, repository, context_name, enforce, enforce_admins)
      expect(octokit.repos.get).toBeCalledWith({mediaType: { previews : ["symmetra"]}, owner, repo})
    });

    test('should call octokit.repos.getBranchProtection with the right values', async () => {
      await enforceProtection(octokit, repository, context_name, enforce, enforce_admins)
      expect(octokit.repos.getBranchProtection).toBeCalledWith({ branch: default_branch, owner, repo })
    });

    describe('enforce admin is set to true while this is already enforced for admins', () => {
      beforeEach(() => {
        current_settings.data.enforce_admins.enabled = true;
        enforce_admins = true;
      })

      describe('context that is required is already required', () => {
        beforeEach(async () => {
          enforce = true;
          current_settings.data.required_status_checks.contexts = [context_name]
          result = await enforceProtection(octokit, repository, context_name, enforce, enforce_admins)
        });

        test('should not call octokit.repos.updateBranchProtection', () => {
          expect(octokit.repos.updateBranchProtection).not.toBeCalled();
        });

        test('should return false', () => {
          expect(result).toBe(false)
        });
      });

      describe('context that isn\'t required given is already not required', () => {
        beforeEach(async () => {
          enforce = false;
          current_settings.data.required_status_checks.contexts = []
          result = await enforceProtection(octokit, repository, context_name, enforce, enforce_admins)
        });

        test('should not call octokit.repos.updateBranchProtection', () => {
          expect(octokit.repos.updateBranchProtection).not.toBeCalled();
        });

        test('should return false', () => {
          expect(result).toBe(false)
        });
      });
    });

    describe('enforce admin is set to true while its current setting is false', () => {
      beforeEach(() => {
        current_settings.data.enforce_admins.enabled = false;
        enforce_admins = true;
      });

      describe('new setting requires context that isn\'t required yet', () => {
        beforeEach(async () => {
          enforce = true;
          current_settings.data.required_status_checks.contexts = []
          result = await enforceProtection(octokit, repository, context_name, enforce, enforce_admins)
        });
       
        test('should call octokit.repos.updateBranchProtection with the right values', () => {
          expect(octokit.repos.updateBranchProtection).toHaveBeenCalledWith(
            expect.objectContaining({ enforce_admins: true, required_status_checks: {contexts: [context_name] } })
          )
        });

        test('should return true', () => {
          expect(result).toBe(true)
        });
      });

      describe('new setting unrequires context', () => {
        beforeEach(async () => {
          enforce = false;
          current_settings.data.required_status_checks.contexts = [context_name]
          result = await enforceProtection(octokit, repository, context_name, enforce, enforce_admins)
        });
       
        test('should call octokit.repos.updateBranchProtection with the right values', () => {
          expect(octokit.repos.updateBranchProtection).toHaveBeenCalledWith(
            expect.objectContaining({ enforce_admins: true, required_status_checks: {contexts: [] } })
          )
        });

        test('should return true', () => {
          expect(result).toBe(true)
        });
      });
    })

    describe('enforce admin is set to false while its current setting is true', () => {
      beforeEach(() => {
        current_settings.data.enforce_admins.enabled = true;
        enforce_admins = false;
      });

      describe('new setting requires context that isn\'t required yet', () => {
        beforeEach(async () => {
          enforce = true;
          current_settings.data.required_status_checks.contexts = []
          result = await enforceProtection(octokit, repository, context_name, enforce, enforce_admins)
        });
       
        test('should call octokit.repos.updateBranchProtection with the right values', () => {
          expect(octokit.repos.updateBranchProtection).toHaveBeenCalledWith(
            expect.objectContaining({ enforce_admins: false, required_status_checks: {contexts: [context_name] } })
          )
        });

        test('should return true', () => {
          expect(result).toBe(true)
        });
      });

      describe('new setting unrequires context', () => {
        beforeEach(async () => {
          enforce = false;
          current_settings.data.required_status_checks.contexts = [context_name]
          result = await enforceProtection(octokit, repository, context_name, enforce, enforce_admins)
        });
       
        test('should call octokit.repos.updateBranchProtection with the right values', () => {
          expect(octokit.repos.updateBranchProtection).toHaveBeenCalledWith(
            expect.objectContaining({ enforce_admins: false, required_status_checks: {contexts: [] } })
          )
        });

        test('should return true', () => {
          expect(result).toBe(true)
        });
      });
    })
  });
})