class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function normalizePositiveInteger(value, fieldName) {
  const normalized = typeof value === "string" ? Number(value) : value;

  if (!Number.isSafeInteger(normalized) || normalized < 1) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }

  return normalized;
}

function createIssueUserService(issueUser) {
  async function listSubscribedIssues(input) {
    return issueUser.listIssuesForUser(
      normalizePositiveInteger(input?.userId, "userId"),
    );
  }

  async function setSubscription(input) {
    const { userId, issueId } = input ?? {};

    if (typeof input?.subscribed !== "boolean") {
      throw new ValidationError("subscribed must be a boolean");
    }

    return issueUser.setSubscription({
      userId: normalizePositiveInteger(userId, "userId"),
      issueId: normalizePositiveInteger(issueId, "issueId"),
      subscribed: input.subscribed,
    });
  }

  return { listSubscribedIssues, setSubscription };
}

module.exports = { createIssueUserService, ValidationError };
