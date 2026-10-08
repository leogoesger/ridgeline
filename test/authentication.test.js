const assert = require("node:assert/strict");
const test = require("node:test");
const { authentication } = require("../middleware/authentication");

test("stores the X-User-Id header on the request user", () => {
  const request = { get: (header) => (header === "x-user-id" ? "2" : undefined) };
  let nextCalled = false;

  authentication(request, {}, () => {
    nextCalled = true;
  });

  assert.deepEqual(request.user, { id: "2" });
  assert.equal(nextCalled, true);
});

test("continues without a user when the header is absent", () => {
  const request = { get: () => undefined };

  authentication(request, {}, () => {});

  assert.equal(request.user, undefined);
});
