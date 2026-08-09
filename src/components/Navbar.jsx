function Navbar({ activePage, setActivePage, onAddMealClick, onLogout, userEmail }) {
  const pageToggleIcon = activePage === "browse" ? "🗓" : "🔍"
  const pageToggleTitle = activePage === "browse" ? "Go to Calendar" : "Browse Meals"

  const handlePageToggle = () => {
    setActivePage(activePage === "browse" ? "calendar" : "browse")
  }

  return (
    <nav className="navbar">
      <div className="navbar__logo">Spoon & Fork</div>
      {}

      <div className="navbar__icons">
        {/* Page toggle — switches between browse and calendar */}
        <button
          className="navbar__icon-btn"
          onClick={handlePageToggle}
          title={pageToggleTitle}
        >
          {pageToggleIcon}
        </button>

        {/* Bowl icon — opens the add meal modal */}
        <button
          className="navbar__icon-btn"
          onClick={onAddMealClick}
          title="Add a Meal"
        >
          🍲
        </button>

         {/* Email display */}
          <span className="navbar__email">{userEmail}</span>

        {/* Logout — icon only, no text */}
        <button
          className="navbar__icon-btn"
          onClick={onLogout}
          title="Log Out"
        >
          🚪
        </button>
      </div>
    </nav>
  )
}

export default Navbar