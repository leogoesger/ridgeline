const assert = require("node:assert/strict");
const test = require("node:test");
const { createIssuesService } = require("../services/issues");

test("lists issues from the internal data layer", async () => {
  const expectedIssues = [{ id: 1, title: "Set up project repository" }];
  const service = createIssuesService({
    async list() {
      return expectedIssues;
    },
  });

  assert.deepEqual(await service.listIssues(), expectedIssues);
});
