function shouldRun(
  repositoryName: string, 
  exclude: string[]
): boolean {
  const excludeMatch = exclude.some((repository: string) => {
    return new RegExp('^' + repository.replace(/\*/g, '.*') + '$').test(repositoryName)
  });    

  if (excludeMatch) return false;
  return true;
}

export default shouldRun;