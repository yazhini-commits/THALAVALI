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

  // smooth page transition loader
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  return (
    <>
      {loading && <Loader />}

      <Routes>

        {/* Landing */}
        <Route
          path="/"
          element={isLoggedIn ? <Home /> : <Intro />}
        />

        {/* Home */}
        <Route
          path="/home"
          element={isLoggedIn ? <Home /> : <Sign />}
        />

        {/* Sign */}
        <Route path="/sign" element={<Sign />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Sign />}
        />

        {/* Editor */}
        <Route
          path="/editor"
          element={isLoggedIn ? <EditorWorkspace /> : <Sign />}
        />

        {/* ⭐ PROFILE PAGE (THE MISSING ROUTE) */}
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Sign />}
        />

        {/* fallback (important!) */}
        <Route
          path="*"
          element={isLoggedIn ? <Home /> : <Intro />}
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
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ABProvider>
      </PromptProvider>
    </ThemeProvider>
  );
}
