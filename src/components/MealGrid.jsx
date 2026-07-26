import { useState, useEffect } from "react"
import MealCard from "./MealCard"
import { supabase } from "../supabaseClient"

function MealGrid({ savedMeals, onAdd, onRemove, refreshTrigger }) {
  const [meals, setMeals] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // refreshTrigger is a number that App.jsx increments whenever a new meal
  // is added. Putting it in the dependency array means this effect re-runs
  // automatically after a meal is saved, keeping the grid up to date.
  useEffect(() => {
    fetchMeals()
  }, [refreshTrigger])

  const fetchMeals = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("meals")
      .select(`
        id, name, category, image, recipe,
        ingredients ( name )
      `)
      .order("name")

    if (error) { console.error(error.message); setLoading(false); return }

    const shaped = data.map((meal) => ({
      ...meal,
      ingredients: meal.ingredients.map((i) => i.name),
    }))

    setMeals(shaped)
    const uniqueCategories = [...new Set(shaped.map((m) => m.category))]
    setCategories(uniqueCategories)
    setLoading(false)
  }

  const filtered = meals.filter((meal) =>
    meal.name.toLowerCase().includes(search.toLowerCase()) ||
    meal.ingredients.some((i) => i.toLowerCase().includes(search.toLowerCase()))
  )

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

      {categories.map((category) => {
        const inCategory = filtered.filter((m) => m.category === category)
        if (inCategory.length === 0) return null
        return (
          <div key={category} className="meal-grid__section">
            <h3 className="meal-grid__category">{category}</h3>
            <div className="meal-grid__row">
              {inCategory.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onAdd={onAdd}
                  onRemove={onRemove}
                  isSaved={savedMeals.some((m) => m.id === meal.id)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MealGrid