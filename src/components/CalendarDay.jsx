import { useDroppable } from "@dnd-kit/core"

function CalendarDay({ date, meals, onClear }) {
  const { isOver, setNodeRef } = useDroppable({ id: date })

  const dateObj = new Date(date + "T12:00:00")
  const dayName = dateObj.toLocaleDateString("en-GB", { weekday: "short" })
  const dayNum = dateObj.getDate()

  // How many more meals this slot can accept before it's full
  const slotsRemaining = 3 - meals.length

  return (
    <div
      ref={setNodeRef}
      className={`calendar-day ${isOver && slotsRemaining > 0 ? "calendar-day--over" : ""}`}
      // Only highlight the drop zone if there's still room — if it's full,
      // we don't highlight it so the user gets visual feedback that it's capped
    >
      <div className="calendar-day__header">
        <span className="calendar-day__name">{dayName}</span>
        <span className="calendar-day__num">{dayNum}</span>
      </div>

      <div className="calendar-day__slot">
        {/* Render each meal stacked vertically */}
        {meals.map((meal, index) => (
          <div key={`${meal.id}-${index}`} className="calendar-day__meal">
            <img src={meal.image} alt={meal.name} className="calendar-day__meal-img" />
            <span className="calendar-day__meal-name">{meal.name}</span>
            {/* Pass both the date AND the index so we know exactly
                which of the 3 stacked meals to remove */}
            <button
              className="calendar-day__clear"
              onClick={() => onClear(date, index)}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Show empty placeholder slots for remaining capacity */}
        {Array.from({ length: slotsRemaining }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day__empty">
            Drop a meal here
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarDay