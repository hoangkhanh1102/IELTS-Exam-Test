import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const attemptId = req.nextUrl.searchParams.get('attemptId')
    const passageId = req.nextUrl.searchParams.get('passageId')

    if (!attemptId || !passageId) {
      return NextResponse.json({ error: 'Missing attemptId or passageId' }, { status: 400 })
    }

    const highlights = await db.highlight.findMany({
      where: { attemptId, passageId },
      orderBy: { startIndex: 'asc' },
    })

    return NextResponse.json(highlights)
  } catch (error) {
    console.error('Highlights GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { attemptId, passageId, text, note, color, startIndex, endIndex } = body

  if (!attemptId || !passageId || startIndex === undefined || endIndex === undefined || !text) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const highlight = await db.highlight.create({
    data: { attemptId, passageId, text, note, color, startIndex, endIndex },
  })

  return NextResponse.json(highlight)
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'Missing highlight id' }, { status: 400 })
  }

  await db.highlight.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
