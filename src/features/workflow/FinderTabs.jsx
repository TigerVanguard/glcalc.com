function getNextIndex(currentIndex, key, size) {
  if (key === "ArrowRight") {
    return (currentIndex + 1) % size;
  }

  if (key === "ArrowLeft") {
    return (currentIndex - 1 + size) % size;
  }

  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return size - 1;
  }

  return currentIndex;
}

export default function FinderTabs({ options, activeValue, onChange }) {
  const handleKeyDown = (event, currentIndex) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextIndex = getNextIndex(currentIndex, event.key, options.length);
    const nextOption = options[nextIndex];

    onChange(nextOption.value);
    window.requestAnimationFrame(() => {
      document.getElementById(`finder-tab-${nextOption.value}`)?.focus();
    });
  };

  return (
    <div className="finder-tabs" role="tablist" aria-label="Food finder methods">
      {options.map((option, index) => {
        const isActive = option.value === activeValue;

        return (
          <button
            key={option.value}
            id={`finder-tab-${option.value}`}
            type="button"
            role="tab"
            className={`finder-tab${isActive ? " finder-tab--active" : ""}`}
            aria-selected={isActive ? "true" : "false"}
            aria-controls={`finder-panel-${option.value}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
