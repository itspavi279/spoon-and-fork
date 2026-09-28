import { useState } from "react"

function MealCard({ meal, onAdd, onRemove, isSaved, onEdit, isOwned }) {
  const [isOpen, setIsOpen] = useState(false)
  // isOwned is true when the logged-in user created this meal —
  // only owned meals show the edit button

  // Both faces stay mounted at all times now (instead of being
  // conditionally rendered) so CSS can crossfade + resize between
  // them instead of hard-swapping the DOM.

  return (
    <div
      className={`meal-card ${isOpen ? "meal-card--open" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* Closed face */}
      <div className="meal-card__face meal-card__face--closed">
        <div className="meal-card__image-wrap">
          <img src={meal.image} alt={meal.name} className="meal-card__image" />
        </div>
        <div className="meal-card__title-bar">
          <span>{meal.name}</span>
        </div>
      </div>

      {/* Expanded face */}
      <div className="meal-card__face meal-card__face--expanded">
        <div className="meal-card__title-bar">
          <span>{meal.name}</span>
          <div className="meal-card__actions">
            {/* Only show edit button if this user owns the meal */}
            {isOwned && (
              <button
                className="meal-card__edit-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(meal)
                }}
                title="Edit meal"
              >
                ✎
              </button>
            )}
            <button
              className="meal-card__add-btn"
              onClick={(e) => {
                e.stopPropagation()
                isSaved ? onRemove(meal.id) : onAdd(meal)
              }}
            >
              {isSaved ? "✓" : "+"}
            </button>
          </div>
        </div>
        <div className="meal-card__body">
          <p><strong>All Ingredients:</strong></p>
          <p>{meal.ingredients.join(", ")}</p>
          <p><strong>Recipe:</strong></p>
          <p>{meal.recipe}</p>
        </div>
      </div>
    </div>
  )
}

export default MealCard