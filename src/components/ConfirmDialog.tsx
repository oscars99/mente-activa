import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Large, plain confirmation dialog (the browser's confirm() text is too small for this audience). */
export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel, danger, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="w-[calc(100%-2rem)] max-w-md rounded-3xl border-2 border-borde bg-white p-6 text-tinta backdrop:bg-black/50"
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-3 text-lg">{body}</p>
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          className={danger ? 'btn bg-acento text-white hover:bg-acento/90' : 'btn-primary'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} autoFocus>
          {cancelLabel}
        </button>
      </div>
    </dialog>
  );
}
