# Mode Selection and Plan Approval Flow

This document explains the implementation of mode selection logic and plan approval flow based on the Jules API specification.

## Overview

The Jules API client now supports two execution modes:
1. **Start/Run Mode**: Automatically executes after plan generation
2. **Review Mode**: Waits for user approval before executing the plan

## API Implementation

### 1. Session Creation with Mode Selection

The `createSession` API now accepts a `requirePlanApproval` parameter:

```typescript
createSession(
  sourceName: string,
  prompt: string,
  defaultBranch?: string,
  images?: { mimeType: string; data: string }[],
  requirePlanApproval?: boolean  // NEW
): Promise<Session | null>
```

**Behavior:**
- `requirePlanApproval: false` (or omitted): **Start/Run Mode**
  - Plan is auto-approved after generation
  - Execution starts immediately
  - Session state: `QUEUED` → `PLANNING` → `IN_PROGRESS` → `COMPLETED`

- `requirePlanApproval: true`: **Review Mode**
  - Plan generation pauses execution
  - Waits for user to call `:approvePlan`
  - Session state: `QUEUED` → `PLANNING` → `AWAITING_PLAN_APPROVAL` → `IN_PROGRESS` → `COMPLETED`

### 2. Session States

The Session type now includes all states defined in the Jules API:

```typescript
type SessionState = 
  | 'STATE_UNSPECIFIED'
  | 'QUEUED'              // Session is queued
  | 'PLANNING'            // Agent is planning (deprecated in API but may still appear)
  | 'AWAITING_PLAN_APPROVAL'  // Waiting for user to approve plan
  | 'AWAITING_USER_FEEDBACK'  // Waiting for user feedback
  | 'IN_PROGRESS'         // Session is executing
  | 'PAUSED'              // Session is paused
  | 'FAILED'              // Session failed
  | 'COMPLETED'           // Session completed successfully
  | 'ACTIVE';             // Legacy state for backward compatibility
```

### 3. Plan Approval

**Endpoint:** `POST /v1alpha/sessions/{SESSION_ID}:approvePlan`

The `approvePlan` method now correctly uses the `:approvePlan` endpoint:

```typescript
approvePlan(sessionName: string): Promise<void>
```

**Note:** Pass the full session name (e.g., `"sessions/abc123"`), not the plan ID.

### 4. Session State Polling

The session detail screen now polls both:
- Activities (every 5 seconds)
- Session state (every 5 seconds)

This allows the UI to react to state changes like `AWAITING_PLAN_APPROVAL`.

## UI Components

### 1. Create Session Screen - Mode Selector

The create session screen now includes a mode selector with two options:

**Start Mode:**
- Label: "実行 (Start)" / "Start (Run)"
- Description: "プラン作成後、自動で実行開始" / "Auto-execute after plan generation"
- Sets `requirePlanApproval: false`

**Review Mode:**
- Label: "確認 (Review)" / "Review"
- Description: "プラン確認してから実行" / "Review plan before execution"
- Sets `requirePlanApproval: true`

### 2. Session Detail Screen - State Badge

The session detail screen header now displays a color-coded state badge:

- **Yellow** (`AWAITING_PLAN_APPROVAL`): Plan is waiting for approval
- **Green** (`COMPLETED`): Session completed successfully
- **Red** (`FAILED`): Session failed
- **Gray** (other states): Default color

### 3. Activity Components

The existing `ActivityItem` component handles plan approval:

- **Plan Generated**: Shows plan steps when `planGenerated` activity appears
- **Approval Required**: Shows approve button when `planApprovalRequested` activity appears
- **Session Completed/Failed**: Shows completion or failure status

## Execution Flow

### Start/Run Mode Flow

1. User creates session with `requirePlanApproval: false`
2. API creates session → state: `QUEUED`
3. Agent generates plan → state: `PLANNING` → `IN_PROGRESS`
4. Plan is auto-approved
5. Agent executes → state: `IN_PROGRESS`
6. Completion → state: `COMPLETED`

### Review Mode Flow

1. User creates session with `requirePlanApproval: true`
2. API creates session → state: `QUEUED`
3. Agent generates plan → state: `PLANNING` → `AWAITING_PLAN_APPROVAL`
4. **Activity appears:** `planApprovalRequested`
5. User reviews plan and clicks "Approve"
6. Client calls `:approvePlan` endpoint
7. Agent starts execution → state: `IN_PROGRESS`
8. Completion → state: `COMPLETED`

## Translation Keys

New i18n keys added:

```typescript
// Execution modes
executionMode: '3. 実行モード' / '3. Execution Mode'
modeStart: '実行 (Start)' / 'Start (Run)'
modeReview: '確認 (Review)' / 'Review'
modeStartDesc: 'プラン作成後、自動で実行開始' / 'Auto-execute after plan generation'
modeReviewDesc: 'プラン確認してから実行' / 'Review plan before execution'

// Session states
stateQueued: '待機中' / 'Queued'
statePlanning: '計画中' / 'Planning'
stateAwaitingPlanApproval: '承認待ち' / 'Awaiting Plan Approval'
stateAwaitingUserFeedback: 'フィードバック待ち' / 'Awaiting Feedback'
stateInProgress: '実行中' / 'In Progress'
statePaused: '一時停止' / 'Paused'
```

## Files Modified

1. **hooks/use-jules-api.ts**
   - Added `requirePlanApproval` parameter to `createSession`
   - Fixed `approvePlan` endpoint path
   - Added `fetchSession` method for state polling

2. **constants/types.ts**
   - Updated `Session` type with all session states
   - Added `sessionCompleted` and `sessionFailed` activity types

3. **app/create-session.tsx**
   - Added mode selection state and UI
   - Pass `requirePlanApproval` to `createSession`

4. **app/session/id.tsx**
   - Added session state polling
   - Display state badge in header
   - Updated `handleApprovePlan` to pass session name

5. **constants/i18n.ts**
   - Added translation keys for modes and states

## Testing

To test the implementation:

1. **Test Start Mode:**
   - Create session with Start mode selected
   - Verify plan is auto-approved
   - Session should proceed automatically

2. **Test Review Mode:**
   - Create session with Review mode selected
   - Wait for `AWAITING_PLAN_APPROVAL` state
   - Review plan in activities
   - Click "Approve" button
   - Verify session proceeds after approval

3. **Test State Badges:**
   - Check header badge shows correct state
   - Verify color coding (yellow for awaiting approval, etc.)

## API Reference

Based on Jules API documentation:
- [Sessions API](https://jules.google/docs/api/reference/sessions/)
- [Activities API](https://jules.google/docs/api/reference/activities/)
- [Plan Approval](https://developers.google.com/jules/api)

## Notes

- The polling interval is set to 5 seconds for both activities and session state
- Plan approval requires passing the session name, not the plan ID
- The API endpoint is `/:approvePlan`, not `/:approve`
- Session state is displayed even when activities are still loading
