const express = require("express");
const database = require("./db");
const { createIssueUser } = require("./internal/issue-user");
const { createIssues } = require("./internal/issues");
const { createUsers } = require("./internal/users");
const { authentication } = require("./middleware/authentication");
const { createIssuesRouter } = require("./routes/issues");
const { createIssueUserRouter } = require("./routes/issue-user");
const { createUsersRouter } = require("./routes/users");
const { createIssuesService } = require("./services/issues");
const { createIssueUserService } = require("./services/issue-user");
const { createUsersService } = require("./services/users");

const app = express();
const port = process.env.PORT || 8080;
const issueUser = createIssueUser(database);
const issues = createIssues(database);
const users = createUsers(database);
const issueUserService = createIssueUserService(issueUser);
const issuesService = createIssuesService(issues);
const usersService = createUsersService(users);

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-User-Id");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json());
app.use(authentication);

app.get("/health", async (_request, response) => {
  try {
    await database.query("SELECT 1");
    response.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database health check failed", error);
    response.status(503).json({ status: "unavailable", database: "disconnected" });
  }
});

app.use("/issues", createIssuesRouter(issuesService));
app.use("/subscriptions", createIssueUserRouter(issueUserService));
app.use("/users", createUsersRouter(usersService));

app.use((error, _request, response, _next) => {
  console.error("Unexpected request error", error);
  response.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
