What We’re Building & Why
Goal

We want to build a small CopilotKit demo (Option B) that:

✔ Has a UI + AI interaction
✔ Uses CopilotKit’s agent integration (not just a plain chat box)
✔ Shows one meaningful interaction where AI updates app state or UI
✔ Includes a clear task.md / README with setup and explanation

This type of demo shows real engineering decisions — context awareness, UI updates, and app logic — exactly what CopilotKit is designed for, not just text chat.

💡 Prompt to Give to Cursor (or GitHub Copilot / AI Helper)

Use this prompt to generate starter code for your demo:

Generate a simple React UI using CopilotKit that allows a user to submit a task (text input). 
Use CopilotKit useAgent hook so that when a user adds a task, 
the AI agent suggests an improved version of that task, and the improved text updates the UI task list.
Include:
- Basic React UI (task input + submit button + task list)
- CopilotKit agent setup with a simple backend call (mock or basic prompt)
- A function that sends the entered task to the agent and receives an improved version
- Update the task list state based on the AI response

This gives you a working demo idea where the app does something meaningful with AI — it doesn’t just display text.

📌 What CopilotKit Actually Is (Short Summary)

👉 CopilotKit is an open-source agentic application framework for building AI copilots inside apps — with stateful, context-aware interactions and UI control. It’s not just chat — the AI can interact with your app’s data, actions, and view.

It uses the AG-UI protocol (Agent–User Interaction) to connect any agent backend (LLMs or agent frameworks) to a frontend UI, syncing state and allowing interactive agent experiences.

Example

With CopilotKit, your AI can do things like:
✔ Suggest improvements to user tasks
✔ Fill or validate forms based on context
✔ Generate UI components or updates
✔ Execute actions in your app (not just reply text)
✔ Sync state between UI and agent in real-time

This is why a task-assistant demo (where AI updates the task list) is ideal.

📝 task.md (or README Explanation File)

Create a file in your repo named task.md and paste this:

# CopilotKit Demo — Smart Task Assistant

## What We’re Building
A simple React + CopilotKit demo where users can add a task, 
and an AI agent suggests an improved version of that task.

This demonstrates:
- UI + AI integration
- Shared state updates
- Meaningful agent interaction (AI improves task descriptions)

## Setup
1. Clone the repo
2. Install dependencies

npm install

3. Run the app

npm start


## How It Works
- The UI has a text input for task names.
- When a task is submitted, we call CopilotKit’s agent using the `useAgent` hook.
- The agent returns an improved task description.
- The improved task replaces the original in the task list.

## What We’d Improve with More Time
- Add persistent storage (localStorage or backend)
- Add multiple suggestion types (priority, category)
- Add more actions (delete, edit, assign, due date, etc.)

## Tools Used
- CopilotKit (React SDK & hooks)
- React (UI)
- AI agent backend (any LLM configured via CopilotKit)

This file makes your thought process as clear as possible — recruiters love structured explanations.

📌 What We Are Not Doing

❌ A plain AI chat box with static responses
❌ UI that doesn’t interact with app state
❌ A demo with only placeholder text

We’re doing something where:
🔹 User input → AI suggestion → UI updated meaningfully
🔹 CopilotKit manages agent interaction + shared state
🔹 It feels like part of an actual app, not just a dummy chat.