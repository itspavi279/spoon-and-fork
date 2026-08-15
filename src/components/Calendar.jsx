import { useState } from "react"
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import CalendarDay from "./CalendarDay"

// Draggable Meal Card
function DraggableMealCard({ meal }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: meal.id.toString(),
        data: { meal },
    })

    const style = {
        // converts the drag offset into a CSS transform
        //card will visually follow cursor as it's dragged
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        // while dragging, reduce opacity to show card is in motion
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 999 : "auto",
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="draggable-card"
            >
                <img src={meal.image} alt={meal.name} className="draggable-card__img"/>
                <span className="draggable-card__name">{meal.name}</span>
        </div>
    )
}

// ─── Helper: Get array of date strings for a week ──────────────
function getWeekDates(startDate, numDays) {
  const dates = []
  for (let i = 0; i < numDays; i++) {
    // Create a brand new Date from the startDate timestamp each time
    // This is critical — reusing one Date object and mutating it was the bug
    const d = new Date(startDate.getTime())
    d.setDate(d.getDate() + i)
    // Build the date string manually to avoid timezone issues
    // toISOString() converts to UTC which can shift the date by a day
    // depending on the user's timezone — this avoids that entirely
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    dates.push(`${year}-${month}-${day}`)
  }
  return dates
}

// ─── Helper: get the most recent Monday ──────────────────────────────────────
function getMostRecentMonday() {
  const today = new Date()
  const day = today.getDay() // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const diff = day === 0 ? 6 : day - 1
  // Return a new Date set to midnight — don't mutate "today" directly
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - diff)
}

// Calendar - Main Component

function Calendar({ savedMeals, calendarMeals, onDropMeal, onClearDay, onClearAll }) {
    //startDate = first day shown in calendar
    const [startDate, setStartDate ] = useState(getMostRecentMonday())
    //numDays = user can choose between displaying 3, 5, or 7 days
    const [numDays, setNumDays] = useState(7)

    //array of date strings currently visible in calendar
    const visibleDates = getWeekDates(startDate, numDays)

    //Navigation - move calendar forwards/backwards by numDays at a time
   const goForward = () => {
  // Create a new Date from the current startDate's timestamp
  // Never mutate state directly — always create a new object
  const next = new Date(startDate.getTime())
  next.setDate(next.getDate() + numDays)
  setStartDate(next)
}

const goBack = () => {
  const prev = new Date(startDate.getTime())
  prev.setDate(prev.getDate() - numDays)
  setStartDate(prev)
}

    // Drag and drop - user drops a draggable card onto a droppable day slot
    // active is the dragged item, over is the day it was dropped on

const handleDragEnd = (event) => {
  const { active, over } = event
  if (!over) return
  const meal = active.data.current.meal
  const date = over.id
  onDropMeal(date, meal)
}

  // Sensors - PointerSensor works for both mouse and touch (mobile)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  return (
    // DndContext is the wrapper that makes drag-and-drop work for everything inside it.
    // onDragEnd fires whenever a drag operation completes (drop or cancel).
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="calendar-view">

        {/* ── Left panel: the calendar grid ── */}
        <div className="calendar-panel">
          <div className="calendar-panel__header">
            <h2 className="calendar-panel__title">My Calendar</h2>

            {/* Day count toggle — lets the user switch between 3, 5, or 7 day views */}
            <div className="calendar-panel__toggles">
              {[3, 5, 7].map((n) => (
                <button
                  key={n}
                  className={`toggle-btn ${numDays === n ? "toggle-btn--active" : ""}`}
                  onClick={() => setNumDays(n)}
                >
                  {n}d
                </button>
              ))}
            </div>

            {/* Clear all button */}
            <button className="calendar-panel__clear" onClick={onClearAll}>
              🗑
            </button>
          </div>

          {/* Week navigation */}
          <div className="calendar-panel__nav">
            <button className="nav-btn" onClick={goBack}>← Back</button>
            <button className="nav-btn" onClick={goForward}>Forward →</button>
          </div>

          {/* The day columns */}
          <div className="calendar-grid" style={{ gridTemplateColumns: `repeat(${numDays}, 1fr)` }}>
            {/* gridTemplateColumns is set dynamically so the grid always fills
                the space evenly regardless of whether we're showing 3, 5, or 7 days */}
            {visibleDates.map((date) => (
              <CalendarDay
                key={date}
                date={date}
                meals={calendarMeals[date] || []}
                // Pass the meal for this date (or null if none assigned yet)
                onClear={onClearDay}
              />
            ))}
          </div>
        </div>

        {/* ── Right panel: saved meals to drag from ── */}
        <div className="browse-panel">
          <h3 className="browse-panel__title">Saved Meals</h3>
          <p className="browse-panel__hint">Drag a meal onto a day in the calendar</p>

          {savedMeals.length === 0 ? (
            <p className="browse-panel__empty">
              No saved meals yet — go to Browse and hit + on a meal.
            </p>
          ) : (
            <div className="browse-panel__cards">
              {savedMeals.map((meal) => (
                // Each saved meal gets wrapped in DraggableMealCard
                // so it can be picked up and dragged to the calendar
                <DraggableMealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </div>

      </div>
    </DndContext>
  )
}

export default Calendar

