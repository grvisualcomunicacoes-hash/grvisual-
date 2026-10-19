export function Notices({ notices, title = 'Antes de enviar' }: { notices: string[]; title?: string }) {
  if (!notices.length) return null;
  return (
    <div className="notice" role="note">
      <strong>{title}</strong>
      <ul>
        {notices.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
