import { CheckCircle2, Copy, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "../providers/AuthProvider";
import { useUsers } from "../providers/UsersProvider";

const IBAN = "HR3923400091111199032";


function IbanButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(IBAN);
    setCopied(true);
    toast.success("IBAN kopiran!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full group relative flex items-center justify-between gap-4 rounded-2xl px-5 py-4 transition-all duration-200 border-2"
      style={{
        background: copied ? "oklch(0.96 0.04 155)" : "oklch(0.97 0.015 150)",
        borderColor: copied ? "oklch(0.60 0.15 155)" : "oklch(0.85 0.04 150)",
      }}
    >
      <span
        className="font-mono font-bold tracking-[0.08em] text-base sm:text-lg transition-colors whitespace-nowrap"
        style={{ color: copied ? "oklch(0.35 0.12 155)" : "oklch(0.30 0.10 150)" }}
      >
        {IBAN}
      </span>
      <div
        className="flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
        style={{
          background: copied ? "oklch(0.448 0.119 150)" : "oklch(0.448 0.119 150 / 0.15)",
          color: copied ? "white" : "oklch(0.35 0.10 150)",
        }}
      >
        {copied ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {copied ? "Kopirano!" : "Kopiraj"}
      </div>
    </button>
  );
}

export default function Payment() {
  const { user } = useAuth();
  const { users } = useUsers();

  const currentUser = useMemo(
    () => users.find((u) => u.user_id === user?.id),
    [user, users]
  );

  const now = new Date();
  const currentMonthName = [
    "siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja",
    "srpnja", "kolovoza", "rujna", "listopada", "studenog", "prosinca",
  ][now.getMonth()];
  const isPaid = currentUser?.paid;

  return (
    <div className="container max-w-xl mx-auto py-10 px-4">
      {/* Page title */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight">Uplate</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Podaci za uplatu mjesečne članarine
        </p>
      </div>

      {/* Payment status pill — only for non-admin */}
      {currentUser && !currentUser.is_admin && (
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5 border"
          style={
            isPaid
              ? {
                  background: "oklch(0.96 0.04 155)",
                  borderColor: "oklch(0.80 0.10 155)",
                }
              : {
                  background: "oklch(0.97 0.04 27)",
                  borderColor: "oklch(0.82 0.10 27)",
                }
          }
        >
          {isPaid ? (
            <CheckCircle2
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "oklch(0.45 0.14 155)" }}
            />
          ) : (
            <AlertCircle
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "oklch(0.50 0.18 27)" }}
            />
          )}
          <p
            className="text-sm font-medium"
            style={{
              color: isPaid ? "oklch(0.35 0.12 155)" : "oklch(0.40 0.15 27)",
            }}
          >
            {isPaid
              ? "Vaša članarina je plaćena za ovaj mjesec ✓"
              : `Vaša članarina za ${currentMonthName} još nije evidentirana.`}
          </p>
        </div>
      )}

      {/* Main payment card */}
      <Card className="shadow-md border-border/70 overflow-hidden py-0">
        {/* Price section */}
        <div
          className="px-7 py-8 text-center border-b border-border"
          style={{ background: "oklch(0.985 0.008 85)" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
            Mjesečna članarina · Sezona 2026
          </p>
          <div className="flex items-start justify-center gap-1">
            <span className="text-2xl font-bold text-muted-foreground mt-3">€</span>
            <span
              className="text-8xl font-black leading-none tracking-tighter"
              style={{ color: "oklch(0.30 0.10 150)" }}
            >
              35
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            po igraču · termini uključeni u cijenu
          </p>
        </div>

        {/* Payment details */}
        <CardContent className="p-0">
          {/* Deadline row */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <span className="text-sm text-muted-foreground">Rok za uplatu</span>
            <span className="text-sm font-semibold">
              Do <strong>10.</strong> u mjesecu
            </span>
          </div>

          {/* IBAN section */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Broj računa (IBAN)</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                Klikni za kopiranje
              </span>
            </div>
            <IbanButton />
          </div>

          {/* Payment reference */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Opis uplate</span>
              <span className="text-sm font-mono font-medium text-foreground">
                članarina dgte liga za mjesec ····
              </span>
            </div>
          </div>

          {/* Note */}
          <div className="px-6 py-4 bg-muted/30">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Napomena:</span>{" "}
              U cijeni članarine su uključeni svi termini koje igrate u ligi —
              ne morate ništa plaćati kada odigrate meč.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
