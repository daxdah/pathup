"use client"

import { useReducer, useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, Check } from "lucide-react"
import {
  ALL_QUESTIONS,
  QUESTION_BLOCKS,
  QUESTIONNAIRE_INTRO,
  type Question,
} from "@/data/questionnaire/questions"
import { Analytics } from "@/lib/analytics/track"

interface QuestionnaireState {
  phase: "intro" | "questions" | "transition" | "processing" | "error"
  current_question_index: number
  current_block: number
  answers: Record<string, unknown>
  session_id: string
  transition_text: string
  error_message: string
}

type Action =
  | { type: "START" }
  | { type: "ANSWER"; question_id: string; value: unknown }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SKIP" }
  | { type: "CONTINUE_FROM_TRANSITION" }
  | { type: "SET_PROCESSING" }
  | { type: "SET_ERROR"; message: string }

function makeSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

const INITIAL_STATE: QuestionnaireState = {
  phase: "intro",
  current_question_index: 0,
  current_block: 1,
  answers: {},
  session_id: makeSessionId(),
  transition_text: "",
  error_message: "",
}

function reducer(state: QuestionnaireState, action: Action): QuestionnaireState {
  switch (action.type) {
    case "START":
      return { ...state, phase: "questions" }

    case "ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.question_id]: action.value },
      }

    case "NEXT": {
      const nextIndex = state.current_question_index + 1
      if (nextIndex >= ALL_QUESTIONS.length) {
        return { ...state, phase: "processing" }
      }
      const nextQuestion = ALL_QUESTIONS[nextIndex]
      const currentBlock = ALL_QUESTIONS[state.current_question_index].block
      const nextBlock = nextQuestion.block

      if (nextBlock !== currentBlock) {
        const blockConfig = QUESTION_BLOCKS.find((b) => b.number === currentBlock)
        if (blockConfig?.transition_text) {
          return {
            ...state,
            phase: "transition",
            transition_text: blockConfig.transition_text,
            current_question_index: nextIndex,
            current_block: nextBlock,
          }
        }
      }

      return {
        ...state,
        current_question_index: nextIndex,
        current_block: nextBlock,
      }
    }

    case "BACK": {
      const prevIndex = Math.max(0, state.current_question_index - 1)
      return {
        ...state,
        current_question_index: prevIndex,
        current_block: ALL_QUESTIONS[prevIndex].block,
        phase: "questions",
      }
    }

    case "SKIP":
      return { ...state, phase: "processing" }

    case "CONTINUE_FROM_TRANSITION":
      return { ...state, phase: "questions" }

    case "SET_PROCESSING":
      return { ...state, phase: "processing" }

    case "SET_ERROR":
      return { ...state, phase: "error", error_message: action.message }

    default:
      return state
  }
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const submitCalledRef = useRef(false)

  const currentQuestion = ALL_QUESTIONS[state.current_question_index]
  const currentAnswer = state.answers[currentQuestion?.id]
  const totalRequired = ALL_QUESTIONS.filter((q) => q.required).length
  const answeredRequired = Object.keys(state.answers).filter(
    (id) => ALL_QUESTIONS.find((q) => q.id === id)?.required
  ).length
  const progress = Math.round((answeredRequired / totalRequired) * 100)

  const canAdvance = useCallback(() => {
    if (!currentQuestion?.required) return true
    const answer = state.answers[currentQuestion.id]
    if (currentQuestion.type === "multi") {
      return Array.isArray(answer) && answer.length > 0
    }
    return answer !== undefined && answer !== ""
  }, [currentQuestion, state.answers])

  const handleAnswer = (value: unknown) => {
    dispatch({ type: "ANSWER", question_id: currentQuestion.id, value })
    if (currentQuestion.type === "single") {
      setTimeout(() => dispatch({ type: "NEXT" }), 280)
    }
  }

  // Submit runs only once when phase becomes "processing"
  useEffect(() => {
    if (state.phase !== "processing") return
    if (submitCalledRef.current) return
    submitCalledRef.current = true

    const payload = {
      ...state.answers,
      submitted_at: new Date().toISOString(),
      session_id: state.session_id,
    }

    fetch("/api/questionnaire/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Submit failed")
        return res.json()
      })
      .then(({ session_id }) => {
        router.push(`/report/${session_id}`)
      })
      .catch(() => {
        submitCalledRef.current = false
        dispatch({ type: "SET_ERROR", message: "Что-то пошло не так. Попробуй ещё раз." })
      })
  }, [state.phase])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {state.phase === "questions" && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-[#1A1A1A]">
          <div
            className="h-full bg-[#C8F060] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {state.phase === "intro" && (
          <IntroScreen onStart={() => dispatch({ type: "START" })} />
        )}

        {state.phase === "questions" && currentQuestion && (
          <QuestionScreen
            question={currentQuestion}
            answer={currentAnswer}
            questionIndex={state.current_question_index}
            totalQuestions={ALL_QUESTIONS.length}
            block={state.current_block}
            canAdvance={canAdvance()}
            onAnswer={handleAnswer}
            onNext={() => dispatch({ type: "NEXT" })}
            onBack={() => dispatch({ type: "BACK" })}
            onSkip={currentQuestion.required ? undefined : () => dispatch({ type: "SKIP" })}
          />
        )}

        {state.phase === "transition" && (
          <TransitionScreen
            text={state.transition_text}
            onContinue={() => dispatch({ type: "CONTINUE_FROM_TRANSITION" })}
          />
        )}

        {state.phase === "processing" && <ProcessingScreen />}

        {state.phase === "error" && (
          <ErrorScreen
            message={state.error_message}
            onRetry={() => {
              submitCalledRef.current = false
              dispatch({ type: "SET_PROCESSING" })
            }}
          />
        )}
      </div>
    </div>
  )
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-md w-full">
      <div className="mb-8">
        <span className="text-[#C8F060] font-semibold text-sm tracking-tight">PathUp</span>
      </div>
      <h1 className="text-2xl font-bold mb-4 leading-tight">
        {QUESTIONNAIRE_INTRO.title}
      </h1>
      <p className="text-[#888880] text-sm leading-relaxed mb-8 whitespace-pre-line">
        {QUESTIONNAIRE_INTRO.body}
      </p>
      <button
        onClick={onStart}
        className="group flex items-center gap-2 bg-[#C8F060] text-[#0A0A0A] font-semibold px-6 py-3 rounded-xl hover:bg-[#D8FF70] transition-all"
      >
        {QUESTIONNAIRE_INTRO.cta}
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
}

