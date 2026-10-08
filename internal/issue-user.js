class IssueUserTargetNotFoundError extends Error {
  constructor(target) {
    super(`${target} not found`);
    this.name = "IssueUserTargetNotFoundError";
  }
}

function createIssueUser(database) {
  async function listIssuesForUser(userId) {
    const { rows } = await database.query(
      `SELECT issues.id, issues.title, issues.description, issues.status, issues.created_at
       FROM issues
       INNER JOIN issue_user ON issue_user.issue_id = issues.id
       WHERE issue_user.user_id = $1
       ORDER BY issues.created_at DESC, issues.id DESC`,
      [userId],
    );

    return rows;
  }

  async function setSubscription({ userId, issueId, subscribed }) {
    const { rows } = await database.query(
      `SELECT
        EXISTS (SELECT 1 FROM users WHERE id = $1) AS user_exists,
        EXISTS (SELECT 1 FROM issues WHERE id = $2) AS issue_exists`,
      [userId, issueId],
    );

    if (!rows[0].user_exists) {
      throw new IssueUserTargetNotFoundError("user");
    }

    if (!rows[0].issue_exists) {
      throw new IssueUserTargetNotFoundError("issue");
    }

    const result = subscribed
      ? await database.query(
          `INSERT INTO issue_user (issue_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT (issue_id, user_id) DO NOTHING
           RETURNING issue_id, user_id`,
          [issueId, userId],
        )
      : await database.query(
          `DELETE FROM issue_user
           WHERE issue_id = $1 AND user_id = $2
           RETURNING issue_id, user_id`,
          [issueId, userId],
        );

    return {
      userId,
      issueId,
      subscribed,
      changed: result.rowCount === 1,
    };
  }

  return { listIssuesForUser, setSubscription };
}

module.exports = {
  createIssueUser,
  IssueUserTargetNotFoundError,
};
