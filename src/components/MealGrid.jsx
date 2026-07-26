import { useState, useEffect } from "react"
import MealCard from "./MealCard"
import { supabase } from "../supabaseClient"

function MealGrid({ savedMeals, onAdd, onRemove, refreshTrigger }) {
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
        id, name, image, recipe,
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

      {/* All meals in one flat grid — no category grouping */}
      <div className="meal-grid__row">
        {filtered.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onAdd={onAdd}
            onRemove={onRemove}
            isSaved={savedMeals.some((m) => m.id === meal.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p style={{ color: "#aaa", fontSize: "14px" }}>No meals match your search.</p>
        )}
      </div>
    </div>
  )
}

export default MealGrid