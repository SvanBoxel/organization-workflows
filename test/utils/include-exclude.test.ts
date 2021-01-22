import shouldRun from '../../src/utils/should-run';

describe('should run logic', () => {
  let repositoryName;
  let exclude;
  
  beforeEach(() => {
    repositoryName = 'foobar';
  })
  
  describe('no exclude pattern is defined', () => {
    beforeEach(() => {
      exclude = [];
    })
    
    test('should return true', () => {
      expect(shouldRun(repositoryName, exclude)).toBe(true)
    })
  })
  
  describe('exclude pattern is defined', () => {
    describe('without wildcard', () => {
      beforeEach(() => {
        exclude = ['.github', 'exclude-this-repo'];
      })
      
      test('should return true if exclude array doesnt contain repository', () => {
        repositoryName = 'foobar';
        expect(shouldRun(repositoryName, exclude)).toBe(true)
      })
      
      test('should return false if exclude array contains repository', () => {
        repositoryName = '.github';
        expect(shouldRun(repositoryName, exclude)).toBe(false)
        
        repositoryName = 'exclude-this-repo';
        expect(shouldRun(repositoryName, exclude)).toBe(false)
      })
    })
    
    describe('with wildcard', () => {
      beforeEach(() => {
        exclude = ['exclude-*', '*-ignore', '*-nope-*'];
      })
      
      test('should return true if exclude array doesnt matches repository', () => {
        repositoryName = 'foo';
        expect(shouldRun(repositoryName, exclude)).toBe(true)
        
        repositoryName = 'foo-exclude-foo';
        expect(shouldRun(repositoryName, exclude)).toBe(true)
        
        repositoryName = 'foo-ignore-foo';
        expect(shouldRun(repositoryName, exclude)).toBe(true)
      })
      
      test('should return false if exclude array matches repository', () => {
        repositoryName = 'exclude-';
        expect(shouldRun(repositoryName, exclude)).toBe(false)
        
        repositoryName = 'exclude-foo-yes';
        expect(shouldRun(repositoryName, exclude)).toBe(false)
        
        repositoryName = 'foo-ignore';
        expect(shouldRun(repositoryName, exclude)).toBe(false)
        
        repositoryName = 'foo-nope-foo';
        expect(shouldRun(repositoryName, exclude)).toBe(false)
      })
    })
  })
})