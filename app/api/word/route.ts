import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get('w')?.toLowerCase().trim()
  if (!word) return NextResponse.json({ error: 'Missing word' }, { status: 400 })

  // Return cached result if available
  const cached = await db.wordCache.findUnique({ where: { word } })
  if (cached) return NextResponse.json(cached)

  // Fetch English definition from Free Dictionary API
  const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
  if (!dictRes.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const dictData = await dictRes.json()
  const entry = dictData[0]
  const meaning = entry?.meanings?.[0]
  const def = meaning?.definitions?.[0]

  const definition = def?.definition ?? ''
  const example = def?.example ?? null
  const partOfSpeech = meaning?.partOfSpeech ?? null
  const phonetic = entry?.phonetic ?? null

  // Fetch Vietnamese translation
  let translation = word
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (apiKey) {
    const translateRes = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: word, source: 'en', target: 'vi', format: 'text' }),
      }
    )
    if (translateRes.ok) {
      const t = await translateRes.json()
      translation = t?.data?.translations?.[0]?.translatedText ?? word
    }
  }

  const result = await db.wordCache.create({
    data: { word, phonetic, partOfSpeech, definition, example, translation },
  })

  return NextResponse.json(result)
}
