import { useEffect, useRef } from 'react'

export default function Dialog({ id, title, onClose, busy = false, className = '', children }) {
  const dialogRef = useRef(null)
  const titleId = id + '-title'

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className={'modal workflow-dialog ' + className}
      aria-labelledby={titleId}
      onCancel={e => {
        e.preventDefault()
        if (!busy) onClose()
      }}
    >
      <div className="modal-head">
        <h3 id={titleId}>{title}</h3>
        <button type="button" className="modal-close" aria-label="Fechar janela" onClick={onClose} disabled={busy}>×</button>
      </div>
      {children}
    </dialog>
  )
}
