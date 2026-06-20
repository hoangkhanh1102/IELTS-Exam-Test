import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

// PATCH /api/attempts/[id] — auto-save answer or submit
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Submit attempt
  if (body.action === 'submit') {
    const attempt = await db.attempt.update({
      where: { id },
      data: { submittedAt: new Date() },
      include: {
        answers: { include: { question: true } },
        test: { include: { passages: { include: { questions: true } } } },
      },
    })

    // Mark isCorrect for each answer
    await Promise.all(
      attempt.answers.map((a) =>
        db.answer.update({
          where: { id: a.id },
          data: { isCorrect: a.studentAnswer === a.question.correctAnswer },
        })
      )
    )

    return NextResponse.json({ ok: true })
  }

  // Auto-save a single answer
  const { questionId, studentAnswer, flagged, timeSpentSeconds } = body
  await db.answer.upsert({
    where: { attemptId_questionId: { attemptId: id, questionId } },
    create: { attemptId: id, questionId, studentAnswer, flagged, timeSpentSeconds },
    update: { studentAnswer, flagged, timeSpentSeconds, savedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
