import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

// POST /api/attempts — start a new attempt
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { testId } = await req.json()
  const attempt = await db.attempt.create({
    data: { userId: session.user.id, testId },
  })
  return NextResponse.json(attempt, { status: 201 })
}
