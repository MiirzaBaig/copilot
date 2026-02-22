# CopilotKit Demo — Smart Task Assistant

## What was built

A simple React + CopilotKit demo where users can add a task, and an AI agent suggests an improved version of that task.

This demonstrates:

- A working copilot experience (UI + AI integration)
- One meaningful interaction: the copilot updates app state (task list) via the `addImprovedTask` action
- Shared state updates and agent interaction (AI improves task descriptions)

## Setup instructions

1. Clone the repo and go to the project folder.

2. Install dependencies:

   ```bash
   npm install
   ```

3. **Backend (pick one):**
   - **Copilot Cloud:** Get a free key at [cloud.copilotkit.ai](https://cloud.copilotkit.ai). In `.env` set `VITE_COPILOT_CLOUD_API_KEY`. Do not commit `.env`.
   - **Gemini (self-hosted):** In `.env` set `GOOGLE_GENERATIVE_AI_API_KEY` (Google AI API key) and `VITE_COPILOT_RUNTIME_URL=http://localhost:3001/api/copilotkit`. Then run the backend in a separate terminal: `npm run dev:server`, and keep it running.

4. Run the app:

   ```bash
   npm run dev
   ```

   Open the URL shown (e.g. http://localhost:5173). If using Gemini, ensure `npm run dev:server` is running so the app can reach the runtime.

## How it works

- The UI has a text input for task names and a submit button.
- When a task is submitted, the app sends it to CopilotKit’s copilot via `useCopilotChat` (message is appended).
- The copilot is configured to improve the task and call the `addImprovedTask` action (implemented with `useCopilotAction`).
- The action handler updates React state, so the improved task appears in the task list.

So: **user input → copilot run → action with improved text → UI state updated**.

The in-app chat popup uses default CopilotKit styling; the main task UI uses a neo brutalism theme.

## What could be improved with more time

- Add persistent storage (e.g. `localStorage` or a backend).
- Add more suggestion types (e.g. priority, category).
- Add more actions (delete, edit, assign, due date).
- Optionally use `useAgent` with an AG-UI backend for full agent integration.

## Tools used

- **CopilotKit** — React SDK (`@copilotkit/react-core`, `@copilotkit/react-ui`); backend: Copilot Cloud or self-hosted runtime with **Gemini** (`@copilotkit/runtime`, Express).
- **React** — UI and state.
- **Vite** — dev server and build.

AI coding tools were used to build this demo (e.g. Cursor / GitHub Copilot).
