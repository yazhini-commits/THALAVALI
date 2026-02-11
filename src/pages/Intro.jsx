import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef } from "react";

/* ================= ANIMATION VARIANTS ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function Intro() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
  const loggedIn = localStorage.getItem("isLoggedIn");
  if (loggedIn) {
    navigate("/sign");
  } else {
    navigate("/sign");
  }
};


  return (
    <div className="w-full bg-[#0b0b14] text-white overflow-hidden">

      {/* ================= NAVBAR ================= */}
      <motion.nav
        variants={fade}
        initial="hidden"
        animate="visible"
        transition={{ duration: 1 }}
        className="fixed top-0 left-0 w-full z-50 px-12 py-6 flex justify-between items-center bg-black/60 backdrop-blur-lg"
      >
        <div className="flex gap-8 text-sm font-medium">
          <a href="#explore" className="hover:text-purple-400">Explore</a>
          <a href="#partners" className="hover:text-purple-400">Partners</a>
          <a href="#contact" className="hover:text-purple-400">Contact</a>
          <Link to="/sign" className="hover:text-purple-400">Sign In</Link>
        </div>

        <div className="flex items-center gap-2">
          <img src="/infosys-dark.png" className="h-8" alt="logo" />
          <span className="font-semibold tracking-wide">Info Creator</span>
        </div>
      </motion.nav>

      {/* ================= HERO ================= */}
      <section
  className="relative min-h-screen flex items-center px-20 pt-32"
        style={{
          backgroundImage: "url('/create_account.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 1 }}
          className="relative z-10 max-w-3xl"
        >
          <h1 className="text-6xl font-bold leading-tight mb-6">
            A New Way to <br />
            <span className="text-purple-400">Create Content</span>
          </h1>

          <p className="text-lg text-gray-300 mb-10">
            AI-powered platform to generate LinkedIn posts, blogs, emails,
            advertisements and social content instantly.
          </p>

          <div className="flex gap-6">
            <a
              href="#explore"
              className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition font-semibold"
            >
              Start Exploring →
            </a>

            <button
  onClick={() => navigate("/sign?mode=signup")}
  className="px-8 py-3 rounded-full border border-white/40 hover:bg-white/10 transition"
>
  Create Account
</button>



          </div>
        </motion.div>
      </section>

      {/* ================= EXPLORE ================= */}
      <section
  id="explore"
  className="relative py-44 px-16 overflow-hidden bg-[#0b0b14]"
>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-purple-600/20 blur-[160px] rounded-full" />
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center mb-28"
        >
          Explore AI Content Creation
        </motion.h2>

        <div className="max-w-6xl mx-auto space-y-36 perspective-[1600px]">
          <StackCard title="Blog Writing" desc="SEO-optimized long-form blogs with structure & clarity." image="/blog.png" align="right" />
          <StackCard title="LinkedIn Content" desc="Professional posts built for reach & engagement." image="/linkedin.png" align="left" />
          <StackCard title="Advertisements" desc="High-converting ad copies for all platforms." image="/advertisment.png" align="right" />
          <StackCard title="Email Campaigns" desc="Cold emails & newsletters that convert." image="/email.png" align="left" />
          <StackCard title="Tweet Generator" desc="Short, viral tweets crafted for engagement." image="/tweet.png" align="right" />
        </div>
      </section>

      {/* ================= PARTNERS ================= */}
      <section id="partners" className="py-28 bg-[#0b0b14] text-center">
        <motion.h3
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold mb-14"
        >
          Trusted by platforms creators love
        </motion.h3>

        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-wrap justify-center items-center gap-16 opacity-80"
        >
          <img src="/facebook.png" className="h-10 grayscale hover:grayscale-0 transition" />
          <img src="/google-logo.png" className="h-10 grayscale hover:grayscale-0 transition" />
          <img src="/insta-logo.png" className="h-10 grayscale hover:grayscale-0 transition" />
          <img src="/linkedin-logo.png" className="h-10 grayscale hover:grayscale-0 transition" />
          <img src="/tweet-logo.png" className="h-10 grayscale hover:grayscale-0 transition" />
        </motion.div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="bg-[#0b0b14] py-36 text-center">
        <motion.h3
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold max-w-4xl mx-auto mb-10"
        >
          If you are passionate about tackling some most interesting content,
          we would love to hear from you
        </motion.h3>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="flex justify-center gap-6"
        >
          <Link
            to="/profile"
            className="px-10 py-4 rounded-full bg-purple-600 hover:bg-purple-700 transition font-semibold"
          >
            Join Our Team →
          </Link>

          {/* ✅ GET STARTED → HOME PAGE */}
          <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={handleGetStarted}
  className="px-10 py-4 rounded-full border border-white/40 hover:bg-white/10 transition"
>
  Get Started →
</motion.button>

        </motion.div>
      </section>
    </div>
  );
}

function StackCard({ title, desc, image, align }) {
  const cardRef = useRef(null);

const handleMove = (e) => {
  const card = cardRef.current;
  if (!card) return;

  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const rotateY = ((x / rect.width) - 0.5) * 12;
  const rotateX = ((y / rect.height) - 0.5) * -12;

  card.style.transform =
    `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
};

const reset = () => {
  if (cardRef.current) {
    cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  }
};

  return (
    <motion.div
  ref={cardRef}
  onMouseMove={handleMove}
  onMouseLeave={reset}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.9 }}
      className={`relative flex ${align === "left" ? "justify-start" : "justify-end"}`}
    >
      <motion.div
        whileHover={{ rotateX: 6, rotateY: -6, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="relative group w-[88%] h-[380px] rounded-[28px]"
        style={{ transformStyle: "preserve-3d" }}
      >

        {/* BACK CARD */}
        <div
          className="absolute inset-0 rounded-[28px] blur-xl opacity-30 scale-95"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "translateZ(-120px)"
          }}
        />

        {/* MIDDLE GLOW CARD */}
        <div
          className="absolute inset-0 rounded-[28px] border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-xl shadow-[0_0_60px_rgba(168,85,247,0.35)]"
          style={{ transform: "translateZ(-60px)" }}
        />

        {/* FRONT MAIN CARD */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[28px] shadow-2xl"
          style={{
            transform: "translateZ(40px)",
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >

          {/* dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />

          {/* shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700
                          bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.25),transparent)]
                          translate-x-[-150%] group-hover:translate-x-[150%]" />

          {/* content */}
          <div className="absolute bottom-10 left-10 z-10 max-w-lg">
            <h4 className="text-4xl font-bold mb-3 tracking-wide">
              {title}
            </h4>
            <p className="text-gray-300 text-lg leading-relaxed">
              {desc}
            </p>
          </div>

        </div>

      </motion.div>
    </motion.div>
  );
}
