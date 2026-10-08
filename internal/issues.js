function createIssues(database) {
  async function list() {
    const { rows } = await database.query(
      `SELECT id, title, description, status, created_at
       FROM issues
       ORDER BY created_at DESC, id DESC`,
    );

    return rows;
  }

  return { list };
}

module.exports = { createIssues };
