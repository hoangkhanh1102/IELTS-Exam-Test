'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import WordPopover from '@/components/WordPopover'
import QuestionPanel from '@/components/QuestionPanel'
import QuestionNav from '@/components/QuestionNav'
import Timer from '@/components/Timer'
import type { Prisma } from '@prisma/client'

type TestWithPassages = Prisma.TestGetPayload<{
  include: { passages: { include: { questions: true } } }
}>
type AttemptWithAnswers = Prisma.AttemptGetPayload<{ include: { answers: true } }>

interface Props {
  test: TestWithPassages
  attempt: AttemptWithAnswers
}

export default function TestClient({ test, attempt }: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [passageWidth, setPassageWidth] = useState(50)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      // Limit range to 25% - 75%
      if (newWidth >= 25 && newWidth <= 75) {
        setPassageWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])
  const allQuestions = test.passages.flatMap((p) => p.questions)
  const totalQ = allQuestions.length

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    attempt.answers.forEach((a) => {
      if (a.studentAnswer) init[a.questionId] = a.studentAnswer
    })
    return init
  })

  const [flagged, setFlagged] = useState<Set<string>>(() => {
    const s = new Set<string>()
    attempt.answers.forEach((a) => { if (a.flagged) s.add(a.questionId) })
    return s
  })

  const [activePassageIdx, setActivePassageIdx] = useState(0)
  const [popover, setPopover] = useState<{ word: string; x: number; y: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [mobileTab, setMobileTab] = useState<'passage' | 'questions'>('passage')

  const activePassage = test.passages[activePassageIdx]
  const passageQuestions = activePassage.questions

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveAnswer = useCallback(
    (questionId: string, value: string, isFlagged: boolean) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        fetch(`/api/attempts/${attempt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, studentAnswer: value, flagged: isFlagged }),
        })
      }, 600)
    },
    [attempt.id]
  )

  function handleAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    saveAnswer(questionId, value, flagged.has(questionId))
  }

  function toggleFlag(questionId: string) {
    setFlagged((prev) => {
      const next = new Set(prev)
      next.has(questionId) ? next.delete(questionId) : next.add(questionId)
      saveAnswer(questionId, answers[questionId] ?? '', next.has(questionId))
      return next
    })
  }

  function handleWordClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (target.tagName !== 'SPAN' || !target.dataset.word) return
    const rect = target.getBoundingClientRect()
    setPopover({ word: target.dataset.word, x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY + 6 })
  }

  function tokenizePassage(text: string) {
    return text.replace(/\b([a-zA-Z'-]+)\b/g, (match) =>
      `<span data-word="${match.toLowerCase()}" class="cursor-pointer hover:bg-yellow-100 rounded px-0.5 transition">${match}</span>`
    )
  }

  async function handleSubmit() {
    setSubmitting(true)
    await fetch(`/api/attempts/${attempt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit' }),
    })
    router.push(`/tests/${test.id}/results/${attempt.id}`)
  }

  const answeredCount = Object.keys(answers).length
  const unansweredCount = totalQ - answeredCount

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-0 flex items-center justify-between shrink-0 h-14 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-semibold text-black text-sm truncate">{test.title}</span>
          <div className="hidden sm:flex gap-1 ml-2">
            {test.passages.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActivePassageIdx(i)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                  i === activePassageIdx
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                P{p.order}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Timer limitMinutes={test.timeLimit} onExpire={() => setShowSubmitModal(true)} />
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            Nộp bài
          </button>
        </div>
      </header>

      {/* Mobile tab */}
      <div className="sm:hidden flex border-b border-slate-200 bg-white shrink-0">
        <button
          onClick={() => setMobileTab('passage')}
          className={`flex-1 py-2.5 text-xs font-semibold transition ${mobileTab === 'passage' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
        >
          Bài đọc
        </button>
        <button
          onClick={() => setMobileTab('questions')}
          className={`flex-1 py-2.5 text-xs font-semibold transition ${mobileTab === 'questions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
        >
          Câu hỏi ({answeredCount}/{totalQ})
        </button>
      </div>

      {/* Main layout */}
      <div 
        ref={containerRef}
        className={`flex flex-1 overflow-hidden ${isResizing ? 'select-none pointer-events-none' : ''}`}
        style={{
          '--passage-width': `${passageWidth}%`,
          '--questions-width': `${100 - passageWidth}%`
        } as React.CSSProperties}
      >
        {/* Passage panel */}
        <div className={`${mobileTab === 'questions' ? 'hidden' : 'flex'} sm:flex flex-col w-full sm:w-[var(--passage-width,50%)] bg-white border-r border-slate-200 overflow-y-auto`}>
          <div className="p-6 sm:p-8 max-w-2xl">
            <div className="mb-5">
              {activePassage.topic && (
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">{activePassage.topic}</p>
              )}
              <h2 className="text-xl font-bold text-slate-900 leading-snug">{activePassage.title}</h2>
            </div>
            <div
              className="text-slate-900 text-[15px] leading-8 select-text"
              onClick={handleWordClick}
              dangerouslySetInnerHTML={{ __html: tokenizePassage(activePassage.body) }}
            />
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          onMouseDown={startResizing}
          className="hidden sm:flex w-1.5 hover:w-2 bg-slate-200 hover:bg-blue-500 cursor-col-resize transition-all items-center justify-center z-20 self-stretch group pointer-events-auto"
        >
          {/* Grab handle indicator */}
          <div className="w-0.5 h-10 bg-slate-400 group-hover:bg-white rounded-full transition-colors" />
        </div>

        {/* Questions panel */}
        <div className={`${mobileTab === 'passage' ? 'hidden' : 'flex'} sm:flex flex-col w-full sm:w-[var(--questions-width,50%)] overflow-y-auto bg-slate-50`}>
          <div className="p-4 space-y-4">
            <QuestionNav
              questions={allQuestions}
              answers={answers}
              flagged={flagged}
              passages={test.passages}
              activePassageIdx={activePassageIdx}
              onSelectPassage={setActivePassageIdx}
            />
            <QuestionPanel
              questions={passageQuestions}
              passageOrder={activePassage.order}
              answers={answers}
              flagged={flagged}
              onAnswer={handleAnswer}
              onFlag={toggleFlag}
            />
          </div>
        </div>
      </div>

      {/* Word popover */}
      {popover && (
        <WordPopover word={popover.word} x={popover.x} y={popover.y} onClose={() => setPopover(null)} />
      )}

      {/* Submit modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Nộp bài?</h3>
            <p className="text-slate-500 text-sm text-center mb-1">
              Đã trả lời <strong className="text-slate-800">{answeredCount}/{totalQ}</strong> câu
            </p>
            {unansweredCount > 0 && (
              <p className="text-amber-600 text-sm text-center mb-4">
                Còn <strong>{unansweredCount}</strong> câu chưa trả lời
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition"
              >
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
