// open preview by typing npm run dev into terminal
// update in terminal: git add . / git commit -m / git push

import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import MealGrid from "./components/MealGrid"
import Calendar from "./components/Calendar"
import Auth from "./components/Auth"
import AddMealModal from "./components/AddMealModal"
import { supabase } from "./supabaseClient"
import "./index.css"

function App() {
  const [session, setSession] = useState(null)
  // session holds the logged-in user's auth data.
  // null means no one is logged in — show the Auth screen.

  const [activePage, setActivePage] = useState("browse")
  const [savedMeals, setSavedMeals] = useState([])
  const [calendarMeals, setCalendarMeals] = useState({})
  const [showAddMeal, setShowAddMeal] = useState(false)
  // showAddMeal controls whether the AddMealModal is visible

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  // refreshTrigger is incremented after a new meal is added,
  // which tells MealGrid to re-fetch from the database

  // ── Auth ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // getSession checks if a session already exists (e.g. user returns
    // to the tab after previously logging in — the cookie is still valid)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // onAuthStateChange listens for login and logout events in real time.
    // When the user logs in, session becomes the new session object.
    // When they log out, session becomes null and the Auth screen shows.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          // User just logged in — load their data
          fetchSavedMeals(session.user.id)
          fetchCalendarEntries(session.user.id)
        } else {
          // User just logged out — clear all local state
          setSavedMeals([])
          setCalendarMeals({})
        }
      }
    )

    // Unsubscribe when the component unmounts to avoid memory leaks
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // onAuthStateChange above handles clearing state after this
  }

  // ── Saved meals ─────────────────────────────────────────────────────────────

  const fetchSavedMeals = async (userId) => {
    const { data, error } = await supabase
      .from("saved_meals")
      .select(`
        id, meal_id,
        meals ( id, name, category, image, recipe, ingredients ( name ) )
      `)
      .eq("user_id", userId)
    // .eq filters rows — only fetch this user's saved meals

    if (error) { console.error(error.message); return }

    const shaped = data.map((row) => ({
      savedRowId: row.id,
      ...row.meals,
      ingredients: row.meals.ingredients.map((i) => i.name),
    }))

    setSavedMeals(shaped)
  }

  const handleAdd = async (meal) => {
    if (!session) return
    if (savedMeals.some((m) => m.id === meal.id)) return

    const { data, error } = await supabase
      .from("saved_meals")
      .insert({ meal_id: meal.id, user_id: session.user.id })
      .select()
      .single()

    if (error) { console.error(error.message); return }

    setSavedMeals((prev) => [...prev, { ...meal, savedRowId: data.id }])
  }

  const handleRemove = async (mealId) => {
    const entry = savedMeals.find((m) => m.id === mealId)
    if (!entry) return

    const { error } = await supabase
      .from("saved_meals")
      .delete()
      .eq("id", entry.savedRowId)

    if (error) { console.error(error.message); return }

    setSavedMeals((prev) => prev.filter((m) => m.id !== mealId))
  }

  // ── Calendar ─────────────────────────────────────────────────────────────────

  const fetchCalendarEntries = async (userId) => {
    const { data, error } = await supabase
      .from("calendar_entries")
      .select(`
        id, date, slot_index,
        meals ( id, name, category, image, recipe, ingredients ( name ) )
      `)
      .eq("user_id", userId)
      .order("slot_index")

    if (error) { console.error(error.message); return }

    const rebuilt = {}
    data.forEach((row) => {
      if (!rebuilt[row.date]) rebuilt[row.date] = []
      rebuilt[row.date][row.slot_index] = {
        ...row.meals,
        ingredients: row.meals.ingredients.map((i) => i.name),
        calendarRowId: row.id,
      }
    })

    Object.keys(rebuilt).forEach((date) => {
      rebuilt[date] = rebuilt[date].filter(Boolean)
    })

    setCalendarMeals(rebuilt)
  }

  const handleDropMeal = async (date, meal) => {
    if (!session) return
    const existing = calendarMeals[date] || []
    if (existing.length >= 3) return

    const { data, error } = await supabase
      .from("calendar_entries")
      .insert({
        meal_id: meal.id,
        date,
        slot_index: existing.length,
        user_id: session.user.id,
      })
      .select()
      .single()

    if (error) { console.error(error.message); return }

    setCalendarMeals((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), { ...meal, calendarRowId: data.id }],
    }))
  }

  const handleClearDay = async (date, index) => {
    const entry = (calendarMeals[date] || [])[index]
    if (!entry) return

    const { error } = await supabase
      .from("calendar_entries")
      .delete()
      .eq("id", entry.calendarRowId)

    if (error) { console.error(error.message); return }

    setCalendarMeals((prev) => {
      const updated = [...(prev[date] || [])]
      updated.splice(index, 1)
      return { ...prev, [date]: updated }
    })
  }

  const handleClearAll = async () => {
    if (!session) return

    const { error } = await supabase
      .from("calendar_entries")
      .delete()
      .eq("user_id", session.user.id)

    if (error) { console.error(error.message); return }

    setCalendarMeals({})
  }

  // ── If no session, show the login/signup screen ───────────────────────────
  if (!session) return <Auth />

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onAddMealClick={() => setShowAddMeal(true)}
        onLogout={handleLogout}
        userEmail={session.user.email}
      />

      {/* Add meal modal — shown on top of everything when bowl icon is clicked */}
      {showAddMeal && (
        <AddMealModal
          onClose={() => setShowAddMeal(false)}
          userId={session.user.id}
          onMealAdded={() => setRefreshTrigger((n) => n + 1)}
          // Incrementing refreshTrigger tells MealGrid to re-fetch
        />
      )}

      {activePage === "browse" && (
        <main className="app__main">
          <MealGrid
            savedMeals={savedMeals}
            onAdd={handleAdd}
            onRemove={handleRemove}
            refreshTrigger={refreshTrigger}
          />

          {savedMeals.length > 0 && (
            <div className="saved-tray">
              <button
                className="saved-tray__label"
                onClick={() => setActivePage("calendar")}
              >
                Saved →
              </button>
              <div className="saved-tray__row">
                {savedMeals.map((meal) => (
                  <div key={meal.id} className="saved-tray__card">
                    <img src={meal.image} alt={meal.name} className="saved-tray__card-img" />
                    <span className="saved-tray__card-name">{meal.name}</span>
                    <button
                      className="saved-tray__card-clear"
                      onClick={() => handleRemove(meal.id)}
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {activePage === "calendar" && (
        <main className="app__main app__main--calendar">
          <Calendar
            savedMeals={savedMeals}
            calendarMeals={calendarMeals}
            onDropMeal={handleDropMeal}
            onClearDay={handleClearDay}
            onClearAll={handleClearAll}
          />
        </main>
      )}
    </div>
  )
}

export default App