import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import ThemeProvider from "./context/ThemeContext";
import { PromptProvider } from "./context/PromptContext";

import EditorWorkspace from "./pages/EditorWorkspace";
import Loader from "./components/Loader";

import Intro from "./pages/Intro";
import Home from "./pages/Home";
import Sign from "./pages/Sign";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";   // ⭐ ADDED (THIS FIXES CRASH)
import { ABProvider } from "./context/ABContext";

/* ================= ROUTES WRAPPER ================= */
function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  /* ---------------- INTRO CONTROL ---------------- */

  const hasVisited = sessionStorage.getItem("hasVisited");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // First time opening site in this browser tab
  useEffect(() => {
    if (!hasVisited) {
      sessionStorage.setItem("hasVisited", "true");
    }
  }, []);

  return (
    <>
      {loading && <Loader />}

      <Routes>

        {/* FIRST PAGE ALWAYS INTRO */}
        <Route
          path="/"
          element={!hasVisited ? <Intro /> : (isLoggedIn ? <Home /> : <Sign />)}
        />

        <Route path="/sign" element={<Sign />} />

        <Route
          path="/home"
          element={isLoggedIn ? <Home /> : <Sign />}
        />

        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Sign />}
        />

        <Route
          path="/editor"
          element={isLoggedIn ? <EditorWorkspace /> : <Sign />}
        />

        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Sign />}
        />

        {/* fallback */}
        <Route
          path="*"
          element={<Intro />}
        />

      </Routes>
    </>
  );
}


/* ================= APP ROOT ================= */
export default function App() {
  return (
    <ThemeProvider>
      <PromptProvider>
        <ABProvider>
          <BrowserRouter basename="/THALAVALI/">
            <AppRoutes />
          </BrowserRouter>
        </ABProvider>
      </PromptProvider>
    </ThemeProvider>
  );
}
