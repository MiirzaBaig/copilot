import { useState, useCallback, useEffect } from 'react'
import { useCopilotAction, useCopilotChat, useCopilotReadable } from '@copilotkit/react-core'
import { TextMessage, Role } from '@copilotkit/runtime-client-gql'

const COPILOT_INSTRUCTIONS = `You are a task assistant. When the user gives you a task, improve it to be clearer and more actionable (e.g. add a verb, make it specific, or break into a short sentence). Your only response must be to call the addImprovedTask action with exactly one argument: improvedTaskText (the improved task string). Do not write or say anything in the chat—no visible reply. Only call the action; the task will appear in the user's list.`

const LOADING_PHRASES = [
  'Glowing up…',
  'Almost there…',
  'Finishing up…',
  'Polishing…',
  'No cap, almost done…',
  'Slay incoming…',
  'One sec…',
  'Making it hit…',
  'Bout to be done…',
  'Final touches…',
]

export function TaskAssistant() {
  const [tasks, setTasks] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState(0)

  const taskListForCopilot =
    tasks.length === 0 ? 'The list is empty.' : tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')
  const contextValue = String(taskListForCopilot ?? '')

  useCopilotReadable(
    {
      description:
        "The user's current task list. Each item is a task string. Use this when the user asks what's on their list, to summarize tasks, or to refer to tasks by position (e.g. first, second).",
      value: contextValue,
      convert: (_desc, v) => (typeof v === 'string' ? v : JSON.stringify(v ?? '')),
    },
    [contextValue]
  )

  useCopilotAction({
    name: 'addImprovedTask',
    description:
      "Add the user's task to their list after improving it. Call this with the improved task text only. Do not also write the task in the chat—only call this action.",
    parameters: [
      {
        name: 'improvedTaskText',
        type: 'string',
        description: 'The improved, clearer version of the task to add to the list',
        required: true,
      },
    ],
    handler: useCallback(async ({ improvedTaskText }: { improvedTaskText: string }) => {
      if (typeof improvedTaskText === 'string' && improvedTaskText.trim()) {
        setTasks((prev) => [...prev, improvedTaskText.trim()])
      }
    }, []),
  })

  const { appendMessage, isLoading: chatLoading } = useCopilotChat()
  const chatBusy = chatLoading ?? false

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const task = input.trim()
      if (!task || isLoading || chatBusy) return

      setIsLoading(true)
      setInput('')

      try {
        appendMessage(
          new TextMessage({
            role: Role.User,
            content: `${COPILOT_INSTRUCTIONS}\n\nTask to improve and add: ${task}`,
          })
        )
        // Give the copilot time to run and call the action; we don't await a response
        // The task list will update when addImprovedTask is called
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, chatBusy, appendMessage]
  )

  const busy = isLoading || chatBusy

  useEffect(() => {
    if (!busy) {
      setLoadingIndex(0)
      return
    }
    const id = setInterval(
      () => setLoadingIndex((i) => (i + 1) % LOADING_PHRASES.length),
      1200
    )
    return () => clearInterval(id)
  }, [busy])

  return (
    <div>
      <h1 className="neo-heading-1">Task glow-up</h1>
      <p className="neo-body">
        Drop a task below. AI gives it a glow-up and adds it to your list — no cap.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. touch grass, buy milk, whatever"
          disabled={busy}
          className="neo-input"
          style={{ flex: 1 }}
          aria-label="Task description"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="neo-btn"
        >
          {busy ? (
            <span key={loadingIndex} className="neo-btn-loading-text">
              {LOADING_PHRASES[loadingIndex]}
            </span>
          ) : (
            'Add it'
          )}
        </button>
      </form>

      <section aria-label="Task list">
        <h2 className="neo-heading-2">Your list</h2>
        {tasks.length === 0 ? (
          <p className="neo-empty">Nothing here yet. Drop one above 👇</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tasks.map((text, i) => (
              <li
                key={`${i}-${text.slice(0, 20)}`}
                className="neo-card"
                style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}
              >
                {text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
