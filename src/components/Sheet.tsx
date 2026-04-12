import { useEffect, type ReactNode } from 'react'
import './Sheet.css'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className="sheet-root" role="dialog" aria-modal aria-labelledby="sheet-title">
      <button type="button" className="sheet-backdrop" aria-label="Fechar" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-handle" aria-hidden />
        <div className="sheet-head">
          <h2 id="sheet-title" className="sheet-title">
            {title}
          </h2>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}
