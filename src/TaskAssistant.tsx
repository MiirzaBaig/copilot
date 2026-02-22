import { useState, useCallback, useEffect, useRef } from 'react'
import { useCopilotAction, useCopilotChat, useCopilotReadable } from '@copilotkit/react-core'
import { TextMessage, Role } from '@copilotkit/runtime-client-gql'
import { useVoiceInput } from './hooks/useVoiceInput'

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}

function TaskGlowIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="6" fill="var(--neo-surface)" stroke="var(--neo-border)" strokeWidth="3" />
      <line x1="8" y1="9" x2="18" y2="9" stroke="var(--neo-border)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="14" x2="16" y2="14" stroke="var(--neo-border)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="19" x2="14" y2="19" stroke="var(--neo-border)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 10l1.5 3 3 .5-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.5z" fill="var(--neo-accent)" stroke="var(--neo-border)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export type TaskPriority = 'low' | 'medium' | 'high'
export interface Task {
  id: string
  text: string
  priority?: TaskPriority
  due?: string
}

const COPILOT_INSTRUCTIONS = `You are a task assistant with two modes:

1) Single task: User gives one task. Improve it (clearer, actionable, add a verb). Optionally suggest priority (low/medium/high) and/or due (e.g. "today", "tomorrow", "next week", or a short date). Call addImprovedTask(improvedTaskText, priority?, due?).

2) Break into tasks: User gives notes, a list, or a paragraph. Break it into separate, clear tasks. For each, optionally suggest priority and due. Call addTasks with an array of { text, priority?, due? }. Do not duplicate tasks already on the user's list.

Do not write or say anything in the chat—no visible reply. Only call the action(s); tasks will appear in the user's list with priority/due chips when provided.`

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

