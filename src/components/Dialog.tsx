import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function Dialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!; dialog.showModal();
    const cancel = (e: Event) => { e.preventDefault(); close.current(); };
    dialog.addEventListener('cancel', cancel);
    return () => { dialog.removeEventListener('cancel', cancel); dialog.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`dialog ${wide ? 'wide' : ''}`} aria-labelledby="dialog-title" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="dialog-inner"><header className="dialog-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></header>{children}</div>
  </dialog>;
}
