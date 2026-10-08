"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

type Issue = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
};

type User = {
  id: number;
  name: string;
  email: string;
};

async function getJson<T>(path: string, userId?: string) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: userId ? { "X-User-Id": userId } : undefined,
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return (await response.json()) as T;
}

async function updateSubscription(issueId: number, userId: string, subscribed: boolean) {
  const response = await fetch(`${API_URL}/subscriptions/${issueId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
    body: JSON.stringify({ subscribed }),
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }
}

type IssueListProps = {
  issues: Issue[];
  emptyMessage: string;
  subscribedIssueIds: Set<number>;
  updatingIssueId: number | null;
  onSubscriptionToggle: (issue: Issue) => void;
};

function IssueList({
  issues,
  emptyMessage,
  subscribedIssueIds,
  updatingIssueId,
  onSubscriptionToggle,
}: IssueListProps) {
  if (issues.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <ul className="issue-list">
      {issues.map((issue) => (
        <li className="issue-row" key={issue.id}>
          <div className="issue-marker" aria-hidden="true" />
          <div className="issue-copy">
            <div className="issue-heading">
              <h3>{issue.title}</h3>
              <button
                className={`subscription-button${subscribedIssueIds.has(issue.id) ? " subscribed" : ""}`}
                disabled={updatingIssueId === issue.id}
                onClick={() => onSubscriptionToggle(issue)}
                type="button"
              >
                {updatingIssueId === issue.id
                  ? "Updating…"
                  : subscribedIssueIds.has(issue.id)
                    ? "Unsubscribe"
                    : "Subscribe"}
              </button>
            </div>
            {issue.description && <p>{issue.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [myIssuesLoading, setMyIssuesLoading] = useState(false);
  const [updatingIssueId, setUpdatingIssueId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [allIssues, allUsers] = await Promise.all([
          getJson<Issue[]>("/issues"),
          getJson<User[]>("/users"),
        ]);
        setIssues(allIssues);
        setUsers(allUsers);
        setSelectedUserId(String(allUsers[0]?.id ?? ""));
      } catch {
        setError("Could not reach the API. Start the application stack and refresh.");
      } finally {
        setLoading(false);
      }
    }

    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    async function loadMyIssues() {
      setMyIssuesLoading(true);
      try {
        setMyIssues(await getJson<Issue[]>("/subscriptions", selectedUserId));
      } catch {
        setError("Could not load subscribed issues.");
      } finally {
        setMyIssuesLoading(false);
      }
    }

    void loadMyIssues();
  }, [selectedUserId]);

  const selectedUser = users.find((user) => String(user.id) === selectedUserId);
  const subscribedIssueIds = new Set(myIssues.map((issue) => issue.id));

  async function toggleSubscription(issue: Issue) {
    if (!selectedUserId) {
      return;
    }

    setUpdatingIssueId(issue.id);
    setError("");

    try {
      await updateSubscription(issue.id, selectedUserId, !subscribedIssueIds.has(issue.id));
      setMyIssues(await getJson<Issue[]>("/subscriptions", selectedUserId));
    } catch {
      setError("Could not update the subscription. Please try again.");
    } finally {
      setUpdatingIssueId(null);
    }
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard" aria-labelledby="dashboard-title">
        <header className="page-header">
          <div>
            <p className="eyebrow">Issue tracker</p>
            <h1 id="dashboard-title">Your work, in view.</h1>
            <p className="page-description">Review every issue, then see what the selected teammate follows.</p>
          </div>
          {selectedUser && <p className="active-user">Viewing as <strong>{selectedUser.name}</strong></p>}
        </header>

        {error && <p className="api-error" role="status">{error}</p>}

        <div className="dashboard-grid">
          <section className="content-card" aria-labelledby="all-issues-title">
            <div className="section-heading">
              <div>
                <p className="section-kicker">All issues</p>
                <h2 id="all-issues-title">Everything on the board</h2>
              </div>
              <span className="count-badge">{issues.length}</span>
            </div>
            {loading ? (
              <p className="empty-state">Loading issues…</p>
            ) : (
              <IssueList
                issues={issues}
                emptyMessage="No issues yet."
                subscribedIssueIds={subscribedIssueIds}
                updatingIssueId={updatingIssueId}
                onSubscriptionToggle={toggleSubscription}
              />
            )}
          </section>

          <section className="content-card accent-card" aria-labelledby="my-issues-title">
            <div className="section-heading">
              <div>
                <p className="section-kicker">My issues</p>
                <h2 id="my-issues-title">Issues I follow</h2>
              </div>
              <span className="count-badge">{myIssues.length}</span>
            </div>
            {myIssuesLoading ? (
              <p className="empty-state">Loading subscriptions…</p>
            ) : (
              <IssueList
                issues={myIssues}
                emptyMessage="This user has not subscribed to any issues."
                subscribedIssueIds={subscribedIssueIds}
                updatingIssueId={updatingIssueId}
                onSubscriptionToggle={toggleSubscription}
              />
            )}
          </section>

          <aside className="user-panel" aria-labelledby="user-picker-title">
            <div>
              <p className="section-kicker">Perspective</p>
              <h2 id="user-picker-title">Who are you?</h2>
              <p className="panel-description">Choose a user to see their subscribed issues.</p>
            </div>
            <div className="user-options" role="radiogroup" aria-label="Select a user">
              {users.map((user) => {
                const isSelected = String(user.id) === selectedUserId;
                return (
                  <button
                    className={`user-option${isSelected ? " selected" : ""}`}
                    key={user.id}
                    onClick={() => setSelectedUserId(String(user.id))}
                    role="radio"
                    aria-checked={isSelected}
                    type="button"
                  >
                    <span className="avatar">{user.name.charAt(0)}</span>
                    <span>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </span>
                    <span className="selection-indicator" aria-hidden="true" />
                  </button>
                );
              })}
              {!loading && users.length === 0 && <p className="empty-state">No users found.</p>}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