function contextualLoadingPhrases(userInput: string): string[] {
  const short = userInput.length > 28 ? `${userInput.slice(0, 25)}…` : userInput
  return [
    `Glowing up "${short}"…`,
    'Almost there…',
    `Polishing "${short}"…`,
    'No cap, almost done…',
    'Slay incoming…',
    'One sec…',
    `Making "${short}" hit…`,
    'Bout to be done…',
    'Final touches…',
    `Finishing up "${short}"…`,
  ]
}

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function TaskAssistant() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [lastSubmittedText, setLastSubmittedText] = useState('')

  const taskListForCopilot =
    tasks.length === 0
      ? 'The list is empty.'
      : tasks
          .map(
            (t, i) =>
              `${i + 1}. ${t.text}${t.priority ? ` [priority: ${t.priority}]` : ''}${t.due ? ` [due: ${t.due}]` : ''}`
          )
          .join('\n')
  const contextValue = String(taskListForCopilot ?? '')

  useCopilotReadable(
    {
      description:
        "The user's current task list. Each item may have text, optional priority (low/medium/high), and optional due. Use when the user asks what's on their list or to avoid duplicating. For 'break into tasks', do not add tasks that are already listed.",
      value: contextValue,
      convert: (_desc, v) => (typeof v === 'string' ? v : JSON.stringify(v ?? '')),
    },
    [contextValue]
  )

  useCopilotAction({
    name: 'addImprovedTask',
    description:
      'Add one improved task. Optionally include priority (low/medium/high) and/or due (e.g. today, tomorrow, next week). Do not write the task in the chat—only call this action.',
    parameters: [
      { name: 'improvedTaskText', type: 'string', description: 'The improved task text', required: true },
      {
        name: 'priority',
        type: 'string',
        description: 'Optional: low, medium, or high',
        required: false,
      },
      {
        name: 'due',
        type: 'string',
        description: 'Optional: e.g. today, tomorrow, next week, or a short date',
        required: false,
      },
    ],
    handler: useCallback(
      async ({
        improvedTaskText,
        priority,
        due,
      }: {
        improvedTaskText: string
        priority?: string
        due?: string
      }) => {
        if (typeof improvedTaskText !== 'string' || !improvedTaskText.trim()) return
        const p = priority?.toLowerCase()
        const validPriority =
          p === 'low' || p === 'medium' || p === 'high' ? (p as TaskPriority) : undefined
        setTasks((prev) => [
          ...prev,
          { id: nextId(), text: improvedTaskText.trim(), priority: validPriority, due: due?.trim() || undefined },
        ])
      },
      []
    ),
  })

  useCopilotAction({
    name: 'addTasks',
    description:
      'Add multiple tasks at once (e.g. when user pastes notes or a list—break into separate tasks). Each item can have text, optional priority, optional due. Do not duplicate tasks already on the list. Do not write in chat—only call this action.',
    parameters: [
      {
        name: 'tasks',
        type: 'object[]',
        description: 'Array of { text: string, priority?: "low"|"medium"|"high", due?: string }',
        required: true,
      },
    ],
    handler: useCallback(async ({ tasks: newTasks }: { tasks: Array<{ text: string; priority?: string; due?: string }> }) => {
      if (!Array.isArray(newTasks) || newTasks.length === 0) return
      const toAdd: Task[] = newTasks
        .filter((t) => t && typeof t.text === 'string' && t.text.trim())
        .map((t) => {
          const p = t.priority?.toLowerCase()
          const priority =
            p === 'low' || p === 'medium' || p === 'high' ? (p as TaskPriority) : undefined
          return {
            id: nextId(),
            text: t.text.trim(),
            priority,
            due: t.due?.trim() || undefined,
          }
        })
      setTasks((prev) => [...prev, ...toAdd])
    }, []),
  })

  const { appendMessage, isLoading: chatLoading } = useCopilotChat()
  const chatBusy = chatLoading ?? false

  const submitTask = useCallback(
    async (taskText: string) => {
      const task = taskText.trim()
      if (!task || isLoading || chatBusy) return
      setLastSubmittedText(task)
      setIsLoading(true)
      const minLoadingMs = 1200
      const start = Date.now()
      try {
        const result = appendMessage(
          new TextMessage({
            role: Role.User,
            content: `${COPILOT_INSTRUCTIONS}\n\nTask to improve and add: ${task}`,
          })
        )
        if (result && typeof (result as Promise<unknown>).then === 'function') {
          await (result as Promise<unknown>)
        }
      } finally {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, minLoadingMs - elapsed)
        if (remaining > 0) {
          await new Promise((r) => setTimeout(r, remaining))
        }
        setIsLoading(false)
      }
    },
    [isLoading, chatBusy, appendMessage]
  )

  const {
    state: voiceState,
    errorMessage: voiceError,
    isSupported: voiceSupported,
    toggle: voiceToggle,
    clearError: clearVoiceError,
  } = useVoiceInput(
    useCallback(
      (transcript) => {
        setInput(transcript)
        submitTask(transcript)
      },
      [submitTask]
    )
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const task = input.trim()
      if (!task || isLoading || chatBusy) return
      setInput('')
      await submitTask(task)
    },
    [input, isLoading, chatBusy, submitTask]
  )

  const busy = isLoading || chatBusy
  const voiceDisabled = busy || voiceState === 'processing'

  const prevLoadingRef = useRef(false)
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      setInput('')
      setLastSubmittedText('')
    }
    prevLoadingRef.current = isLoading
  }, [isLoading])

  const loadingPhrases = lastSubmittedText
    ? contextualLoadingPhrases(lastSubmittedText)
    : LOADING_PHRASES

  useEffect(() => {
    if (!isLoading) {
      setLoadingIndex(0)
      return
    }
    const id = setInterval(
      () => setLoadingIndex((i) => (i + 1) % loadingPhrases.length),
      1200
    )
    return () => clearInterval(id)
  }, [isLoading, loadingPhrases.length])

  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <span className="neo-app-icon" aria-hidden>
          <TaskGlowIcon />
        </span>
        <h1 className="neo-heading-1" style={{ margin: 0 }}>Task glow-up</h1>
      </header>
      <p className="neo-body">
        Type, paste, or use the mic. AI improves it (or breaks notes into tasks), suggests priority/due, and adds to your list — no cap.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <div className="neo-form-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. buy milk, or paste notes to break into tasks"
            disabled={busy}
            className="neo-input"
            style={{ flex: 1 }}
            aria-label="Task description"
          />
          {voiceSupported ? (
            <button
              type="button"
              onClick={voiceToggle}
              disabled={voiceDisabled}
              className={`neo-voice-btn ${voiceState === 'listening' ? 'neo-voice-btn--listening' : ''}`}
              aria-label={voiceState === 'listening' ? 'Stop listening' : 'Voice input'}
              aria-pressed={voiceState === 'listening'}
              title={voiceState === 'listening' ? 'Stop listening' : 'Add task by voice'}
            >
              <MicIcon />
            </button>
          ) : null}
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="neo-btn"
          >
            {isLoading ? (
              <span key={loadingIndex} className="neo-btn-loading-text">
                {loadingPhrases[loadingIndex]}
              </span>
            ) : (
              'Add it'
            )}
          </button>
        </div>
        {voiceError && (
          <p className="neo-voice-error" role="alert">
            {voiceError}
            <button
              type="button"
              onClick={clearVoiceError}
              style={{ marginLeft: '0.5rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </p>
        )}
      </form>

      <section aria-label="Task list">
        <h2 className="neo-heading-2">Your list</h2>
        {tasks.length === 0 ? (
          <p className="neo-empty">Nothing here yet. Drop one above or paste notes to break into tasks 👇</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tasks.map((task) => (
              <li
                key={task.id}
                className="neo-card"
                style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}
              >
                <span>{task.text}</span>
                {(task.priority || task.due) && (
                  <div className="neo-chips">
                    {task.priority && (
                      <span
                        className={`neo-chip neo-chip--priority-${task.priority}`}
                        aria-label={`Priority: ${task.priority}`}
                      >
                        {task.priority}
                      </span>
                    )}
                    {task.due && (
                      <span className="neo-chip neo-chip--due" aria-label={`Due: ${task.due}`}>
                        due {task.due}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
