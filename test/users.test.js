const assert = require("node:assert/strict");
const test = require("node:test");
const { createUsersService } = require("../services/users");

test("lists users from the internal data layer", async () => {
  const expectedUsers = [{ id: 1, name: "Ada Lovelace" }];
  const service = createUsersService({
    async list() {
      return expectedUsers;
    },
  });

  assert.deepEqual(await service.listUsers(), expectedUsers);
});
