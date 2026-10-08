CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE issue_user (
  issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, user_id)
);

INSERT INTO users (name, email) VALUES
  ('Ada Lovelace', 'ada@example.com'),
  ('Grace Hopper', 'grace@example.com');

INSERT INTO issues (title, description, status) VALUES
  ('Set up project repository', 'Create the initial repository structure and configuration.', 'open'),
  ('Design issue workflow', 'Define the statuses and transitions for issue tracking.', 'in_progress'),
  ('Add authentication', 'Implement sign-in and user session management.', 'open'),
  ('Prepare release checklist', 'Document the steps required for the first release.', 'closed');