function QuestionScreen({
  question, answer, questionIndex, totalQuestions, block,
  canAdvance, onAnswer, onNext, onBack, onSkip,
}: {
  question: Question<any>
  answer: unknown
  questionIndex: number
  totalQuestions: number
  block: number
  canAdvance: boolean
  onAnswer: (v: unknown) => void
  onNext: () => void
  onBack: () => void
  onSkip?: () => void
}) {
  return (
    <div className="max-w-lg w-full" key={question.id}>
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xs font-mono text-[#555550]">
          {questionIndex + 1} / {totalQuestions}
        </span>
        <span className="text-[#2A2A2A]">·</span>
        <span className="text-xs text-[#555550]">блок {block}</span>
      </div>

      <h2 className="text-xl font-semibold mb-2 leading-snug">{question.wording}</h2>
      {question.subtext
        ? <p className="text-sm text-[#555550] mb-6">{question.subtext}</p>
        : <div className="mb-6" />
      }

      {question.type === "single" && (
        <SingleChoice options={question.options ?? []} value={answer as string} onChange={onAnswer} />
      )}
      {question.type === "multi" && (
        <MultiChoice
          options={question.options ?? []}
          value={(answer as string[]) ?? []}
          maxSelect={question.max_select}
          onChange={onAnswer}
        />
      )}
      {question.type === "free_text" && (
        <FreeText
          value={(answer as string) ?? ""}
          placeholder={question.placeholder}
          maxLength={question.max_length}
          onChange={onAnswer}
        />
      )}

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#555550] hover:text-[#888880] transition-colors"
        >
          <ArrowLeft size={14} />
          Назад
        </button>

        <div className="flex items-center gap-3">
          {onSkip && (
            <button onClick={onSkip} className="text-sm text-[#555550] hover:text-[#888880] transition-colors">
              Пропустить
            </button>
          )}
          {question.type !== "single" && (
            <button
              onClick={onNext}
              disabled={!canAdvance}
              className="flex items-center gap-2 bg-[#C8F060] text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#D8FF70] transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              Далее
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SingleChoice({ options, value, onChange }: {
  options: Array<{ value: any; label: string; hint?: string }>
  value: any
  onChange: (v: any) => void
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 ${
              selected
                ? "border-[#C8F060] bg-[#C8F060]/10 text-[#E8E4DC]"
                : "border-[#2A2A2A] bg-[#111111] text-[#888880] hover:border-[#3A3A3A] hover:text-[#E8E4DC]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                selected ? "border-[#C8F060] bg-[#C8F060]" : "border-[#3A3A3A]"
              }`}>
                {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
              </div>
              <div>
                <span className="text-sm font-medium">{opt.label}</span>
                {opt.hint && <span className="text-xs text-[#555550] ml-2">{opt.hint}</span>}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function MultiChoice({ options, value, maxSelect, onChange }: {
  options: Array<{ value: any; label: string }>
  value: any[]
  maxSelect?: number
  onChange: (v: any[]) => void
}) {
  const toggle = (optValue: any) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else {
      if (maxSelect && value.length >= maxSelect) return
      onChange([...value, optValue])
    }
  }

  return (
    <div className="space-y-2">
      {maxSelect && (
        <p className="text-xs text-[#555550] mb-4">Выбрано {value.length} из {maxSelect}</p>
      )}
      {options.map((opt) => {
        const selected = value.includes(opt.value)
        const disabled = !selected && !!maxSelect && value.length >= maxSelect
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            disabled={disabled}
            className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 ${
              selected
                ? "border-[#C8F060] bg-[#C8F060]/10 text-[#E8E4DC]"
                : disabled
                ? "border-[#1A1A1A] bg-[#0D0D0D] text-[#444440] cursor-not-allowed"
                : "border-[#2A2A2A] bg-[#111111] text-[#888880] hover:border-[#3A3A3A] hover:text-[#E8E4DC]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                selected ? "border-[#C8F060] bg-[#C8F060]" : "border-[#3A3A3A]"
              }`}>
                {selected && <Check size={10} className="text-[#0A0A0A]" strokeWidth={3} />}
              </div>
              <span className="text-sm font-medium">{opt.label}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function FreeText({ value, placeholder, maxLength, onChange }: {
  value: string
  placeholder?: string
  maxLength?: number
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className="w-full bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#E8E4DC] placeholder:text-[#444440] resize-none focus:outline-none focus:border-[#C8F060] transition-colors"
      />
      {maxLength && (
        <span className="absolute bottom-3 right-3 text-xs text-[#444440]">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  )
}

function TransitionScreen({ text, onContinue }: { text: string; onContinue: () => void }) {
  return (
    <div className="max-w-sm w-full text-center">
      <p className="text-lg text-[#888880] mb-8">{text}</p>
      <button
        onClick={onContinue}
        className="group flex items-center gap-2 bg-[#1A1A1A] text-[#E8E4DC] font-medium px-6 py-3 rounded-xl hover:bg-[#222222] transition-all mx-auto border border-[#2A2A2A]"
      >
        Продолжить
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
}

function ProcessingScreen() {
  const steps = [
    "Анализируем твои интересы и активности...",
    "Определяем главный барьер...",
    "Подбираем подходящие траектории...",
    "Составляем план на 7, 30 и 90 дней...",
  ]
  const [visibleSteps, setVisibleSteps] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev >= steps.length) {
          clearInterval(timer)
          return prev
        }
        return prev + 1
      })
    }, 1200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="max-w-sm w-full">
      <div className="w-8 h-8 border-2 border-[#C8F060] border-t-transparent rounded-full animate-spin mb-10" />
      <div className="space-y-3">
        {steps.slice(0, visibleSteps).map((step, i) => (
          <p key={i} className="text-sm text-[#888880]">{step}</p>
        ))}
      </div>
    </div>
  )
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-sm w-full text-center">
      <p className="text-[#888880] mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-[#C8F060] text-[#0A0A0A] font-semibold px-6 py-3 rounded-xl hover:bg-[#D8FF70] transition-all"
      >
        Попробовать снова
      </button>
    </div>
  )
}
