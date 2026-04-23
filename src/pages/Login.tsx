import { User, ArrowRight } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "../utils/supabase";
import type { TUser } from "../types";
import { normalizeCroatianChars } from "../utils/strings";

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col px-4 py-3 rounded-xl"
      style={{ background: "oklch(0.24 0.010 85)", border: "1px solid oklch(0.30 0.008 85)" }}
    >
      <span className="text-xl font-black text-white tracking-tight">{value}</span>
      <span className="text-[10px] font-medium mt-0.5" style={{ color: "oklch(0.58 0.008 85)" }}>
        {label}
      </span>
    </div>
  );
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TUser[]>([]);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("user").select("*").then(({ data }) => {
      if (data) {
        setUsers(data);
        setPlayerCount(data.filter((u) => !u.is_deleted && !u.is_viewer).length);
      }
    });
    supabase
      .from("match")
      .select("id", { count: "exact" })
      .eq("status", "played")
      .then(({ count }) => {
        if (count !== null) setMatchCount(count);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const user = users.find(
      (t) => t.first_name.toLowerCase() + t.last_name.toLowerCase() === username
    );

    if (!user) {
      setError("Korisničko ime netočno, molim vas pokušajte opet.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: normalizeCroatianChars(user.email),
      password: username + "123",
    });

    if (authError) setError("Korisničko ime netočno, molim vas pokušajte opet.");
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ background: "oklch(0.16 0.010 85)" }}
    >
      {/* ── Left panel — brand ──────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col w-[52%] px-14 py-12 relative overflow-hidden"
        style={{ background: "oklch(0.19 0.012 85)" }}
      >
        {/* Tennis court — top-down view */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.10 }}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 600 900"
        >
          {/* Outer court (doubles) */}
          <rect x="80" y="60" width="440" height="780" fill="none" stroke="white" strokeWidth="2.5" />

          {/* Singles sidelines */}
          <line x1="146" y1="60" x2="146" y2="840" stroke="white" strokeWidth="1.5" />
          <line x1="454" y1="60" x2="454" y2="840" stroke="white" strokeWidth="1.5" />

          {/* Net — center */}
          <line x1="80" y1="450" x2="520" y2="450" stroke="white" strokeWidth="3" />
          {/* Net posts */}
          <line x1="80" y1="440" x2="80" y2="460" stroke="white" strokeWidth="3" />
          <line x1="520" y1="440" x2="520" y2="460" stroke="white" strokeWidth="3" />

          {/* Service lines (top half) */}
          <line x1="146" y1="240" x2="454" y2="240" stroke="white" strokeWidth="1.5" />
          {/* Service lines (bottom half) */}
          <line x1="146" y1="660" x2="454" y2="660" stroke="white" strokeWidth="1.5" />

          {/* Center service line (top) */}
          <line x1="300" y1="240" x2="300" y2="450" stroke="white" strokeWidth="1.5" />
          {/* Center service line (bottom) */}
          <line x1="300" y1="450" x2="300" y2="660" stroke="white" strokeWidth="1.5" />

          {/* Center marks on baselines */}
          <line x1="295" y1="60" x2="305" y2="60" stroke="white" strokeWidth="2" />
          <line x1="295" y1="840" x2="305" y2="840" stroke="white" strokeWidth="2" />
        </svg>

        {/* Glow */}
        <div
          className="absolute top-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "oklch(0.448 0.119 150 / 0.14)" }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3 mb-16">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.448 0.119 150)" }}
          >
            <span className="text-lg">🎾</span>
          </div>
          <span className="text-white font-bold text-base tracking-tight">DGTE Liga</span>
        </div>

        {/* Headline */}
        <div className="relative flex-1 flex flex-col justify-center gap-8">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: "oklch(0.448 0.119 150)" }}
            >
              Sezona 2026
            </p>
            <h2 className="text-4xl font-black text-white leading-[1.15] tracking-tight">
              Tenis liga<br />za sve razine.
            </h2>
            <p className="text-sm mt-4 leading-relaxed" style={{ color: "oklch(0.55 0.010 85)" }}>
              Pratite svoju grupu, rezultate i rang listu — sve na jednom mjestu.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3 flex-wrap">
            <StatChip
              label="Aktivnih igrača"
              value={playerCount !== null ? String(playerCount) : "—"}
            />
            <StatChip
              label="Odigranih mečeva"
              value={matchCount !== null ? String(matchCount) : "—"}
            />
            <StatChip label="Sezona" value="2026" />
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-[11px] mt-12" style={{ color: "oklch(0.40 0.008 85)" }}>
          © 2026 DGTE Liga · Tenis liga za sve razine
        </p>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px" style={{ background: "oklch(0.24 0.010 85)" }} />

      {/* ── Right panel — form ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        {/* Mobile logo */}
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: "oklch(0.448 0.119 150)" }}
            >
              <span className="text-2xl">🎾</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">DGTE Liga</h1>
            <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.008 85)" }}>Sezona 2026</p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "oklch(0.21 0.010 85)",
              border: "1px solid oklch(0.27 0.008 85)",
            }}
          >
            <div className="mb-7">
              <h2 className="text-xl font-bold text-white tracking-tight">Dobrodošli</h2>
              <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.010 85)" }}>
                Unesite korisničko ime za pristup
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-5 border-red-900/50 bg-red-950/60">
                <AlertDescription className="text-red-300 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.55 0.008 85)" }}
                >
                  Korisničko ime
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: "oklch(0.48 0.010 85)" }}
                  />
                  <Input
                    id="username"
                    className="h-11 pl-10 text-white placeholder:text-white/20 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
                    style={{
                      background: "oklch(0.26 0.010 85)",
                      boxShadow: "inset 0 0 0 1px oklch(0.32 0.008 85)",
                    }}
                    placeholder="npr. ivankovic"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60 group mt-2"
                style={{ background: "oklch(0.448 0.119 150)" }}
              >
                {loading ? (
                  "Prijava u tijeku..."
                ) : (
                  <>
                    Prijavi se
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-xs" style={{ color: "oklch(0.42 0.008 85)" }}>
              Korisničko ime = ime + prezime malim slovima
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
