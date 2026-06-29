"use client"

interface SaveDrawingModalProps {
  open: boolean
  message: string
}

export function SaveDrawingModal({ open, message }: SaveDrawingModalProps) {
  if (!open) return null

  return (
    <div className="fixed left-1/2 top-6 z-[70] -translate-x-1/2 rounded-full bg-[#25C76F] px-6 py-3 text-sm font-black text-white shadow-xl">
      {message}
    </div>
  )
}
