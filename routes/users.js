const express = require("express");

function createUsersRouter(usersService) {
  const router = express.Router();

  router.get("/", async (_request, response, next) => {
    try {
      response.status(200).json(await usersService.listUsers());
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createUsersRouter };
