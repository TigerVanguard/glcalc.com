export default function ErrorNotice({ title, message, actionLabel, onAction }) {
  return (
    <aside className="notice notice--error" role="alert" aria-live="polite">
      <p className="notice__title">{title}</p>
      <p>{message}</p>
      {onAction ? (
        <button type="button" className="notice__action" onClick={onAction}>
          {actionLabel ?? "Try again"}
        </button>
      ) : null}
    </aside>
  );
}
