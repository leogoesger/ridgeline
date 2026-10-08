function createIssuesService(issues) {
  async function listIssues() {
    return issues.list();
  }

  return { listIssues };
}

module.exports = { createIssuesService };
