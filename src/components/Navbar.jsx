function Navbar({ activePage, setActivePage, onAddMealClick, onLogout, userEmail }) {
  return (
    <nav className="navbar">
      <div className="navbar__logo">Spoon & Fork</div>

      <div className="navbar__tabs">
        <button
          className={`navbar__tab ${activePage === "browse" ? "navbar__tab--active" : ""}`}
          onClick={() => setActivePage("browse")}
        >
          Browse
        </button>
        <button
          className={`navbar__tab ${activePage === "calendar" ? "navbar__tab--active" : ""}`}
          onClick={() => setActivePage("calendar")}
        >
          Ingredients
        </button>
      </div>

      <div className="navbar__icons">
        {/* Calendar icon */}
        <button
          className="navbar__icon-btn"
          onClick={() => setActivePage("calendar")}
          title="My Calendar"
        >
          🗓
        </button>

        {/* Bowl icon — opens the add meal modal */}
        <button
          className="navbar__icon-btn"
          onClick={onAddMealClick}
          title="Add a meal"
        >
          🍲
        </button>

        {/* User info and logout */}
        <div className="navbar__user">
          <span className="navbar__email">{userEmail}</span>
          <button className="navbar__logout" onClick={onLogout}>Log out</button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar