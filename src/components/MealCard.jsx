import { useState } from "react"

function MealCard({ meal, onAdd, onRemove, isSaved }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleSave = (e) => {
    e.stopPropagation() // prevent the click from also toggling the card open/closed
    if (isSaved) {
      onRemove(meal.id) // already saved — clicking again removes it
    } else {
      onAdd(meal)       // not saved — clicking adds it
    }
  }

  return (
    <div
      className={`meal-card ${isOpen ? "meal-card--open" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* Closed state */}
      {!isOpen && (
        <>
          <div className="meal-card__image-wrap">
            <img src={meal.image} alt={meal.name} className="meal-card__image" />
          </div>
          <div className="meal-card__title-bar">
            <span>{meal.name}</span>
          </div>
        </>
      )}

      {/* Open/expanded state */}
      {isOpen && (
        <div className="meal-card__expanded">
          <div className="meal-card__title-bar">
            <span>{meal.name}</span>
            <button
              className="meal-card__add-btn"
              onClick={handleToggleSave}
            >
              {/* Show checkmark if saved, + if not */}
              {isSaved ? "✓" : "+"}
            </button>
          </div>
          <div className="meal-card__body">
            <p><strong>All Ingredients:</strong></p>
            <p>{meal.ingredients.join(", ")}</p>
            <p><strong>Recipe:</strong></p>
            <p>{meal.recipe}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MealCard