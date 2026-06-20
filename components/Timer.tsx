'use client'

import { useEffect, useState } from 'react'

interface Props {
  limitMinutes: number
  onExpire: () => void
}

export default function Timer({ limitMinutes, onExpire }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(limitMinutes * 60)

  useEffect(() => {
    if (secondsLeft <= 0) { onExpire(); return }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft, onExpire])

  const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
  const s = (secondsLeft % 60).toString().padStart(2, '0')
  const urgent = secondsLeft < 300

  return (
    <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${urgent ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-700 bg-gray-100'}`}>
      {m}:{s}
    </span>
  )
}
