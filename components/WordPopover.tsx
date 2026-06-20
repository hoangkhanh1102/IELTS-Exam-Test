'use client'

import { useEffect, useRef, useState } from 'react'

interface WordData {
  word: string
  phonetic?: string
  partOfSpeech?: string
  definition: string
  example?: string
  translation: string
}

interface Props {
  word: string
  x: number
  y: number
  onClose: () => void
}

export default function WordPopover({ word, x, y, onClose }: Props) {
  const [data, setData] = useState<WordData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setData(null)
    fetch(`/api/word?w=${encodeURIComponent(word)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [word])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  // Clamp to viewport
  const style: React.CSSProperties = {
    position: 'absolute',
    top: y,
    left: Math.min(x, window.innerWidth - 280),
    zIndex: 9999,
  }

  return (
    <div ref={ref} style={style} className="w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-blue-700 text-base">{word}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>

      {loading && <p className="text-gray-400 text-xs animate-pulse">Đang tải...</p>}
      {error && <p className="text-red-400 text-xs">Không tìm thấy từ này.</p>}

      {data && !loading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {data.phonetic && <span className="text-gray-400 text-xs">{data.phonetic}</span>}
            {data.partOfSpeech && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{data.partOfSpeech}</span>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Nghĩa (EN)</p>
            <p className="text-gray-800 text-xs leading-relaxed">{data.definition}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Tiếng Việt</p>
            <p className="text-green-700 font-medium text-sm">{data.translation}</p>
          </div>
          {data.example && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Ví dụ</p>
              <p className="text-gray-500 text-xs italic">{data.example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
