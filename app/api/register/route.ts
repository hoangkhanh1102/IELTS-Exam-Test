import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await db.user.create({ data: { name, email, password: hashed } })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (err) {
    console.error('[REGISTER ERROR]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
