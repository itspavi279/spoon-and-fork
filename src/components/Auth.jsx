import { useState } from "react"
import { supabase } from "../supabaseClient"

function Auth() {
  // mode toggles between "login" and "signup" views
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  // message shows feedback to the user — errors or success notices

  const handleSubmit = async () => {
    setLoading(true)
    setMessage("")

    if (mode === "signup") {
      // signUp creates a new account in Supabase Auth.
      // Supabase hashes the password — you never see or store it.
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage("Account created! Check your email to confirm, then log in.")
      }
    } else {
      // signInWithPassword checks credentials against Supabase Auth.
      // On success, Supabase sets a secure session cookie automatically.
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      // On success, App.jsx detects the session change and hides this screen
    }

    setLoading(false)
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__logo">Spoon & Fork</h1>
        <p className="auth__subtitle">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>

        <input
          className="auth__input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth__input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && <p className="auth__message">{message}</p>}

        <button
          className="auth__btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "..." : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <p className="auth__toggle">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            className="auth__toggle-btn"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage("") }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth