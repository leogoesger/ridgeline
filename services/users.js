function createUsersService(users) {
  async function listUsers() {
    return users.list();
  }

  return { listUsers };
}

module.exports = { createUsersService };
