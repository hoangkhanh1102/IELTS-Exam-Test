import { db } from '@/lib/db'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

function toBand(correct: number): number {
  if (correct >= 39) return 9.0
  if (correct >= 37) return 8.5
  if (correct >= 35) return 8.0
  if (correct >= 33) return 7.5
  if (correct >= 30) return 7.0
  if (correct >= 27) return 6.5
  if (correct >= 23) return 6.0
  if (correct >= 19) return 5.5
  if (correct >= 15) return 5.0
  if (correct >= 13) return 4.5
  if (correct >= 10) return 4.0
  return 3.5
}

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  TRUE_FALSE_NOT_GIVEN: 'True/False/Not Given',
  YES_NO_NOT_GIVEN: 'Yes/No/Not Given',
  MATCHING_HEADINGS: 'Matching Headings',
  MATCHING_INFORMATION: 'Matching Information',
  MATCHING_FEATURES: 'Matching Features',
  FILL_IN_THE_BLANK: 'Fill in the Blank',
  SUMMARY_COMPLETION: 'Summary Completion',
  SHORT_ANSWER: 'Short Answer',
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ testId: string; attemptId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { testId, attemptId } = await params

  const attempt = await db.attempt.findFirst({
    where: { id: attemptId, userId: session.user.id, testId },
    include: {
      answers: { include: { question: { include: { passage: true } } } },
      test: { include: { passages: { include: { questions: true } } } },
    },
  })
  if (!attempt || !attempt.submittedAt) notFound()

  const allQuestions = attempt.test.passages.flatMap((p) => p.questions)
  const totalQ = allQuestions.length
  const correctCount = attempt.answers.filter((a) => a.isCorrect).length
  const band = toBand(correctCount)

  const byType: Record<string, { total: number; correct: number }> = {}
  attempt.answers.forEach((a) => {
    const type = a.question.type
    if (!byType[type]) byType[type] = { total: 0, correct: 0 }
    byType[type].total++
    if (a.isCorrect) byType[type].correct++
  })

  const byPassage: Record<string, { title: string; total: number; correct: number }> = {}
  attempt.answers.forEach((a) => {
    const pid = a.question.passageId
    if (!byPassage[pid]) byPassage[pid] = { title: a.question.passage.title, total: 0, correct: 0 }
    byPassage[pid].total++
    if (a.isCorrect) byPassage[pid].correct++
  })

  const bandColor = band >= 7 ? 'text-emerald-600' : band >= 5.5 ? 'text-blue-600' : 'text-amber-600'
  const bandBg = band >= 7 ? 'bg-emerald-50 border-emerald-200' : band >= 5.5 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/tests" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Về trang chủ
          </Link>
          <span className="font-semibold text-slate-800 text-sm">{attempt.test.title}</span>
          <span />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Score card */}
        <div className={`rounded-2xl border p-6 text-center ${bandBg}`}>
          <p className="text-sm text-slate-500 mb-1">Band score ước tính</p>
          <div className={`text-7xl font-black mb-2 ${bandColor}`}>{band.toFixed(1)}</div>
          <div className="flex justify-center gap-8 mt-4">
            {[
              { label: 'Đúng', value: correctCount, color: 'text-emerald-600' },
              { label: 'Sai', value: totalQ - correctCount, color: 'text-red-500' },
              { label: 'Bỏ trống', value: totalQ - attempt.answers.length, color: 'text-slate-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* By passage */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm">Kết quả theo passage</h2>
          <div className="space-y-4">
            {Object.values(byPassage).map((p) => {
              const pct = Math.round((p.correct / p.total) * 100)
              const barColor = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
              return (
                <div key={p.title}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-700 font-medium">{p.title}</span>
                    <span className="text-slate-500 font-semibold">{p.correct}/{p.total}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* By question type */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm">Kết quả theo dạng câu hỏi</h2>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100)
              const barColor = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-40 shrink-0">{TYPE_LABELS[type] ?? type}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-10 text-right">{stat.correct}/{stat.total}</span>
                </div>
              )
            })}
          </div>
          {Object.entries(byType).some(([, s]) => s.correct / s.total < 0.5) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
              <strong>Gợi ý:</strong> Luyện thêm{' '}
              {Object.entries(byType)
                .filter(([, s]) => s.correct / s.total < 0.5)
                .map(([t]) => TYPE_LABELS[t] ?? t)
                .join(', ')}.
            </div>
          )}
        </div>

        {/* Answer review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm">Chi tiết từng câu</h2>
          <div className="space-y-2">
            {attempt.test.passages.flatMap((p) =>
              p.questions.map((q) => {
                const ans = attempt.answers.find((a) => a.questionId === q.id)
                const correct = ans?.isCorrect
                const studentAns = ans?.studentAnswer
                return (
                  <div
                    key={q.id}
                    className={`flex gap-3 p-3 rounded-xl text-sm ${
                      correct === true ? 'bg-emerald-50' : correct === false ? 'bg-red-50' : 'bg-slate-50'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white ${
                        correct === true ? 'bg-emerald-500' : correct === false ? 'bg-red-400' : 'bg-slate-300'
                      }`}
                    >
                      {q.order}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-xs leading-relaxed mb-1">{q.prompt}</p>
                      <p className="text-xs">
                        <span className="text-slate-400">Bạn trả lời: </span>
                        <span className={`font-semibold ${correct ? 'text-emerald-700' : 'text-red-600'}`}>
                          {studentAns ?? '(bỏ trống)'}
                        </span>
                        {!correct && (
                          <span className="ml-2 text-slate-400">
                            → <span className="font-semibold text-emerald-700">{q.correctAnswer}</span>
                          </span>
                        )}
                      </p>
                      {q.explanation && (
                        <p className="text-xs text-slate-400 mt-1 italic">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="text-center pb-4">
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
          >
            Luyện tiếp
          </Link>
        </div>
      </main>
    </div>
  )
}
