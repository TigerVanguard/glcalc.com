import React from "react";

// Shared controlled numeric input (Spec §5A.1-3, ticket 07; reused by tickets
// 08/09/10). Deliberately type="text" + inputMode="decimal": type="number"
// lets browsers silently swallow invalid keystrokes, while the spec wants
// invalid input to surface a page-level ErrorNotice instead. The parent owns
// parsing/validation (src/lib/display.js parsePositiveNumber); `invalid` here
// only styles the field and sets aria-invalid.
export default function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  suffix,
  invalid = false,
  describedBy,
}) {
  return (
    <div className="field number-field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="number-field__control">
        <input
          id={id}
          className={`search-input number-field__input${
            invalid ? " number-field__input--invalid" : ""
          }`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck="false"
          value={value}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? <span className="number-field__suffix">{suffix}</span> : null}
      </div>
    </div>
  );
}
