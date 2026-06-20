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
  onHighlight?: (color: string, note: string) => void
}

export default function WordPopover({ word, x, y, onClose, onHighlight }: Props) {
  const [data, setData] = useState<WordData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  const [note, setNote] = useState('')
  const [color, setColor] = useState('yellow')
  const [tab, setTab] = useState<'translate'|'note'>('translate')

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
    left: Math.min(x, window.innerWidth - 300),
    zIndex: 9999,
  }

  const colors = [
    { id: 'yellow', hex: '#fef08a' },
    { id: 'green', hex: '#bbf7d0' },
    { id: 'pink', hex: '#fbcfe8' },
    { id: 'blue', hex: '#bfdbfe' },
  ]

  return (
    <div ref={ref} style={style} className="w-72 bg-white rounded-xl shadow-2xl border border-slate-200 text-sm overflow-hidden flex flex-col">
      <div className="flex bg-slate-50 border-b border-slate-100 p-1">
        <button onClick={() => setTab('translate')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${tab === 'translate' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>Dịch</button>
        <button onClick={() => setTab('note')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${tab === 'note' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:bg-slate-100'}`}>Ghi chú</button>
        <button onClick={onClose} className="px-2 text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
      </div>

      <div className="p-4 max-h-80 overflow-y-auto">
        <span className="font-bold text-slate-800 text-base block mb-3">{word}</span>

        {tab === 'translate' && (
          <>
            {loading && <p className="text-slate-400 text-xs animate-pulse">Đang tải...</p>}
            {error && <p className="text-red-400 text-xs">Không tìm thấy từ này.</p>}

            {data && !loading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {data.phonetic && <span className="text-slate-500 text-xs font-mono">{data.phonetic}</span>}
                  {data.partOfSpeech && <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{data.partOfSpeech}</span>}
                </div>
                {data.definition && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Nghĩa (EN)</p>
                    <p className="text-slate-700 text-xs leading-relaxed">{data.definition}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Tiếng Việt</p>
                  <p className="text-emerald-700 font-semibold text-sm">{data.translation}</p>
                </div>
                {data.example && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Ví dụ</p>
                    <p className="text-slate-500 text-xs italic border-l-2 border-slate-200 pl-2">{data.example}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'note' && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Màu đánh dấu</p>
              <div className="flex gap-2">
                {colors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c.id ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Ghi chú của bạn</p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Nhập ghi chú..."
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-20"
              />
            </div>
            <button
              onClick={() => {
                if (onHighlight) onHighlight(color, note);
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 rounded-lg transition"
            >
              Lưu đánh dấu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
