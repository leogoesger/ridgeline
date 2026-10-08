const express = require("express");

function createIssuesRouter(issuesService) {
  const router = express.Router();

  router.get("/", async (_request, response, next) => {
    try {
      response.status(200).json(await issuesService.listIssues());
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createIssuesRouter };
