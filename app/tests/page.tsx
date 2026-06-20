import { db } from '@/lib/db'
import { auth } from '@/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TestsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [tests, recentAttempts] = await Promise.all([
    db.test.findMany({
      include: { _count: { select: { passages: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.attempt.findMany({
      where: { userId: session.user.id },
      include: { test: true, answers: true },
      orderBy: { startedAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-sm">IELTS Reading</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:block">{session.user.name ?? session.user.email}</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-slate-500 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Đăng xuất
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {recentAttempts.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">Hoạt động gần đây</h2>
            <div className="space-y-2">
              {recentAttempts.map((attempt) => {
                const total = attempt.answers.length
                const correct = attempt.answers.filter((a) => a.isCorrect).length
                const done = !!attempt.submittedAt
                return (
                  <div key={attempt.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${done ? 'bg-green-500' : 'bg-amber-400'}`} />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{attempt.test.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(attempt.startedAt).toLocaleDateString('vi-VN')}
                          {done ? ` · ${correct}/${total} câu đúng` : ' · Chưa hoàn thành'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={done ? `/tests/${attempt.testId}/results/${attempt.id}` : `/tests/${attempt.testId}?resume=${attempt.id}`}
                      className="text-sm text-blue-600 font-medium hover:underline shrink-0"
                    >
                      {done ? 'Xem kết quả' : 'Tiếp tục'}
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-base font-semibold text-slate-900 mb-3">Bài thi có sẵn</h2>
          {tests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              Chưa có bài thi nào.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {tests.map((test) => (
                <div key={test.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug pr-2">{test.title}</h3>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${test.type === 'FULL' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {test.type === 'FULL' ? 'Full test' : 'Mini'}
                    </span>
                  </div>
                  {test.description && (
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{test.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{test._count.passages} passages</span>
                      <span>·</span>
                      <span>{test.timeLimit} phút</span>
                    </div>
                    <Link
                      href={`/tests/${test.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                    >
                      Bắt đầu
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
