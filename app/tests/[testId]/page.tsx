import { db } from '@/lib/db'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import TestClient from './TestClient'

export default async function TestPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>
  searchParams: Promise<{ resume?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { testId } = await params
  const { resume } = await searchParams

  const test = await db.test.findUnique({
    where: { id: testId },
    include: {
      passages: {
        orderBy: { order: 'asc' },
        include: { questions: { orderBy: { order: 'asc' } } },
      },
    },
  })
  if (!test) notFound()

  let attempt
  if (resume) {
    attempt = await db.attempt.findFirst({
      where: { id: resume, userId: session.user.id, testId, submittedAt: null },
      include: { answers: true },
    })
  }
  if (!attempt) {
    attempt = await db.attempt.create({
      data: { userId: session.user.id, testId },
      include: { answers: true },
    })
  }

  return <TestClient test={test} attempt={attempt} />
}
