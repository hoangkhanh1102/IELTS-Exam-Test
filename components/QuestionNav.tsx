'use client'

import type { Passage, Question } from '@prisma/client'

interface Props {
  questions: Question[]
  answers: Record<string, string>
  flagged: Set<string>
  passages: (Passage & { questions: Question[] })[]
  activePassageIdx: number
  onSelectPassage: (i: number) => void
}

export default function QuestionNav({ questions, answers, flagged, passages, activePassageIdx, onSelectPassage }: Props) {
  const getStatus = (q: Question) => {
    if (flagged.has(q.id)) return 'flagged'
    if (answers[q.id]) return 'answered'
    return 'unanswered'
  }

  const totalAnswered = questions.filter((q) => answers[q.id]).length

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiến độ</span>
        <span className="text-xs font-semibold text-slate-700">{totalAnswered}/{questions.length}</span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all"
          style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
        />
      </div>

      {passages.map((p, pi) => (
        <div key={p.id} className="mb-3 last:mb-0">
          <button
            onClick={() => onSelectPassage(pi)}
            className={`text-xs font-semibold mb-2 px-2 py-0.5 rounded-md transition ${pi === activePassageIdx ? 'text-blue-700 bg-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            Passage {p.order}
          </button>
          <div className="flex flex-wrap gap-1.5">
            {p.questions.map((q) => {
              const status = getStatus(q)
              return (
                <button
                  key={q.id}
                  onClick={() => onSelectPassage(pi)}
                  title={`Câu ${q.order}`}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg transition
                    ${status === 'answered' ? 'bg-blue-500 text-white shadow-sm' : ''}
                    ${status === 'flagged' ? 'bg-amber-400 text-white shadow-sm' : ''}
                    ${status === 'unanswered' ? 'bg-white border border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600' : ''}
                  `}
                >
                  {q.order}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-200">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />Đã trả lời
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />Đánh dấu
        </span>
      </div>
    </div>
  )
}
