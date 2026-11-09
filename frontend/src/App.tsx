import { useEffect, useState, FormEvent } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  CreditCard,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  phone?: string;
};
type Skill = {
  id: number;
  owner_id: number;
  owner_name: string;
  title: string;
  description: string;
  category: string;
  mode: string;
  duration_hours: number;
};
const money = (n: number) => `${n} ${n === 1 ? "credit" : "credits"}`;
function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("timebank_user") || "null");
    } catch {
      return null;
    }
  });
  const [mobile, setMobile] = useState(false);
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("timebank_token");
    localStorage.removeItem("timebank_user");
    setUser(null);
    navigate("/");
  };
  useEffect(() => {
    if (localStorage.getItem("timebank_token") && !user)
      api
        .get("/users/me")
        .then((r) => {
          setUser(r.data);
          localStorage.setItem("timebank_user", JSON.stringify(r.data));
        })
        .catch(() => setUser(null));
  }, []);
  const auth = (data: any) => {
    localStorage.setItem("timebank_token", data.access_token);
    localStorage.setItem("timebank_user", JSON.stringify(data.user));
    setUser(data.user);
    navigate("/app/dashboard");
  };
  return (
    <div className="min-h-screen">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Clock3 size={22} />
          </span>
          time<span>bank</span>
        </Link>
        <nav className="desktop-nav">
          <a href="/#how">How it works</a>
          <a href="/#skills">Explore skills</a>
          <a href="/#community">Community</a>
        </nav>
        <div className="top-actions">
          {user ? (
            <>
              <Link className="btn btn-quiet" to="/app/dashboard">
                My workspace
              </Link>
              <button className="icon-btn" onClick={logout} title="Sign out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Join TimeBank <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
        <button className="mobile-toggle" onClick={() => setMobile(!mobile)}>
          <Menu />
        </button>
      </header>
      {mobile && (
        <div className="mobile-menu">
          <Link to="/login" onClick={() => setMobile(false)}>
            Log in
          </Link>
          <Link to="/register" onClick={() => setMobile(false)}>
            Join TimeBank
          </Link>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth mode="login" onAuth={auth} />} />
        <Route
          path="/register"
          element={<Auth mode="register" onAuth={auth} />}
        />
        <Route
          path="/app/*"
          element={
            user ? (
              <Workspace user={user} logout={logout} />
            ) : (
              <Auth mode="login" onAuth={auth} />
            )
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
      <footer>
        <div className="brand">
          <span className="brand-icon">
            <Clock3 size={20} />
          </span>
          time<span>bank</span>
        </div>
        <span>Good things happen when we share our time.</span>
        <span>© {new Date().getFullYear()} TimeBank</span>
      </footer>
    </div>
  );
}
function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="pulse" /> A COMMUNITY THAT RUNS ON GENEROSITY
          </div>
          <h1>
            Your time is worth
            <br />
            <em>more together.</em>
          </h1>
          <p className="hero-lead">
            Share what you know. Get help with what you need. TimeBank makes
            every hour count — no money, just meaningful exchanges.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start exchanging <ArrowRight size={18} />
            </Link>
            <a href="#how" className="btn btn-outline btn-lg">
              See how it works
            </a>
          </div>
          <div className="social-proof">
            <div className="avatar-stack">
              <i>R</i>
              <i>A</i>
              <i>M</i>
              <i>+</i>
            </div>
            <span>
              <b>Built on community.</b>
              <br />
              Powered by people like you.
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="center-clock">
            <Clock3 size={54} />
            <b>1 hour</b>
            <small>= 1 time credit</small>
          </div>
          <div className="float-card card-python">
            <span className="float-icon lavender">
              <BookOpen />
            </span>
            <div>
              <b>Python lesson</b>
              <small>+1 credit earned</small>
            </div>
            <span className="plus-credit">+1</span>
          </div>
          <div className="float-card card-garden">
            <span className="float-icon peach">
              <Sparkles />
            </span>
            <div>
              <b>Garden help</b>
              <small>1 credit exchanged</small>
            </div>
            <span className="minus-credit">−1</span>
          </div>
          <div className="mini-note">
            <Handshake size={17} /> Skills have no price tag.
          </div>
        </div>
      </section>
      <section className="stats-strip">
        <div>
          <b>1 hour</b>
          <span>equals 1 time credit</span>
        </div>
        <div>
          <b>Any skill</b>
          <span>has something to offer</span>
        </div>
        <div>
          <b>One community</b>
          <span>many ways to help</span>
        </div>
      </section>
      <section id="how" className="section">
        <div className="section-heading">
          <span className="eyebrow">SIMPLE BY DESIGN</span>
          <h2>
            Give an hour. <em>Get an hour.</em>
          </h2>
          <p>
            No payments, no complicated points. Just a fair exchange of time and
            skills.
          </p>
        </div>
        <div className="steps-grid">
          <Step
            n="01"
            icon={<Users />}
            title="Join your community"
            text="Create a profile, list what you can teach or do, and tell people what you'd love to learn."
          />
          <Step
            n="02"
            icon={<Handshake />}
            title="Make an exchange"
            text="Find a skill, send a request and agree on a time that works for both of you."
          />
          <Step
            n="03"
            icon={<Wallet />}
            title="Earn time credits"
            text="When the exchange is complete and confirmed, credits move safely between wallets."
          />
        </div>
      </section>
      <section id="skills" className="feature-band">
        <div>
          <span className="eyebrow">YOUR SKILLS MATTER</span>
          <h2>
            Everyone has something
            <br />
            <em>worth sharing.</em>
          </h2>
          <p>
            From tutoring and tech support to gardening and creative skills,
            your knowledge can make someone's day easier.
          </p>
          <Link to="/register" className="btn btn-light">
            Find your people <ArrowRight size={17} />
          </Link>
        </div>
        <div className="skill-cloud">
          <span className="cloud-tag tag-a">💻 Tech help</span>
          <span className="cloud-tag tag-b">🌱 Gardening</span>
          <span className="cloud-tag tag-c">📚 Tutoring</span>
          <span className="cloud-tag tag-d">🎨 Design</span>
          <span className="cloud-tag tag-e">🗣️ Languages</span>
          <span className="cloud-tag tag-f">🍳 Cooking</span>
        </div>
      </section>
      <section id="community" className="section community">
        <div className="community-card">
          <div className="community-icon">
            <ShieldCheck size={28} />
          </div>
          <span className="eyebrow">BUILT ON TRUST</span>
          <h2>
            A better kind of
            <br />
            <em>neighbourhood.</em>
          </h2>
          <p>
            Profiles, clear exchange steps and mutual confirmations help make
            every interaction more transparent. Your exact home address is never
            shown publicly.
          </p>
          <Link to="/register" className="text-link">
            Become a member <ArrowRight size={16} />
          </Link>
        </div>
        <div className="quote-card">
          <div className="quote-mark">“</div>
          <p>
            The best thing you can give someone isn't always something you can
            buy. Sometimes it's simply an hour of your time.
          </p>
          <div className="quote-person">
            <span className="quote-avatar">T</span>
            <div>
              <b>The TimeBank idea</b>
              <small>Community first, always</small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
function Step({ n, icon, title, text }: any) {
  return (
    <article className="step-card">
      <div className="step-top">
        <span>{n}</span>
        <div>{icon}</div>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function Auth({
  mode,
  onAuth,
}: {
  mode: "login" | "register";
  onAuth: (d: any) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      onAuth(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Could not connect. Check that the API is running.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-wrap">
      <div className="auth-aside">
        <span className="eyebrow">YOUR COMMUNITY, REIMAGINED</span>
        <h1>
          Make time
          <br />
          <em>mean more.</em>
        </h1>
        <p>One hour of your knowledge can open up a world of help in return.</p>
        <div className="auth-aside-note">
          <Clock3 /> 1 hour = 1 time credit
        </div>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">
          {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
        </span>
        <h2>
          {mode === "login"
            ? "Good to see you again."
            : "Join the TimeBank community."}
        </h2>
        <p>
          {mode === "login"
            ? "Log in to pick up where you left off."
            : "Create your account and start sharing your time."}
        </p>
        {mode === "register" && (
          <>
            <label>
              Full name
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </label>
            <label>
              Location <small>(city or neighbourhood)</small>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Vijayawada"
              />
            </label>
            <label>
              Contact number{" "}
              <small>(shared only after a request is accepted)</small>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Your mobile number"
                maxLength={30}
              />
            </label>
          </>
        )}
        <label>
          Email address
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
          />
        </label>
        {error && <div className="error-msg">{error}</div>}
        <button disabled={busy} className="btn btn-primary btn-full">
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Log in to TimeBank"
              : "Create account"}{" "}
          <ArrowRight size={17} />
        </button>
        <div className="auth-switch">
          {mode === "login" ? "New to TimeBank?" : "Already a member?"}{" "}
          <Link to={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Create an account" : "Log in"}
          </Link>
        </div>
      </form>
    </main>
  );
}
const nav = [
  ["Overview", "/app/dashboard", LayoutDashboard],
  ["Explore people", "/app/people", Users],
  ["Skills & services", "/app/services", Compass],
  ["My skills", "/app/my-skills", BookOpen],
  ["Requests", "/app/requests", Bell],
  ["Exchanges", "/app/exchanges", Handshake],
  ["Time wallet", "/app/wallet", Wallet],
  ["Profile", "/app/profile", Settings],
] as const;
function Workspace({ user, logout }: { user: User; logout: () => void }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="workspace">
      <aside className={`sidebar ${menu ? "show" : ""}`}>
        <Link to="/" className="brand side-brand">
          <span className="brand-icon">
            <Clock3 size={20} />
          </span>
          time<span>bank</span>
        </Link>
        <div className="side-label">WORKSPACE</div>
        {nav.map(([label, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMenu(false)}
            className={({ isActive }) =>
              `side-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        {user.role === "admin" && (
          <>
            <div className="side-label">ADMINISTRATION</div>
            <NavLink to="/app/admin" className="side-link">
              <ShieldCheck size={18} />
              Admin overview
            </NavLink>
          </>
        )}
        <div className="sidebar-bottom">
          <div className="user-mini">
            <span>{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <b>{user.name}</b>
              <small>
                {user.role === "admin" ? "Administrator" : "Community member"}
              </small>
            </div>
          </div>
          <button className="side-link" onClick={logout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="work-main">
        <div className="work-top">
          <button
            className="mobile-toggle work-menu"
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
          <div>
            <span className="eyebrow">TIMEBANK COMMUNITY</span>
            <div className="welcome-line">
              Hello, {user.name.split(" ")[0]} <span>✳</span>
            </div>
          </div>
          <div className="top-right">
            <span className="top-location">
              <span className="pulse" /> {user.location || "Your community"}
            </span>
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        <Routes>
          <Route path="dashboard" element={<Dashboard user={user} />} />
          <Route path="people" element={<People />} />
          <Route path="services" element={<Services />} />
          <Route path="my-skills" element={<MySkills />} />
          <Route path="requests" element={<Requests />} />
          <Route path="exchanges" element={<Exchanges />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="profile" element={<Profile user={user} />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<Dashboard user={user} />} />
        </Routes>
      </main>
    </div>
  );
}
function useLoad<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = () => {
    setLoading(true);
    api
      .get(url)
      .then((r) => {
        setData(r.data);
        setError("");
      })
      .catch((e) => setError(e.response?.data?.detail || "Unable to load data"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    reload();
  }, [url]);
  return { data, error, loading, reload, setData };
}
function PageTitle({ eyebrow, title, sub, action }: any) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}
function Dashboard({ user }: { user: User }) {
  const w = useLoad<{ balance: number }>("/wallet", { balance: 0 });
  const s = useLoad<Skill[]>("/skills", []);
  const r = useLoad<any[]>("/requests", []);
  const e = useLoad<any[]>("/exchanges", []);
  return (
    <div className="page-content">
      <PageTitle
        eyebrow="YOUR OVERVIEW"
        title="Your time, well spent."
        sub="Here's what's happening in your TimeBank community."
        action={
          <Link to="/app/my-skills" className="btn btn-primary">
            <Plus size={17} /> Offer a skill
          </Link>
        }
      />
      <div className="metric-grid">
        <Metric
          icon={<Wallet />}
          label="Available credits"
          value={w.loading ? "—" : w.data.balance}
          hint="Ready to exchange"
        />
        <Metric
          icon={<BookOpen />}
          label="Skills available"
          value={s.data.length}
          hint="Across the community"
        />
        <Metric
          icon={<Bell />}
          label="Your requests"
          value={r.data.length}
          hint="Sent and received"
        />
        <Metric
          icon={<Handshake />}
          label="Completed exchanges"
          value={e.data.filter((x) => x.status === "COMPLETED").length}
          hint="Hours shared together"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">DISCOVER</span>
              <h3>Skills you can explore</h3>
            </div>
            <Link to="/app/services" className="text-link">
              View all <ChevronRight size={15} />
            </Link>
          </div>
          {s.data.slice(0, 4).map((skill) => (
            <SkillRow key={skill.id} skill={skill} />
          ))}
          {!s.data.length && (
            <Empty text="No skills listed yet. Be the first to offer one." />
          )}
        </section>
        <section className="panel highlight-panel">
          <div className="highlight-icon">
            <Sparkles />
          </div>
          <span className="eyebrow">A LITTLE REMINDER</span>
          <h3>Your time has value.</h3>
          <p>
            Share one thing you're good at. Someone nearby might be looking for
            exactly that.
          </p>
          <Link to="/app/my-skills" className="btn btn-primary">
            Add your first skill <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">IN PROGRESS</span>
            <h3>Recent exchanges</h3>
          </div>
          <Link to="/app/exchanges" className="text-link">
            All exchanges <ChevronRight size={15} />
          </Link>
        </div>
        {e.data.slice(0, 4).map((x) => (
          <div className="list-row" key={x.id}>
            <span className="list-icon">
              <Handshake />
            </span>
            <div className="list-grow">
              <b>{x.skill_title}</b>
              <small>{x.status.replaceAll("_", " ")}</small>
            </div>
            <span className="credit-chip">{money(x.credits)}</span>
          </div>
        ))}
        {!e.data.length && (
          <Empty text="Your exchange activity will appear here." />
        )}
      </section>
    </div>
  );
}
function Metric({ icon, label, value, hint }: any) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}
function Empty({ text }: any) {
  return <div className="empty-state">{text}</div>;
}
function SkillRow({ skill }: { skill: Skill }) {
  return (
    <div className="skill-row">
      <span className="skill-emoji">
        {skill.category === "Education"
          ? "📚"
          : skill.category === "Design"
            ? "🎨"
            : skill.category === "Household"
              ? "🌱"
              : "✳️"}
      </span>
      <div className="list-grow">
        <b>{skill.title}</b>
        <small>
          by {skill.owner_name} · {skill.category} · {skill.mode}
        </small>
      </div>
      <span className="duration">{skill.duration_hours}h</span>
      <Link className="small-link" to="/app/services">
        View
      </Link>
    </div>
  );
}
function Services() {
  const q = useState("");
  const [query, setQuery] = q;
  const { data, error, loading } = useLoad<Skill[]>("/skills", []);
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const filtered = data.filter((s) =>
    `${s.title} ${s.category} ${s.owner_name}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const request = async (id: number) => {
    setBusy(id);
    setMsg("");
    try {
      await api.post("/requests", {
        skill_id: id,
        message: "Hi! I would like to arrange a time exchange.",
      });
      setMsg("Request sent successfully.");
    } catch (e: any) {
      setMsg(e.response?.data?.detail || "Could not send request.");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="page-content">
      <PageTitle
        eyebrow="DISCOVER THE COMMUNITY"
        title="Find a skill. Find your people."
        sub="Explore what your community is happy to share."
      />
      <div className="searchbar">
        <Search />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills, categories or people…"
        />
      </div>
      {msg && <div className="success-msg">{msg}</div>}
      {error && <div className="error-msg">{error}</div>}
      <div className="skill-grid">
        {filtered.map((s) => (
          <article className="skill-card" key={s.id}>
            <div className="skill-card-top">
              <span className="skill-emoji big">
                {s.category === "Education"
                  ? "📚"
                  : s.category === "Design"
                    ? "🎨"
                    : s.category === "Household"
                      ? "🌱"
                      : "✳️"}
              </span>
              <span className="category-pill">{s.category}</span>
            </div>
            <h3>{s.title}</h3>
            <p>
              {s.description || "A community member is offering this skill."}
            </p>
            <div className="provider">
              <span className="provider-avatar">{s.owner_name[0]}</span>
              <div>
                <b>{s.owner_name}</b>
                <small>
                  {s.mode} · {s.duration_hours} hour(s)
                </small>
              </div>
            </div>
            <button
              className="btn btn-primary btn-full"
              disabled={busy === s.id}
              onClick={() => request(s.id)}
            >
              {busy === s.id ? "Sending…" : "Request this skill"}{" "}
              <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
      {loading && <Empty text="Loading community skills…" />}
      {!loading && !filtered.length && (
        <Empty text="No matching skills found. Try another search." />
      )}
    </div>
  );
}
function MySkills() {
  const { data, error, loading, reload } = useLoad<Skill[]>("/skills", []);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Education",
    mode: "Either",
    duration_hours: 1,
  });
  const [msg, setMsg] = useState("");
  const mine = data.filter(
    (s) =>
      s.owner_id ===
      Number(JSON.parse(localStorage.getItem("timebank_user") || "{}").id),
  );
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/skills", form);
      setMsg("Your skill is now listed.");
      setForm({ ...form, title: "", description: "" });
      reload();
    } catch (e: any) {
      setMsg(e.response?.data?.detail || "Unable to add skill");
    }
  };
  return (
    <div className="page-content">
      <PageTitle
        eyebrow="SHARE WHAT YOU KNOW"
        title="Your skills"
        sub="Offer something you're good at and earn time credits when you help."
      />
      <div className="two-col">
        <form className="panel form-panel" onSubmit={submit}>
          <span className="eyebrow">CREATE A LISTING</span>
          <h3>Add a skill</h3>
          <label>
            Skill title
            <input
              required
              minLength={3}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Beginner Python tutoring"
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="What can someone expect to learn or receive?"
            />
          </label>
          <div className="form-row">
            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {[
                  "Education",
                  "Technology",
                  "Design",
                  "Language",
                  "Household",
                  "Wellness",
                  "Other",
                ].map((x) => (
                  <option>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Service mode
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                <option>Either</option>
                <option>Online</option>
                <option>In-person</option>
              </select>
            </label>
          </div>
          <label>
            Hours per session
            <input
              type="number"
              min="1"
              max="24"
              value={form.duration_hours}
              onChange={(e) =>
                setForm({ ...form, duration_hours: Number(e.target.value) })
              }
            />
          </label>
          {msg && <div className="success-msg">{msg}</div>}
          <button className="btn btn-primary">
            Publish skill <Plus size={16} />
          </button>
        </form>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">YOUR CONTRIBUTION</span>
              <h3>Listed by you</h3>
            </div>
            <span className="count-badge">{mine.length}</span>
          </div>
          {mine.map((s) => (
            <SkillRow key={s.id} skill={s} />
          ))}
          {!mine.length && (
            <Empty
              text={loading ? "Loading…" : "You have not listed a skill yet."}
            />
          )}
          {error && <div className="error-msg">{error}</div>}
        </section>
      </div>
    </div>
  );
}
function Requests() {
  const { data, error, loading, reload } = useLoad<any[]>("/requests", []);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const uid = Number(
    JSON.parse(localStorage.getItem("timebank_user") || "{}").id,
  );
  const act = async (id: number, a: string) => {
    setBusy(id);
    setMsg("");
    try {
      await api.patch(`/requests/${id}/${a}`);
      setMsg(`Request ${a}ed.`);
      reload();
    } catch (e: any) {
      setMsg(e.response?.data?.detail || "Action failed");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="page-content">
      <PageTitle
        eyebrow="COORDINATE YOUR TIME"
        title="Service requests"
        sub="Requests you've sent and requests from people who need your help."
      />
      <div className="panel">
        {msg && <div className="success-msg">{msg}</div>}
        {data.map((r) => (
          <div className="request-row" key={r.id}>
            <div className="list-grow">
              <b>{r.skill_title}</b>
              <small>
                {r.requester_id === uid
                  ? "You requested this skill"
                  : "Incoming request"}{" "}
                · {r.message}
              </small>
              <span className="status-pill">{r.status}</span>
            </div>
            {r.provider_id === uid && r.status === "PENDING" && (
              <div className="inline-actions">
                <button
                  disabled={busy === r.id}
                  className="btn btn-primary"
                  onClick={() => act(r.id, "accept")}
                >
                  Accept
                </button>
                <button
                  disabled={busy === r.id}
                  className="btn btn-outline"
                  onClick={() => act(r.id, "decline")}
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
        {!loading && !data.length && (
          <Empty text="No requests yet. Explore skills to get started." />
        )}
        {error && <div className="error-msg">{error}</div>}
      </div>
    </div>
  );
}
function Exchanges() {
  const { data, error, loading, reload } = useLoad<any[]>("/exchanges", []);
  const uid = Number(
    JSON.parse(localStorage.getItem("timebank_user") || "{}").id,
  );
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const timer = window.setInterval(reload, 5000);
    return () => window.clearInterval(timer);
  }, []);
  const confirm = async (id: number) => {
    try {
      const { data } = await api.patch(`/exchanges/${id}/confirm`);
      setMsg(
        data.credits_settled
          ? "Both confirmations received. Credits have been settled."
          : "Your confirmation is saved. Waiting for the other member.",
      );
      reload();
    } catch (e: any) {
      setMsg(e.response?.data?.detail || "Unable to confirm");
    }
  };
  return (
    <div className="page-content">
      <PageTitle
        eyebrow="MAKE IT COUNT"
        title="Your exchanges"
        sub="Chat privately, share contact details, agree on a meeting and confirm the completed service."
      />
      {msg && <div className="success-msg">{msg}</div>}
      {data.map((x) => (
        <ExchangeCommunication
          key={x.id}
          exchange={x}
          uid={uid}
          onConfirm={confirm}
        />
      ))}
      {!loading && !data.length && (
        <div className="panel">
          <Empty text="Accepted service requests will become exchanges here." />
        </div>
      )}
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}

function ExchangeCommunication({
  exchange: x,
  uid,
  onConfirm,
}: {
  exchange: any;
  uid: number;
  onConfirm: (id: number) => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [chatError, setChatError] = useState("");
  const [scheduleMsg, setScheduleMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState({
    scheduled_at: x.scheduled_at || "",
    meeting_mode: x.meeting_mode || "Online",
    meeting_link: x.meeting_link || "",
    meeting_location: x.meeting_location || "",
    schedule_notes: x.schedule_notes || "",
  });
  const phone = x.partner_phone || "";
  const location = x.partner_location || "";
  useEffect(() => {
    setSchedule({
      scheduled_at: x.scheduled_at || "",
      meeting_mode: x.meeting_mode || "Online",
      meeting_link: x.meeting_link || "",
      meeting_location: x.meeting_location || "",
      schedule_notes: x.schedule_notes || "",
    });
  }, [
    x.scheduled_at,
    x.meeting_mode,
    x.meeting_link,
    x.meeting_location,
    x.schedule_notes,
  ]);
  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/exchanges/${x.id}/messages`);
      setMessages(data);
    } catch (e: any) {
      setChatError(e.response?.data?.detail || "Unable to load chat");
    }
  };
  useEffect(() => {
    loadMessages();
    const timer = window.setInterval(loadMessages, 4000);
    return () => window.clearInterval(timer);
  }, [x.id]);
  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    setChatError("");
    try {
      const { data } = await api.post(`/exchanges/${x.id}/messages`, {
        body: draft.trim(),
      });
      setMessages((old) => [...old.filter((m) => m.id !== data.id), data]);
      setDraft("");
    } catch (e: any) {
      setChatError(e.response?.data?.detail || "Message could not be sent");
    } finally {
      setSending(false);
    }
  };
  const saveSchedule = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setScheduleMsg("");
    try {
      await api.patch(`/exchanges/${x.id}/schedule`, schedule);
      setScheduleMsg(
        "Schedule saved. Both participants can now see these details.",
      );
    } catch (e: any) {
      setScheduleMsg(e.response?.data?.detail || "Could not update schedule");
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="panel exchange-panel">
      <div className="exchange-heading">
        <div>
          <span className="eyebrow">EXCHANGE #{x.id}</span>
          <h3>{x.skill_title}</h3>
          <small>
            {x.requester_id === uid
              ? `Provider: ${x.partner_name}`
              : `Requester: ${x.partner_name}`}{" "}
            · {money(x.credits)}
          </small>
          <span className="status-pill">{x.status.replaceAll("_", " ")}</span>
        </div>
        {x.status !== "COMPLETED" && (
          <button className="btn btn-outline" onClick={() => onConfirm(x.id)}>
            <Check size={15} /> Confirm complete
          </button>
        )}
      </div>
      <div className="contact-strip">
        <div>
          <b>
            <Users size={14} /> Contact details
          </b>
          <span>Phone: {phone || "Not provided — ask them in chat"}</span>
          <span>General location: {location || "Not provided"}</span>
        </div>
        <small>Visible only to participants in this accepted exchange.</small>
      </div>
      <div className="exchange-columns">
        <div className="chat-box">
          <div className="panel-head">
            <div>
              <span className="eyebrow">PRIVATE EXCHANGE CHAT</span>
              <h3>Messages</h3>
            </div>
            <span className="live-dot">● Live refresh</span>
          </div>
          <div className="chat-messages">
            {messages.map((m) => (
              <div
                className={`chat-message ${m.sender_id === uid ? "mine" : ""}`}
                key={m.id}
              >
                <b>{m.sender_id === uid ? "You" : m.sender_name}</b>
                <p>{m.body}</p>
                <small>{new Date(m.created_at).toLocaleString()}</small>
              </div>
            ))}
            {!messages.length && (
              <Empty text="No messages yet. Say hello and agree on a time." />
            )}
          </div>
          <form className="chat-compose" onSubmit={send}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              placeholder="Write a message…"
            />
            <button
              className="btn btn-primary"
              disabled={sending || !draft.trim()}
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
          {chatError && <div className="error-msg">{chatError}</div>}
        </div>
        <div className="schedule-box">
          <div className="panel-head">
            <div>
              <span className="eyebrow">MEETING DETAILS</span>
              <h3>Schedule this exchange</h3>
            </div>
            <CalendarDays size={20} />
          </div>
          <form className="form-panel" onSubmit={saveSchedule}>
            <label>
              Date and time
              <input
                type="datetime-local"
                value={schedule.scheduled_at}
                onChange={(e) =>
                  setSchedule({ ...schedule, scheduled_at: e.target.value })
                }
              />
            </label>
            <label>
              Meeting type
              <select
                value={schedule.meeting_mode}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    meeting_mode: e.target.value,
                    meeting_link:
                      e.target.value === "In-person"
                        ? ""
                        : schedule.meeting_link,
                    meeting_location:
                      e.target.value === "Online"
                        ? ""
                        : schedule.meeting_location,
                  })
                }
              >
                <option>Online</option>
                <option>In-person</option>
              </select>
            </label>
            {schedule.meeting_mode === "Online" ? (
              <label>
                Meeting link
                <input
                  type="url"
                  value={schedule.meeting_link}
                  onChange={(e) =>
                    setSchedule({ ...schedule, meeting_link: e.target.value })
                  }
                  placeholder="https://meet.google.com/..."
                />
                <small className="field-hint">
                  Paste a Google Meet, Zoom or other meeting URL. Either
                  participant can update it.
                </small>
              </label>
            ) : (
              <label>
                Public meeting location
                <input
                  value={schedule.meeting_location}
                  onChange={(e) =>
                    setSchedule({
                      ...schedule,
                      meeting_location: e.target.value,
                    })
                  }
                  placeholder="Library, cafe or public place"
                />
              </label>
            )}
            <label>
              Notes
              <textarea
                value={schedule.schedule_notes}
                onChange={(e) =>
                  setSchedule({ ...schedule, schedule_notes: e.target.value })
                }
                placeholder="Agenda, what to bring, or other arrangements…"
              />
            </label>
            <button className="btn btn-primary btn-full" disabled={saving}>
              {saving ? "Saving…" : "Save / update meeting"}
            </button>
          </form>
          {schedule.meeting_link && (
            <a
              className="meeting-link"
              href={schedule.meeting_link}
              target="_blank"
              rel="noreferrer"
            >
              Open current meeting link <ArrowRight size={14} />
            </a>
          )}
          {schedule.meeting_location && (
            <p className="muted">
              Current location: {schedule.meeting_location}
            </p>
          )}
          {scheduleMsg && <div className="success-msg">{scheduleMsg}</div>}
        </div>
      </div>
    </section>
  );
}

function WalletPage() {
  const w = useLoad<any>("/wallet", { balance: 0 });
  const t = useLoad<any[]>("/wallet/transactions", []);
  return (
    <div className="page-content">
      <PageTitle
        eyebrow="YOUR TIME, ACCOUNTED FOR"
        title="Time wallet"
        sub="A transparent record of the time credits you've earned and used."
      />
      <div className="wallet-hero">
        <div>
          <span className="eyebrow">AVAILABLE BALANCE</span>
          <div className="wallet-number">
            {w.data.balance ?? 0}
            <small> credits</small>
          </div>
          <p>1 approved hour of service = 1 time credit.</p>
        </div>
        <div className="wallet-symbol">
          <Wallet size={48} />
        </div>
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">YOUR LEDGER</span>
            <h3>Recent transactions</h3>
          </div>
        </div>
        {t.data.map((x) => (
          <div className="list-row" key={x.id}>
            <span
              className={`transaction-icon ${x.amount > 0 ? "positive" : "negative"}`}
            >
              {x.amount > 0 ? "+" : "−"}
            </span>
            <div className="list-grow">
              <b>{x.description}</b>
              <small>
                {new Date(x.created_at).toLocaleString()} · {x.reference}
              </small>
            </div>
            <strong
              className={x.amount > 0 ? "text-positive" : "text-negative"}
            >
              {x.amount > 0 ? "+" : ""}
              {x.amount}
            </strong>
          </div>
        ))}
        {!t.loading && !t.data.length && (
          <Empty text="Your wallet activity will appear here." />
        )}
      </section>
      <p className="fine-print">
        Time credits are internal exchange units. They have no cash value and
        cannot be withdrawn.
      </p>
    </div>
  );
}
function People() {
  const [q, setQ] = useState("");
  const { data, error, loading } = useLoad<any[]>("/users", []);
  const filtered = data.filter((x) =>
    `${x.name} ${x.location} ${x.skills.join(" ")}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <div className="page-content">
      <PageTitle
        eyebrow="MEET YOUR COMMUNITY"
        title="People make the difference."
        sub="Discover members and the skills they are sharing."
      />
      <div className="searchbar">
        <Search />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, location or skill…"
        />
      </div>
      <div className="people-grid">
        {filtered.map((p) => (
          <div className="person-card" key={p.id}>
            <span className="person-avatar">{p.name[0]}</span>
            <h3>{p.name}</h3>
            <small>{p.location || "Community member"}</small>
            <p>
              {p.bio || "Ready to share time and skills with the community."}
            </p>
            <div className="tag-list">
              {p.skills.map((s: string) => (
                <span>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {loading && <Empty text="Finding community members…" />}
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
function Profile({ user }: { user: User }) {
  const [form, setForm] = useState({
    name: user.name,
    bio: user.bio || "",
    location: user.location || "",
    phone: user.phone || "",
  });
  const [msg, setMsg] = useState("");
  const save = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/users/me", form);
      localStorage.setItem("timebank_user", JSON.stringify(data));
      setMsg("Profile updated. Refresh the page to update the greeting.");
    } catch (e: any) {
      setMsg(e.response?.data?.detail || "Unable to save profile");
    }
  };
  return (
    <div className="page-content">
      <PageTitle
        eyebrow="YOUR COMMUNITY IDENTITY"
        title="Your profile"
        sub="Help others understand what you enjoy and where you can help."
      />
      <form className="panel form-panel profile-form" onSubmit={save}>
        <div className="profile-head">
          <span className="person-avatar">{user.name[0]}</span>
          <div>
            <h3>{user.name}</h3>
            <small>{user.email}</small>
          </div>
          <span className="verified-label">
            <BadgeCheck size={15} /> Member
          </span>
        </div>
        <label>
          Full name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Short bio
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="A little about you…"
          />
        </label>
        <label>
          General location
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="City or neighbourhood"
          />
        </label>
        <label>
          Contact number
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Mobile number"
            maxLength={30}
          />
          <small>
            Shared with the other participant only after an exchange is
            accepted.
          </small>
        </label>
        {msg && <div className="success-msg">{msg}</div>}
        <button className="btn btn-primary">Save profile</button>
      </form>
    </div>
  );
}
function Admin() {
  const { data, error, loading } = useLoad<any>("/admin/dashboard", {
    users: 0,
    skills: 0,
    requests: 0,
    completed_exchanges: 0,
  });
  return (
    <div className="page-content">
      <PageTitle
        eyebrow="PLATFORM OPERATIONS"
        title="Admin overview"
        sub="A snapshot of activity across the TimeBank community."
      />
      <div className="metric-grid">
        <Metric
          icon={<Users />}
          label="Registered users"
          value={data.users}
          hint="Community members"
        />
        <Metric
          icon={<BookOpen />}
          label="Active skills"
          value={data.skills}
          hint="Available listings"
        />
        <Metric
          icon={<Bell />}
          label="Service requests"
          value={data.requests}
          hint="All requests"
        />
        <Metric
          icon={<Handshake />}
          label="Completed exchanges"
          value={data.completed_exchanges}
          hint="Successfully settled"
        />
      </div>
      {error && <div className="error-msg">{error}</div>}
      <div className="panel">
        <span className="eyebrow">ADMINISTRATION</span>
        <h3>Responsible community management</h3>
        <p className="muted">
          Use the API's protected admin endpoints to review accounts. Moderator
          permissions and dispute resolution are planned extensions; do not
          grant admin access to moderators.
        </p>
        <Link to="/app/people" className="text-link">
          View community members <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
export default App;