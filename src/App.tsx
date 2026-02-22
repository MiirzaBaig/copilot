import { CopilotKit } from '@copilotkit/react-core'
import { CopilotPopup } from '@copilotkit/react-ui'
import { TaskAssistant } from './TaskAssistant'

const publicApiKey = import.meta.env.VITE_COPILOT_CLOUD_API_KEY ?? ''

export default function App() {
  const hasRuntime = !!publicApiKey

  return (
    <CopilotKit publicApiKey={hasRuntime ? publicApiKey : undefined}>
      <div className="neo-page">
        {!hasRuntime && (
          <p className="neo-banner" style={{ marginBottom: '1rem' }}>
            Set <code>VITE_COPILOT_CLOUD_API_KEY</code> in <code>.env</code> and restart. Get a free key at{' '}
            <a href="https://cloud.copilotkit.ai" target="_blank" rel="noreferrer">cloud.copilotkit.ai</a>.
          </p>
        )}
        <TaskAssistant />
      </div>
      {hasRuntime && (
        <CopilotPopup
          instructions="You are a task assistant. You have access to the user's current task list (use it when they ask what's on their list or to summarize). When the user gives you a new task to add, improve it and call the addImprovedTask action with the improved text. Do not reply in chat with the task—only call the action."
          labels={{ title: 'Task glow-up', initial: 'Drop a task above — we’ll make it hit different.' }}
        />
      )}
    </CopilotKit>
  )
}
