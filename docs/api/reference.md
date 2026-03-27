# API Reference

This document describes the Jules API integration used in this mobile client.

## Photo Upload Support

**Status:** The mobile client UI is prepared for photo uploads with `expo-image-picker`, but the Jules API (v1alpha) does not currently support image/photo attachments in session creation or sendMessage requests. The client is ready for future API support.

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

| State | Description | App Display (ja/en) |
|-------|-------------|---------------------|
| `STATE_UNSPECIFIED` | Unknown/Creating state | 作成中 / Creating |
| `QUEUED` | Session is queued | 待機中 / Queued |
| `PLANNING` | Agent is planning (deprecated) | 計画中 / Planning |
| `AWAITING_PLAN_APPROVAL` | Waiting for plan approval | 承認待ち / Awaiting Plan Approval |
| `AWAITING_USER_FEEDBACK` | Waiting for user feedback | フィードバック待ち / Awaiting Feedback |
| `IN_PROGRESS` | Session is executing | 実行中 / In Progress |
| `PAUSED` | Session is paused | 一時停止 / Paused |
| `FAILED` | Session encountered an error | 失敗 / Failed |
| `COMPLETED` | Session finished successfully | 完了 / Completed |
| `ACTIVE` | Legacy state (backward compat) | 処理中 / Processing |

#### Create Session

```http
POST /sessions
Content-Type: application/json

{
  "prompt": "Fix the login bug",
  "sourceContext": {
    "source": "sources/github/owner/repo",
    "githubRepoContext": {
      "startingBranch": "main"
    }
  },
  "title": "Fix the login bug...",
  "requirePlanApproval": false
}
```

**Request Body:**

- `prompt` (required): The task description for Jules
- `sourceContext` (optional): Source repository context
  - `source`: Resource name of the source (e.g., `sources/github/owner/repo`)
  - `githubRepoContext`: GitHub-specific context
    - `startingBranch`: Branch to start from (e.g., `"main"`)
- `title` (optional): Session title (auto-generated if omitted)
- **`requirePlanApproval`** (optional, boolean): **NEW**
  - `false` or omitted: **Start/Run mode** - Auto-approve plan and execute
  - `true`: **Review mode** - Wait for user approval via `:approvePlan`

**Execution Modes:**

| Mode | `requirePlanApproval` | Behavior |
|------|----------------------|----------|
| **Start / Run** | `false` or omitted | Plan is auto-approved after generation, execution starts immediately |
| **Review** | `true` | Plan generation pauses execution. User must call `:approvePlan` to proceed |

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

#### Approve Plan

**NEW**: Approves a plan in a session. Used in Review mode when `requirePlanApproval: true`.

```http
POST /sessions/{sessionId}:approvePlan
Content-Type: application/json

{}
```

**Path Parameters:**
- `sessionId`: The session ID (e.g., `sessions/abc123`)

**Request Body:** Empty object `{}`

**Response:** `ApprovePlanResponse` (typically empty on success)

**Usage:**
- Only applicable when session is in `AWAITING_PLAN_APPROVAL` state
- Approves the most recently generated plan
- After approval, session proceeds to `IN_PROGRESS` state

**Example:**
```typescript
await approvePlan('sessions/abc123');
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
| **Session Completed** | `sessionCompleted` | **NEW**: Session finished successfully |
| **Session Failed** | `sessionFailed.reason` | **NEW**: Session failed with reason |
| Artifacts | `artifacts[]` | Bash output, code changes, etc. |

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
  state: 
    | 'STATE_UNSPECIFIED'
    | 'QUEUED'
    | 'PLANNING'
    | 'AWAITING_PLAN_APPROVAL'
    | 'AWAITING_USER_FEEDBACK'
    | 'IN_PROGRESS'
    | 'PAUSED'
    | 'FAILED'
    | 'COMPLETED'
    | 'ACTIVE'; // Legacy
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
  sessionCompleted?: {}; // NEW
  sessionFailed?: { reason?: string }; // NEW
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

The Jules API may apply rate limiting. While specific limits are not publicly documented, implement best practices:

### Client-Side Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];
  private maxRequests = 100; // Adjust based on your needs
  private windowMs = 60000; // 1 minute

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    this.requests.push(now);
    return true;
  }
}

// Usage in API hook
const rateLimiter = new RateLimiter();

async function fetchWithRateLimit(url: string) {
  await rateLimiter.checkLimit();
  return fetch(url);
}
```

### Exponential Backoff

If you receive a `429` error, implement exponential backoff:

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Best Practices

1. **Cache Responses**: Don't fetch the same data repeatedly
   ```typescript
   const cache = new Map<string, { data: any; timestamp: number }>();
   const CACHE_TTL = 60000; // 1 minute

   async function fetchWithCache(url: string) {
     const cached = cache.get(url);
     const now = Date.now();
     
     if (cached && now - cached.timestamp < CACHE_TTL) {
       return cached.data;
     }
     
     const data = await fetch(url).then(r => r.json());
     cache.set(url, { data, timestamp: now });
     return data;
   }
   ```

