import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { BASE } from "../utils/routerBase";

export default function Sign() {
  
  const navigate = useNavigate();
  const location = useLocation();

  // 👉 detect mode from Intro
  const defaultSignup = location.state?.mode === "signup";
  const [isSignup, setIsSignup] = useState(defaultSignup);

  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (isSignup) {
      if (form.password !== form.confirmPassword) return;

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        })
      );

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setIsSignup(false); // 👉 switch to Sign In
      }, 1600);
    } else {
      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (
        savedUser &&
        savedUser.email === form.email &&
        savedUser.password === form.password
      ) {
        localStorage.setItem("isLoggedIn", "true");
        navigate(`${BASE}/home`);
      }
    }
  };
 
  return (
  <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden text-white z-0">
  {/* ===== VIDEO BACKGROUND ===== */}
<video
  autoPlay
  muted
  loop
  playsInline
  className="fixed inset-0 w-full h-full object-cover -z-20"
>
  <source src="/signin.mp4" type="video/mp4" />
</video>

<div className="absolute inset-0 bg-black/55 z-10" />

<div className="absolute inset-0 z-10
bg-[radial-gradient(circle_at_70%_40%,rgba(139,92,246,0.35),transparent_60%)]" />

    

      


      <motion.div
  initial={{ opacity: 0, y: 40, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  whileHover={{ scale: 1.02 }}
  transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="relative z-20 w-[92%] max-w-[440px] p-10 rounded-[32px]
bg-white/[0.05]
backdrop-blur-3xl
border border-white/20
shadow-[0_30px_120px_rgba(0,0,0,0.8)]
before:absolute before:inset-0 before:rounded-[32px]
before:bg-gradient-to-b before:from-white/10 before:to-transparent
before:pointer-events-none"


      >
        <div className="text-center mb-8">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[260px] h-[120px] bg-purple-500/30 blur-[90px] rounded-full pointer-events-none"></div>

  <h2 className="text-3xl font-bold tracking-wide">
    {isSignup ? "Create your account" : "Welcome back"}
  </h2>
  <p className="text-sm text-gray-300 mt-2">
    {isSignup
      ? "Start generating AI content in seconds"
      : "Sign in to continue to Info Creator"}
  </p>
</div>


        {isSignup && (
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded-xl
bg-black/40
border border-white/15
text-white placeholder:text-gray-400
focus:outline-none focus:border-purple-400
focus:ring-2 focus:ring-purple-500/40
backdrop-blur-md transition"


          />
        )}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-3 rounded-xl
bg-black/40
border border-white/15
text-white placeholder:text-gray-400
focus:outline-none focus:border-purple-400
focus:ring-2 focus:ring-purple-500/40
backdrop-blur-md transition"

        />

        {/* PASSWORD */}
        <div className="relative mb-4">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded-xl
bg-black/40
border border-white/15
text-white placeholder:text-gray-400
focus:outline-none focus:border-purple-400
focus:ring-2 focus:ring-purple-500/40
backdrop-blur-md transition"


          />
          {form.password && (
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {/* CONFIRM */}
        {isSignup && (
          <div className="relative mb-6">
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full mb-4 px-4 py-3 rounded-xl
bg-black/40
border border-white/15
text-white placeholder:text-gray-400
focus:outline-none focus:border-purple-400
focus:ring-2 focus:ring-purple-500/40
backdrop-blur-md transition"

            />
            {form.confirmPassword && (
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-700"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
            {isSignup && form.password && (
  <div className="mb-4">
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full transition-all duration-300 ${
          form.password.length < 6
            ? "w-1/3 bg-red-400"
            : form.password.length < 9
            ? "w-2/3 bg-yellow-400"
            : "w-full bg-green-400"
        }`}
      />
    </div>
    <p className="text-xs text-gray-400 mt-1">
      {form.password.length < 6
        ? "Weak password"
        : form.password.length < 9
        ? "Medium strength"
        : "Strong password"}
    </p>
  </div>
)}

          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl font-semibold relative overflow-hidden
bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600
hover:brightness-110
transition-all duration-300
shadow-[0_10px_40px_rgba(139,92,246,0.6)]
before:absolute before:inset-0 before:bg-white/20
before:opacity-0 hover:before:opacity-100 before:transition
"

        >
          {isSignup ? "Create Account" : "Sign In"}
        </button>

        <p
          onClick={() => setIsSignup(!isSignup)}
          className="mt-6 text-center text-sm cursor-pointer opacity-80 hover:underline"
        >
          {isSignup ? "Already have an account? Sign In" : "New here? Create Account"}
        </p>

        {/* ✅ SUCCESS ANIMATION */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center
              bg-black/80 backdrop-blur-xl rounded-[28px]"
            >
              <CheckCircle size={48} className="text-green-400 mb-3" />
              <p className="font-semibold text-lg">Account successfully created</p>
<p className="text-sm text-gray-400 mt-1">Redirecting to login...</p>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
