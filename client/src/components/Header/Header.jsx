import "./Header.css";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { images } from "../../assets";
import { UseUser } from "../../context/UserContext";
import UserMenu from "../UserMenu";

export default function Header() {
  const { message, clearMessage } = UseUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearMessage();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="app-header">
      {message && (
        <div className="alert-message" onClick={clearMessage} role="alert">
          <p>{message}</p>
        </div>
      )}
      <nav className="header-nav">
        <Link to="/" className="brand">
          <img src={images.logo} alt="logo" className="logo-image-header" />
          <span className="logo-text-header">Job Compass</span>
        </Link>

        <button
          type="button"
          className="hamburger-btn"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div
          id="mobile-nav-menu"
          className={`nav-links ${mobileMenuOpen ? "nav-links-open" : ""}`}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "user-item active" : "user-item"
            }
            onClick={closeMobileMenu}
          >
            Job search
          </NavLink>
          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              isActive ? "user-item active" : "user-item"
            }
            onClick={closeMobileMenu}
          >
            Open positions
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              isActive ? "user-item active" : "user-item"
            }
            onClick={closeMobileMenu}
          >
            My favorites
          </NavLink>
        </div>

        <div className="header-actions">
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
