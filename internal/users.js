function createUsers(database) {
  async function list() {
    const { rows } = await database.query(
      `SELECT id, name, email
       FROM users
       ORDER BY name ASC`,
    );

    return rows;
  }

  return { list };
}

module.exports = { createUsers };
