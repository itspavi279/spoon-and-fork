import { useState } from "react"
import { supabase } from "../supabaseClient"

function AddMealModal({ onClose, onMealAdded, userId }) {
  const [name, setName] = useState("")
  const [image, setImage] = useState("https://img.magnific.com/free-photo/delicious-vibrant-vegetarian-buddha-bowl_23-2152003893.jpg?semt=ais_test_b&w=740&q=80")
  const [recipe, setRecipe] = useState("")
  const [ingredientInput, setIngredientInput] = useState("")
  // ingredientInput is the text field — user types one ingredient at a time
  const [ingredients, setIngredients] = useState([""])
  // ingredients is the growing list of added ingredients shown as tags
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim().toLowerCase()
    if (!trimmed || ingredients.includes(trimmed)) return
    // Prevent empty or duplicate ingredients
    setIngredients((prev) => [...prev, trimmed])
    setIngredientInput("")
  }

  const handleRemoveIngredient = (name) => {
    setIngredients((prev) => prev.filter((i) => i !== name))
  }

  const handleSave = async () => {
    if (!name.trim()) { setError("Please enter a meal name."); return }
    if (ingredients.length === 0) { setError("Please add at least one ingredient."); return }

    setLoading(true)
    setError("")

    // Step 1: insert the meal row.
    // We attach the current user's ID so RLS allows the insert
    // and so the meal is owned by this user.
    const { data: mealData, error: mealError } = await supabase
      .from("meals")
      .insert({
        name: name.trim(),
        image: image.trim() || null,
        recipe: recipe.trim() || null,
        user_id: userId,
      })
      .select()
      .single()

    if (mealError) { setError(mealError.message); setLoading(false); return }

    // Step 2: insert all ingredients, each referencing the new meal's id.
    // We insert them all at once as an array — one database call is faster
    // and safer than looping with individual inserts.
    const ingredientRows = ingredients.map((ing) => ({
      meal_id: mealData.id,
      name: ing,
    }))

    const { error: ingError } = await supabase
      .from("ingredients")
      .insert(ingredientRows)

    if (ingError) { setError(ingError.message); setLoading(false); return }

    // Step 3: tell the parent the new meal exists so it can refresh the grid
    onMealAdded()
    onClose()
    setLoading(false)
  }

  return (
    // Clicking the backdrop (the darkened area behind the modal) closes it
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* stopPropagation prevents clicks inside the modal from
            bubbling up to the backdrop and closing it accidentally */}
        <div className="modal__header">
          <h2 className="modal__title">Add a new meal</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <label className="modal__label">Meal name *</label>
          <input
            className="modal__input"
            placeholder="e.g. Tomato Soup"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <label className="modal__label">Ingredients *</label>
          <div className="modal__ingredient-row">
            <input
              className="modal__input modal__input--flex"
              placeholder="e.g. garlic"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddIngredient()}
              // Pressing Enter adds the ingredient without needing to click the button
            />
            <button className="modal__add-ing" onClick={handleAddIngredient}>Add</button>
          </div>

          {/* Show added ingredients as removable tags */}
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
            placeholder="Link to recipe or any notes..."
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
          />

          {error && <p className="modal__error">{error}</p>}
        </div>

        <div className="modal__footer">
          <button className="modal__cancel" onClick={onClose}>Cancel</button>
          <button className="modal__save" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save meal"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddMealModal