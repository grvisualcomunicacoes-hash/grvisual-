export function Flash({ ok, erro }: { ok?: string; erro?: string }) {
  if (!ok && !erro) return null;
  return (
    <div className={`alert ${erro ? 'alert-error' : 'alert-success'}`} role={erro ? 'alert' : 'status'} style={{ marginBottom: 16 }}>
      {erro || ok}
    </div>
  );
}
