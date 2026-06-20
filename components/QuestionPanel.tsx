'use client'

import type { Question } from '@prisma/client'

interface Props {
  questions: Question[]
  passageOrder: number
  answers: Record<string, string>
  flagged: Set<string>
  onAnswer: (questionId: string, value: string) => void
  onFlag: (questionId: string) => void
}

const TFN_OPTIONS = ['True', 'False', 'Not Given']
const YNNG_OPTIONS = ['Yes', 'No', 'Not Given']

export default function QuestionPanel({ questions, passageOrder, answers, flagged, onAnswer, onFlag }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
        Passage {passageOrder} — Câu hỏi
      </p>
      {questions.map((q) => (
        <div
          key={q.id}
          className={`rounded-xl border p-4 transition-all ${
            flagged.has(q.id)
              ? 'border-amber-300 bg-amber-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <p className="text-sm text-slate-800 leading-relaxed">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full mr-2 shrink-0 align-middle">
                {q.order}
              </span>
              {q.prompt}
            </p>
            <button
              onClick={() => onFlag(q.id)}
              title="Đánh dấu để xem lại"
              className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-lg border transition text-base ${
                flagged.has(q.id)
                  ? 'border-amber-400 text-amber-500 bg-amber-50'
                  : 'border-slate-200 text-slate-300 hover:border-amber-400 hover:text-amber-400'
              }`}
            >
              {flagged.has(q.id) ? '★' : '☆'}
            </button>
          </div>

          {/* Multiple choice */}
          {q.type === 'MULTIPLE_CHOICE' && Array.isArray(q.options) && (
            <div className="space-y-2 mt-3">
              {(q.options as string[]).map((opt, i) => {
                const letter = String.fromCharCode(65 + i)
                const selected = answers[q.id] === letter
                return (
                  <label
                    key={i}
                    className={`flex items-start gap-3 text-sm cursor-pointer px-3 py-2.5 rounded-lg border transition ${
                      selected
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={letter}
                      checked={selected}
                      onChange={() => onAnswer(q.id, letter)}
                      className="mt-0.5 accent-blue-600 shrink-0"
                    />
                    <span>
                      <span className="font-semibold mr-1.5">{letter}.</span>
                      {opt}
                    </span>
                  </label>
                )
              })}
            </div>
          )}

          {/* True/False/Not Given */}
          {(q.type === 'TRUE_FALSE_NOT_GIVEN' || q.type === 'YES_NO_NOT_GIVEN') && (
            <div className="flex gap-2 mt-3">
              {(q.type === 'TRUE_FALSE_NOT_GIVEN' ? TFN_OPTIONS : YNNG_OPTIONS).map((opt) => {
                const selected = answers[q.id] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => onAnswer(q.id, opt)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {/* Fill in blank / Short answer / Summary / Matching */}
          {['FILL_IN_THE_BLANK', 'SHORT_ANSWER', 'SUMMARY_COMPLETION', 'MATCHING_INFORMATION', 'MATCHING_FEATURES'].includes(q.type) && (
            <input
              type="text"
              value={answers[q.id] ?? ''}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              placeholder="Nhập câu trả lời..."
              className="mt-3 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {/* Matching headings */}
          {q.type === 'MATCHING_HEADINGS' && Array.isArray(q.options) && (
            <select
              value={answers[q.id] ?? ''}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              className="mt-3 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">— Chọn tiêu đề —</option>
              {(q.options as string[]).map((opt, i) => (
                <option key={i} value={String.fromCharCode(105 + i)}>
                  {String.fromCharCode(105 + i)}. {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  )
}
