# Chat Interface

The Chat Interface is the core screen for interacting with Jules during a session (`app/session/[id].tsx`).

## Overview

The interface provides a real-time, chronological view of the session's activities. It displays messages, code blocks, plan proposals, and state changes.

## Component Structure

The main component is `ActivityItem` (`components/jules/activity-item.tsx`), which renders individual activities based on their type:

### 1. User Prompts
Displays the initial prompt provided by the user when creating the session.

### 2. Jules Responses (Markdown & Code)
Jules' responses are parsed and rendered using `react-native-markdown-display`. Code blocks are syntax-highlighted using the `CodeBlock` component (`components/jules/code-block.tsx`), which supports horizontal scrolling for long lines.

### 3. Plan Approvals
If the session was created in "Review" mode, Jules will output a proposed plan. The interface provides interactive buttons to "Approve" or "Reject" the plan.

### 4. State Transitions
Changes in the session state (e.g., "Jules started planning", "Jules finished the task") are displayed as inline informational messages.

## Real-time Polling

To ensure the chat is always up-to-date, the application uses a polling mechanism via the `useJulesApi` hook. It regularly calls the `GET /sessions/{id}/activities` endpoint to fetch new messages.

## Skeleton Loading

When opening a session or waiting for initial data, the interface displays placeholder UI (`ActivityItemSkeleton`) with shimmer animations instead of a simple loading spinner, providing a modern and smooth user experience.
