import { CopilotKit } from '@copilotkit/react-core'
import { CopilotPopup } from '@copilotkit/react-ui'
import { TaskAssistant } from './TaskAssistant'

// CopilotKit Cloud – set VITE_COPILOT_CLOUD_API_KEY in .env
const publicApiKey = import.meta.env.VITE_COPILOT_CLOUD_API_KEY ?? ''
// Self-hosted Gemini server (commented out in server/index.js when using Cloud)
const runtimeUrl = import.meta.env.VITE_COPILOT_RUNTIME_URL ?? ''

export default function App() {
  const hasRuntime = !!publicApiKey || !!runtimeUrl

  return (
    <CopilotKit
      publicApiKey={publicApiKey || undefined}
      runtimeUrl={runtimeUrl || undefined}
    >
      <div className="neo-page">
        {!hasRuntime && (
          <p className="neo-banner" style={{ marginBottom: '1rem' }}>
            Set <code>VITE_COPILOT_CLOUD_API_KEY</code> in <code>.env</code> for CopilotKit Cloud.
          </p>
        )}
        <TaskAssistant />
      </div>
      {hasRuntime && (
        <CopilotPopup
          instructions="You are a task assistant. You have access to the user's task list (with optional priority and due). Single task: improve it and call addImprovedTask(improvedTaskText, priority?, due?). Notes or list: break into tasks and call addTasks([{ text, priority?, due? }, ...]). Do not reply in chat—only call the action(s)."
          labels={{ title: 'Task glow-up', initial: 'Drop a task or paste notes — we’ll glow it up or break it into tasks.' }}
        />
      )}
    </CopilotKit>
  )
}
