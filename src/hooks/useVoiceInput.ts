import { useCallback, useRef, useState } from 'react'

export type VoiceInputState = 'idle' | 'listening' | 'processing' | 'unsupported' | 'error'

const SpeechRecognitionCtor =
  typeof window !== 'undefined'
    ? (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
    : undefined

export function useVoiceInput(onResult: (transcript: string) => void) {
  const [state, setState] = useState<VoiceInputState>(SpeechRecognitionCtor ? 'idle' : 'unsupported')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current
    if (rec && (state === 'listening' || state === 'processing')) {
      try {
        rec.abort()
      } catch {
        // ignore
      }
      recognitionRef.current = null
      setState('idle')
    }
  }, [state])

  const startListening = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setState('unsupported')
      setErrorMessage('Voice input is not supported in this browser.')
      return
    }

    setErrorMessage(null)

    try {
      const rec = new SpeechRecognitionCtor()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = 'en-US'
      rec.maxAlternatives = 1

      rec.onstart = () => setState('listening')

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.resultIndex]
        const item = result[0]
        if (item && result.isFinal) {
          const text = item.transcript?.trim()
          if (text) {
            setState('processing')
            onResult(text)
          }
          setState('idle')
        }
      }

      rec.onend = () => {
        setState((s) => (s === 'listening' ? 'idle' : s))
        recognitionRef.current = null
      }

      rec.onerror = (event: Event) => {
        const e = event as { error?: string; message?: string }
        const err = e.error || e.message || 'Recognition error'
        if (err === 'aborted' || err === 'no-speech') {
          setState('idle')
        } else {
          setState('error')
          setErrorMessage(err === 'not-allowed' ? 'Microphone access was denied.' : `Voice error: ${err}`)
        }
        recognitionRef.current = null
      }

      recognitionRef.current = rec
      rec.start()
    } catch (err) {
      setState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Could not start voice input.')
    }
  }, [onResult, state])

  const toggle = useCallback(() => {
    if (state === 'listening' || state === 'processing') {
      stopListening()
    } else if (state === 'idle') {
      startListening()
    }
  }, [state, startListening, stopListening])

  return {
    state,
    errorMessage,
    isSupported: !!SpeechRecognitionCtor,
    startListening,
    stopListening,
    toggle,
    clearError: useCallback(() => {
      setErrorMessage(null)
      if (state === 'error') setState('idle')
    }, [state]),
  }
}
