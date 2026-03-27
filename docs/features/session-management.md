# Session Management

The Jules Mobile Client provides a robust interface for managing coding sessions with the Jules AI.

## Session Lifecycle

A session goes through various states, represented by distinct badges in the UI:

1. **Queued:** The session has been created and is waiting to be processed by Jules.
2. **Planning:** Jules is analyzing the prompt and source context to formulate a plan.
3. **In Progress:** Jules is actively executing the plan and making changes.
4. **Completed:** Jules has finished the task.
5. **Failed:** An error occurred during the session.

## Features

### 1. Creating a Session
Users can start a new task by navigating to the "New Task" screen (`app/create-session.tsx`).
- **Prompt:** A detailed description of the task.
- **Repository Context:** Select a GitHub repository from the connected sources.
- **Mode:** Choose between "Start" (auto-execute) or "Review" (manual plan approval) modes. See [Mode Selection](mode-selection.md) for more details.

### 2. Searching & Filtering
The main "Sessions" tab provides tools to find specific sessions:
- **Search:** Quickly find sessions by typing keywords in the title or ID.
- **Filter:** View only active (In Progress, Queued, Planning), Completed, or Failed sessions.
- **Sort:** Order sessions by the most recent update or alphabetically by title.

### 3. Session Cards
Each session is displayed as a card (`components/jules/session-card.tsx`) showing:
- Title and ID
- Current status badge
- Last updated timestamp
- Repository context

### 4. Exporting Sessions
Users can export a session's history for sharing or archiving:
- Format options: Markdown (.md) or JSON (.json)
- The export includes all activities, prompts, and plans within the session.

## Internal Mechanics

Session data is fetched using the `useJulesApi` hook, which interacts with the `GET /sessions` endpoint. The list is heavily optimized using memoization (`useMemo`) to ensure smooth scrolling even with a large number of sessions.
