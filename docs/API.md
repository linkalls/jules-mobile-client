# API Reference

This document describes the Jules API integration used in this mobile client.

## Base URL

```
https://jules.googleapis.com/v1alpha
```

## Authentication

All requests require the `X-Goog-Api-Key` header:

```http
X-Goog-Api-Key: AIzaSy...
```

## Endpoints

### Sessions

#### List Sessions

```http
GET /sessions?pageSize=20
```

**Response:**

```json
{
  "sessions": [
    {
      "name": "sessions/abc123",
      "title": "Fix bug in auth module",
      "state": "ACTIVE",
      "createTime": "2024-01-15T10:30:00Z",
      "updateTime": "2024-01-15T10:35:00Z"
    }
  ],
  "nextPageToken": "..."
}
```

**Session States:**

| State | Description |
|-------|-------------|
| `STATE_UNSPECIFIED` | Unknown state |
| `ACTIVE` | Session is in progress |
| `COMPLETED` | Session finished successfully |
| `FAILED` | Session encountered an error |

#### Create Session

```http
POST /sessions
Content-Type: application/json

{
  "prompt": "Fix the login bug",
  "sourceContext": {
    "source": "sources/github/owner/repo"
  },
  "title": "Fix the login bug..."
}
```

**Response:**

```json
{
  "name": "sessions/new123",
  "title": "Fix the login bug...",
  "state": "ACTIVE",
  "createTime": "2024-01-15T10:30:00Z",
  "updateTime": "2024-01-15T10:30:00Z"
}
```

### Sources

#### List Sources

```http
GET /sources?pageSize=20&pageToken=...
```

**Response:**

```json
{
  "sources": [
    {
      "name": "sources/github/owner/repo",
      "displayName": "My Repository",
      "githubRepo": {
        "owner": "owner",
        "repo": "repo",
        "isPrivate": false,
        "defaultBranch": {
          "displayName": "main"
        }
      }
    }
  ],
  "nextPageToken": "..."
}
```

### Activities

#### List Activities

```http
GET /sessions/{sessionId}/activities?pageSize=50
```

**Response:**

```json
{
  "activities": [
    {
      "name": "sessions/abc/activities/1",
      "id": "1",
      "createTime": "2024-01-15T10:30:00Z",
      "originator": "agent",
      "agentMessaged": {
        "agentMessage": "I'll analyze the codebase..."
      }
    },
    {
      "name": "sessions/abc/activities/2",
      "id": "2",
      "createTime": "2024-01-15T10:31:00Z",
      "originator": "agent",
      "planGenerated": {
        "plan": {
          "id": "plan123",
          "steps": [
            {
              "id": "step1",
              "title": "Analyze authentication module",
              "description": "Review current auth implementation"
            }
          ]
        }
      }
    }
  ],
  "nextPageToken": "..."
}
```

**Activity Types:**

| Type | Field | Description |
|------|-------|-------------|
| Agent Message | `agentMessaged.agentMessage` | Text message from Jules |
| User Message | `userMessaged.userMessage` | Text message from user |
| Plan Generated | `planGenerated.plan` | AI-generated task plan |
| Plan Approval Request | `planApprovalRequested.planId` | Waiting for user approval |
| Plan Approved | `planApproved.planId` | User approved the plan |
| Progress Update | `progressUpdated.title/description` | Task progress info |
| Artifacts | `artifacts[]` | Bash output, code changes, etc. |

### Plans

#### Approve Plan

```http
POST /{planId}:approve
```

**Response:**

```json
{}
```

## Error Handling

**Error Response Format:**

```json
{
  "error": {
    "code": 400,
    "message": "Invalid request",
    "status": "INVALID_ARGUMENT"
  }
}
```

**Common Error Codes:**

| Code | Status | Description |
|------|--------|-------------|
| 400 | `INVALID_ARGUMENT` | Bad request parameters |
| 401 | `UNAUTHENTICATED` | Missing or invalid API key |
| 403 | `PERMISSION_DENIED` | Access denied |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RESOURCE_EXHAUSTED` | Rate limit exceeded |
| 500 | `INTERNAL` | Server error |

## TypeScript Types

```typescript
// API Error
interface ApiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

// Source
interface Source {
  name: string;
  displayName?: string;
  githubRepo?: {
    owner: string;
    repo: string;
    isPrivate?: boolean;
    defaultBranch?: {
      displayName: string;
    };
  };
}

// Session
interface Session {
  name: string;
  title?: string;
  state: 'STATE_UNSPECIFIED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createTime: string;
  updateTime: string;
}

// Activity
interface Activity {
  name: string;
  id: string;
  createTime: string;
  originator: 'agent' | 'user';
  agentMessaged?: { agentMessage: string };
  userMessaged?: { userMessage: string };
  progressUpdated?: { title?: string; description?: string };
  planGenerated?: { plan: Plan };
  planApproved?: { planId: string };
  planApprovalRequested?: { planId: string };
  artifacts?: Artifact[];
}

// Plan
interface Plan {
  id: string;
  steps?: PlanStep[];
}

interface PlanStep {
  id?: string;
  title: string;
  description?: string;
  state?: string;
  index?: number;
}

// Artifact
interface Artifact {
  bashOutput?: {
    command: string;
    output?: string;
    exitCode?: number;
  };
  changeSet?: {
    source: string;
    gitPatch?: {
      unidiffPatch: string;
      baseCommitId?: string;
    };
  };
}
```

## Rate Limits

The API may apply rate limiting. If you receive a `429` error, implement exponential backoff:

```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (err.status === 429 && i < retries - 1) {
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      throw err;
    }
  }
}
```

## Polling Strategy

For real-time updates, the app polls the activities endpoint:

```typescript
// Poll every 5 seconds
const interval = setInterval(async () => {
  const activities = await fetchActivities(sessionId, true); // silent
  if (activities.length > prevLength) {
    setActivities(activities);
  }
}, 5000);
```
