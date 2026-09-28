import { useState } from "react"

// A single card in the bottom "saved meals" tray. New cards animate in
// automatically (see the CSS animation on .saved-tray__card), and this
// component handles animating a card OUT before it's actually removed
// from state — the same pattern used by the modals' handleClose.
function SavedTrayCard({ meal, onRemove }) {
  const [leaving, setLeaving] = useState(false)
  const LEAVE_ANIM_MS = 220

  const handleRemove = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => onRemove(meal.id), LEAVE_ANIM_MS)
  }

  return (
    <div className={`saved-tray__card ${leaving ? "saved-tray__card--leaving" : ""}`}>
      <img src={meal.image} alt={meal.name} className="saved-tray__card-img" />
      <span className="saved-tray__card-name">{meal.name}</span>
      <button className="saved-tray__card-clear" onClick={handleRemove}>✕</button>
    </div>
  )
}

export default SavedTrayCard