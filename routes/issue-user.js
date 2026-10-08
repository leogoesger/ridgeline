const express = require("express");
const { IssueUserTargetNotFoundError } = require("../internal/issue-user");
const { ValidationError } = require("../services/issue-user");

function createIssueUserRouter(issueUserService) {
  const router = express.Router();

  router.get("/", async (request, response, next) => {
    if (!request.user?.id) {
      response.status(401).json({ error: "Authentication is required" });
      return;
    }

    try {
      response.status(200).json(
        await issueUserService.listSubscribedIssues({ userId: request.user.id }),
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        response.status(400).json({ error: error.message });
        return;
      }

      next(error);
    }
  });

  router.post("/:issueId", async (request, response, next) => {
    if (!request.user?.id) {
      response.status(401).json({ error: "Authentication is required" });
      return;
    }

    try {
      const subscription = await issueUserService.setSubscription({
        userId: request.user.id,
        issueId: request.params.issueId,
        subscribed: request.body?.subscribed,
      });
      response.status(200).json(subscription);
    } catch (error) {
      if (error instanceof ValidationError) {
        response.status(400).json({ error: error.message });
        return;
      }

      if (error instanceof IssueUserTargetNotFoundError) {
        response.status(404).json({ error: error.message });
        return;
      }

      next(error);
    }
  });

  return router;
}

module.exports = { createIssueUserRouter };
