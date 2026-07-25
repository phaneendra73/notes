import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button.jsx";
import {
  FiEdit3,
  FiLogOut,
  FiSettings,
  FiTag,
  FiLogIn,
  FiBook,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { cn } from "../../lib/utils.js";

function NavLink({ to, label, icon: Icon, active }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.375rem 0.75rem",
        borderRadius: 8,
        border: "none",
        background: active ? "var(--neon-subtle)" : "transparent",
        color: active ? "var(--neon)" : "var(--fg-muted)",
        fontWeight: active ? 600 : 500,
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--neon-subtle)";
          e.currentTarget.style.color = "var(--fg)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--fg-muted)";
        }
      }}
    >
      {Icon && <Icon style={{ width: 14, height: 14 }} />}
      {label}
    </button>
  );
}

export default function Appbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const isAuthenticated = Boolean(localStorage.getItem("jwt"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("jwt");
    navigate("/");
    setMobileOpen(false);
  };

  const navLinks = [
    { to: "/BlogPosts", icon: FiBook, label: "Explore" },
    ...(isAuthenticated
      ? [
          { to: "/Admin", icon: FiSettings, label: "Manage" },
          { to: "/Tag", icon: FiTag, label: "Tags" },
        ]
      : []),
  ];

  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: isDark ? "rgba(3,7,18,0.9)" : "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border)",
    width: "100%",
  };

  const iconBtnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "rgba(255,255,255,0.6)",
    color: "var(--fg-muted)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 6px 16px rgba(2, 6, 23, 0.04)",
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={headerStyle}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        {/* Group Logo + Desktop Nav on the Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 800,
                fontSize: "1.08rem",
                color: "var(--fg)",
                letterSpacing: "-0.02em",
              }}
            >
              Kadha <span style={{ color: "var(--primary)" }}>Journal</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav
            style={{ display: "flex", alignItems: "center", gap: 4 }}
            className="hidden-on-mobile"
          >
            {navLinks.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                icon={n.icon}
                label={n.label}
                active={location.pathname === n.to}
              />
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Theme toggle */}
          <button
            style={iconBtnStyle}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title="Toggle theme"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--neon)";
              e.currentTarget.style.color = "var(--neon)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--fg-muted)";
            }}
          >
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          {/* Desktop auth buttons */}
          <div
            className="hidden-on-mobile"
            style={{ alignItems: "center", gap: 8 }}
          >
            {isAuthenticated ? (
              <>
                <img
                  src="/assets/kadha.svg"
                  alt="Profile"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "2px solid var(--primary)",
                    objectFit: "cover",
                    cursor: "pointer",
                    marginRight: 6,
                  }}
                  onClick={() => navigate("/Admin")}
                  title="Admin Dashboard"
                />
                <Button
                  variant="neon"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => navigate("/Editor")}
                >
                  <FiEdit3 size={14} /> Write
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-xl"
                  style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.16)" }}
                >
                  <FiLogOut size={14} /> Sign Out
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="btn-pill rounded-xl"
                onClick={() => navigate("/Signin")}
              >
                <FiLogIn size={14} /> Sign In
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="visible-on-mobile"
            style={iconBtnStyle}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid var(--border)",
              background: "var(--bg)",
            }}
          >
            <div
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {navLinks.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  icon={n.icon}
                  label={n.label}
                  active={location.pathname === n.to}
                />
              ))}
              <div
                style={{
                  paddingTop: 8,
                  marginTop: 4,
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {isAuthenticated ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "0.25rem 0.5rem",
                        marginBottom: 4,
                      }}
                    >
                      <img
                        src="/assets/kadha.svg"
                        alt="Profile"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: "2px solid var(--primary)",
                          objectFit: "cover",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--fg)",
                        }}
                      >
                        Dashboard
                      </span>
                    </div>
                    <Button
                      variant="neon"
                      size="sm"
                      onClick={() => {
                        navigate("/Editor");
                        setMobileOpen(false);
                      }}
                    >
                      <FiEdit3 size={14} /> Write a Story
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      style={{ color: "#ef4444" }}
                    >
                      <FiLogOut size={14} /> Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      navigate("/Signin");
                      setMobileOpen(false);
                    }}
                  >
                    <FiLogIn size={14} /> Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
