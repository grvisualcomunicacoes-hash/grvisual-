'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({ children, className = 'btn btn-primary', pendingText = 'Salvando…', confirm }: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? <><span className="spinner" /> {pendingText}</> : children}
    </button>
  );
}
