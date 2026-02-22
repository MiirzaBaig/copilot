# CopilotKit Demo — Task glow-up

## What was built

A React + CopilotKit task assistant where users add tasks (by typing, pasting notes, or voice). An AI agent improves tasks, suggests priority and due date, and can break notes into multiple tasks.

**Features:**

- **Single task:** Type or speak a task → AI improves it and adds it with optional priority/due chips.
- **Break into tasks:** Paste notes or a list → AI splits them into separate tasks with optional metadata.
- **Voice input:** Microphone button with speech-to-text; transcript appears in the box and is submitted.
- **Neo-brutalism UI:** Thick borders, hard shadows, Syne + Figtree fonts, custom app icon.
- **Responsive layout:** Fluid padding, wrapping form row, and smooth behavior across screen sizes; respects `prefers-reduced-motion`.

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

- The UI has a text input, voice button, and “Add it” button. Tasks can be one line or pasted notes.
- On submit, the app sends the content to the copilot via `useCopilotChat`. The copilot uses instructions to either improve a single task (and call `addImprovedTask`) or break notes into tasks (and call `addTasks`).
- Actions are implemented with `useCopilotAction`; handlers update React state so tasks (with optional priority/due) appear in the list. Context is provided via `useCopilotReadable`.
- Flow: **user input (text or voice) → copilot run → action(s) with improved/split tasks → UI state updated**. The in-app chat popup uses CopilotKit styling; the main task UI uses a neo-brutalism theme with responsive, smooth interactions.

## Possible improvements

- Persistent storage (e.g. `localStorage` or a backend).
- More actions (delete, edit, reorder).
- Optional `useAgent` + AG-UI backend for full agent integration.

## Tools used

- **CopilotKit** — React SDK (`@copilotkit/react-core`, `@copilotkit/react-ui`); backend: Copilot Cloud or self-hosted runtime with **Gemini** (`@copilotkit/runtime`, Express).
- **React** — UI and state.
- **Vite** — dev server and build.

### AI usage

AI coding tools (e.g. Cursor) were used for **ideas, boilerplate, project setup, and dependencies**, and to implement **responsiveness** (fluid layout, form wrapping, breakpoints), **features** (voice input, priority/due chips, break-into-tasks, contextual loading text), **smoothness** (transitions, scroll behavior, reduced-motion support), and **overall professional polish** (typography, icon, copy). The rest of the implementation and decisions were done by me.
