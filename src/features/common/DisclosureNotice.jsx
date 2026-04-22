export default function DisclosureNotice() {
  return (
    <aside className="notice" aria-label="Disclosure">
      <p className="notice__title">About this estimate</p>
      <p>
        Glycemic load is a practical estimate, not a lab measurement. The
        numbers here come from published GI data and a serving-size
        conversion, so treat them as guidance rather than medical advice.
      </p>
    </aside>
  );
}
