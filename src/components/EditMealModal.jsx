import { useState } from "react"
import { supabase } from "../supabaseClient"

function EditMealModal({ meal, onClose, onMealUpdated, onMealDeleted, userId }) {
  // Pre-populate all fields with the existing meal data
  const [name, setName] = useState(meal.name)
  const [image, setImage] = useState(meal.image || "")
  const [recipe, setRecipe] = useState(meal.recipe || "")
  const [ingredients, setIngredients] = useState(meal.ingredients || [])
  const [ingredientInput, setIngredientInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  // confirmDelete adds a safety step before permanently deleting

  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim().toLowerCase()
    if (!trimmed || ingredients.includes(trimmed)) return
    setIngredients((prev) => [...prev, trimmed])
    setIngredientInput("")
  }

  const handleRemoveIngredient = (name) => {
    setIngredients((prev) => prev.filter((i) => i !== name))
  }

  // ── Save edits ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) { setError("Please enter a meal name."); return }
    if (ingredients.length === 0) { setError("Please add at least one ingredient."); return }

    setLoading(true)
    setError("")

    // Step 1: update the meal row itself
    const { error: mealError } = await supabase
      .from("meals")
      .update({
        name: name.trim(),
        image: image.trim() || null,
        recipe: recipe.trim() || null,
      })
      .eq("id", meal.id)
      .eq("user_id", userId)
      // .eq("user_id"): users can only update their own meals

    if (mealError) { setError(mealError.message); setLoading(false); return }

    // Step 2: replace all ingredients.
    // delete all existing ingredients for this meal and re-insert the updated list
    // handles additions, removals, and edits
    const { error: deleteError } = await supabase
      .from("ingredients")
      .delete()
      .eq("meal_id", meal.id)

    if (deleteError) { setError(deleteError.message); setLoading(false); return }

    const ingredientRows = ingredients.map((ing) => ({
      meal_id: meal.id,
      name: ing,
    }))

    const { error: ingError } = await supabase
      .from("ingredients")
      .insert(ingredientRows)

    if (ingError) { setError(ingError.message); setLoading(false); return }

    // Tell the parent to refresh the meal grid and close the modal
    onMealUpdated()
    onClose()
    setLoading(false)
  }

  // ── Delete meal ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) {
      // First click — ask for confirmation instead of deleting immediately
      setConfirmDelete(true)
      return
    }

    setLoading(true)

    // Deleting the meal automatically deletes its ingredients via
    // the "on delete cascade" we set up in the database schema
    const { error } = await supabase
      .from("meals")
      .delete()
      .eq("id", meal.id)
      .eq("user_id", userId)

    if (error) { setError(error.message); setLoading(false); return }

    onMealDeleted(meal.id)
    onClose()
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Edit meal</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <label className="modal__label">Meal name *</label>
          <input
            className="modal__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="modal__label">Ingredients *</label>
          <div className="modal__ingredient-row">
            <input
              className="modal__input modal__input--flex"
              placeholder="Add an ingredient..."
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddIngredient()}
            />
            <button className="modal__add-ing" onClick={handleAddIngredient}>Add</button>
          </div>

          {ingredients.length > 0 && (
            <div className="modal__tags">
              {ingredients.map((ing) => (
                <span key={ing} className="modal__tag">
                  {ing}
                  <button onClick={() => handleRemoveIngredient(ing)}>✕</button>
                </span>
              ))}
            </div>
          )}

          <label className="modal__label">Image URL (optional)</label>
          <input
            className="modal__input"
            placeholder="https://..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <label className="modal__label">Recipe link or notes (optional)</label>
          <textarea
            className="modal__input modal__textarea"
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
          />

          {error && <p className="modal__error">{error}</p>}
        </div>

        <div className="modal__footer">
          {/* Delete button on the left — turns into a confirmation on first click */}
          <button
            className={`modal__delete ${confirmDelete ? "modal__delete--confirm" : ""}`}
            onClick={handleDelete}
            disabled={loading}
          >
            {confirmDelete ? "Confirm delete?" : "Delete meal"}
          </button>

          <div className="modal__footer-right">
            <button className="modal__cancel" onClick={onClose}>Cancel</button>
            <button className="modal__save" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save meal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditMealModal