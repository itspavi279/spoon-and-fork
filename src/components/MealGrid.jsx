import { useState, useEffect } from "react"
import MealCard from "./MealCard"
import { supabase } from "../supabaseClient"

// Splits a flat array into chunks of a given size
// e.g. chunkArray([1..15], 10) → [[1..10], [11..15]]
function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

function MealGrid({ savedMeals, onAdd, onRemove, refreshTrigger, onEdit, userId }) {
  const [meals, setMeals] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeals()
  }, [refreshTrigger])

  const fetchMeals = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("meals")
      .select(`
        id, name, image, recipe, user_id,
        ingredients ( name )
      `)
      // category is no longer fetched — it doesn't exist anymore
      .order("name")

    if (error) { console.error(error.message); setLoading(false); return }

    const shaped = data.map((meal) => ({
      ...meal,
      ingredients: meal.ingredients.map((i) => i.name),
    }))

    setMeals(shaped)
    setLoading(false)
  }

  // Split search input by comma, trim and lowercase each term
  const searchTerms = search
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length > 0)

  const filtered = meals.filter((meal) => {
    if (searchTerms.length === 0) return true
    return searchTerms.every((term) =>
      meal.name.toLowerCase().includes(term) ||
      meal.ingredients.some((ing) => ing.toLowerCase().includes(term))
    )
  })

  if (loading) return <p style={{ padding: "24px" }}>Loading meals...</p>

  return (
    <div className="meal-grid">
      <div className="meal-grid__toolbar">
        <input
          className="meal-grid__search"
          type="text"
          placeholder="Search meals or ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Split filtered meals into rows of 10 */}
      <div className="meal-grid__rows">
        {chunkArray(filtered, 10).map((chunk, rowIndex) => (
          <div key={rowIndex} className="meal-grid__row">
            {chunk.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onAdd={onAdd}
                onRemove={onRemove}
                isSaved={savedMeals.some((m) => m.id === meal.id)}
                onEdit={onEdit}
                isOwned={meal.user_id === userId}
              />
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ color: "#aaa", fontSize: "14px", paddingLeft: "48px" }}>
            No meals match your search.
          </p>
        )}
      </div>
    </div>
  )
}

export default MealGrid