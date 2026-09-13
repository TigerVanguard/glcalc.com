export default function SelectedFoodSummary({ selectedFood, onClear }) {
  if (!selectedFood?.food) {
    return null;
  }

  return (
    <section
      className="panel selected-food-summary"
      aria-label="Selected food summary"
    >
      <div className="selected-food-summary__body">
        <p className="eyebrow">Current selection</p>
        <h2>{selectedFood.food.title}</h2>
        <p className="muted">
          Source: <strong>{selectedFood.sourceLabel}</strong>
        </p>
      </div>

      <button
        type="button"
        className="secondary-button selected-food-summary__action"
        onClick={onClear}
      >
        Clear selected food
      </button>
    </section>
  );
}