2. **Batch Requests**: Combine multiple operations when possible
3. **Use Pagination**: Don't fetch all data at once
4. **Implement Debouncing**: For user-triggered actions
5. **Monitor Usage**: Track API calls in Google Cloud Console

### Google Cloud Quotas

To manage your API usage:

1. **Check Current Usage**:
   - Open [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" → "Dashboard"
   - View Jules API usage

2. **Set Budget Alerts**:
   - Go to "Billing" → "Budgets & alerts"
   - Create alert at 50%, 90%, 100% of expected usage
   - Receive email notifications

3. **Request Quota Increase**:
   - If you need higher limits for production
   - Contact Google Cloud support
   - Explain your use case

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

---

## Code Examples

### Using the API Hook

The `useJulesApi` hook provides a convenient interface for all API operations:

```typescript
import { useJulesApi } from '@/hooks/use-jules-api';
import { useApiKey } from '@/constants/api-key-context';
import { useI18n } from '@/constants/i18n-context';

function MyComponent() {
  const { apiKey } = useApiKey();
  const { t } = useI18n();
  
  const {
    isLoading,
    error,
    sessions,
    sources,
    fetchSessions,
    fetchSources,
    createSession,
    fetchActivities,
    approvePlan,
  } = useJulesApi({ apiKey, t });

  // Load sessions on mount
  useEffect(() => {
    if (apiKey) {
      void fetchSessions();
    }
  }, [apiKey, fetchSessions]);

  return (
    // Your component JSX
  );
}
```

### Creating a Session

```typescript
const handleCreateSession = async () => {
  const source = 'sources/github/owner/repo';
  const prompt = 'Fix the login bug in the auth module';
  const branch = 'main';
  const requirePlanApproval = false; // Start mode

  const session = await createSession(
    source,
    prompt,
    branch,
    [],
    requirePlanApproval
  );

  if (session) {
    console.log('Session created:', session.name);
    router.push(`/session/${session.name}`);
  }
};
```

### Best Practices

1. **Always Check for API Key**: Verify API key exists before making requests
   ```typescript
   if (!apiKey) {
     Alert.alert('Error', 'Please set your API key in Settings');
     return;
   }
   ```

2. **Use Silent Refresh**: For background updates without showing loading state
   ```typescript
   // Silent refresh - no loading spinner
   await fetchSessions(true); // silent = true
   ```

3. **Handle Network Errors Gracefully**: Provide retry mechanisms and clear error messages
   ```typescript
   try {
     await createSession(source, prompt);
   } catch (error) {
     if (error.message.includes('network')) {
       Alert.alert(
         'Network Error',
         'Please check your internet connection and try again.',
         [{ text: 'Retry', onPress: () => handleRetry() }]
       );
     } else {
       Alert.alert('Error', error.message);
     }
   }
   ```

4. **Optimize Re-renders**: Use `useMemo` and `useCallback` to prevent unnecessary re-renders
   ```typescript
   const memoizedSessions = useMemo(() => 
     sessions.filter(s => s.state === 'ACTIVE'),
     [sessions]
   );

   const handleRefresh = useCallback(async () => {
     await fetchSessions();
   }, [fetchSessions]);
   ```

5. **Implement Proper Loading States**: Show loading indicators for better UX
   ```typescript
   {isLoading && <ActivityIndicator />}
   {error && <Text style={styles.error}>{error}</Text>}
   {!isLoading && sessions.length === 0 && <EmptyState />}
   ```

6. **Use Polling Wisely**: Don't poll too frequently
   ```typescript
   // Good: 5-second interval
   const interval = setInterval(() => {
     fetchActivities(sessionId, true); // silent
   }, 5000);

   // Bad: 1-second interval (too frequent)
   // const interval = setInterval(() => {
   //   fetchActivities(sessionId);
   // }, 1000);
   ```

7. **Clean Up Resources**: Always clear intervals and subscriptions
   ```typescript
   useEffect(() => {
     const interval = setInterval(fetchData, 5000);
     return () => clearInterval(interval); // Cleanup
   }, [fetchData]);
   ```

8. **Validate User Input**: Before sending to API
   ```typescript
   if (!prompt.trim()) {
     Alert.alert('Error', 'Please enter a task description');
     return;
   }

   if (prompt.length > 5000) {
     Alert.alert('Error', 'Description is too long (max 5000 characters)');
     return;
   }
   ```

9. **Handle API Errors Consistently**: Standardize error handling
   ```typescript
   // In useJulesApi hook
   const handleApiError = (error: any): string => {
     if (error.error?.message) {
       return error.error.message;
     }
     if (error.message.includes('network')) {
       return 'Network error. Please check your connection.';
     }
     return 'An unexpected error occurred';
   };
   ```

10. **Monitor API Usage**: Track usage to avoid hitting limits
    ```typescript
    // Simple usage tracker
    let apiCallCount = 0;
    const trackApiCall = () => {
      apiCallCount++;
      if (apiCallCount > 1000) {
        console.warn('High API usage detected');
      }
    };
    ```

## Further Reading

- [Official Jules Documentation](https://jules.google/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [React Native Networking](https://reactnative.dev/docs/network)
