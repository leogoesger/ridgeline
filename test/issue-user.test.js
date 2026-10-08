const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createIssueUserService,
  ValidationError,
} = require("../services/issue-user");

test("updates a user subscription through the internal layer", async () => {
  const calls = [];
  const service = createIssueUserService({
    async setSubscription(subscription) {
      calls.push(subscription);
      return { ...subscription, changed: true };
    },
  });

  const result = await service.setSubscription({
    userId: 1,
    issueId: "2",
    subscribed: true,
  });

  assert.deepEqual(calls, [{ userId: 1, issueId: 2, subscribed: true }]);
  assert.deepEqual(result, { userId: 1, issueId: 2, subscribed: true, changed: true });
});

test("lists issues subscribed by a user", async () => {
  const expectedIssues = [{ id: 2, title: "Design issue workflow" }];
  const service = createIssueUserService({
    async listIssuesForUser(userId) {
      assert.equal(userId, 1);
      return expectedIssues;
    },
  });

  assert.deepEqual(await service.listSubscribedIssues({ userId: "1" }), expectedIssues);
});

test("rejects invalid subscription inputs", async () => {
  const service = createIssueUserService({ setSubscription: async () => {} });

  await assert.rejects(
    service.setSubscription({ userId: 1, issueId: 2, subscribed: "true" }),
    ValidationError,
  );

  await assert.rejects(service.setSubscription(), ValidationError);
});
