import { CalendarDays } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "../providers/AuthProvider";
import { useUsers } from "../providers/UsersProvider";
import type { TUser } from "../types";
import { supabase } from "../utils/supabase";
import { cn } from "@/lib/utils";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

const MONTHS = [
  "Sij", "Velj", "Ožu", "Tra", "Svi", "Lip",
  "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro",
];

const FULL_MONTHS = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac",
];

type PaymentRow = {
  user_id: string;
  year: number;
  month: number;
  paid: boolean;
};


const YEARS = ["2024", "2025", "2026"];

export default function Membership() {
  const { user: authUser } = useAuth();
  const { users } = useUsers();
  const currentUser = users.find((u) => u.user_id === authUser?.id);
  const isAdmin = currentUser?.is_admin ?? false;

  const [selectedYear, setSelectedYear] = useState(2026);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const activePlayers: TUser[] = isAdmin
    ? users.filter((u) => !u.is_deleted && !u.is_viewer)
    : users.filter((u) => u.user_id === authUser?.id);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const userIds = activePlayers.map((u) => u.user_id);
    if (userIds.length === 0) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("membership_payment")
      .select("user_id, year, month, paid")
      .eq("year", selectedYear)
      .in("user_id", userIds);

    if (!error && data) setPayments(data as PaymentRow[]);
    setLoading(false);
  }, [selectedYear, authUser?.id, users.length]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const isPaid = (userId: string, month: number) =>
    payments.some((p) => p.user_id === userId && p.month === month && p.paid);

  const paidCountForUser = (userId: string) =>
    payments.filter((p) => p.user_id === userId && p.paid).length;

  const handleToggle = async (userId: string, month: number) => {
    if (!isAdmin) return;
    const key = `${userId}-${month}`;
    setToggling(key);
    const currentlyPaid = isPaid(userId, month);
    const { error } = await supabase
      .from("membership_payment")
      .upsert(
        { user_id: userId, year: selectedYear, month, paid: !currentlyPaid },
        { onConflict: "user_id,year,month" }
      );
    if (!error) {
      setPayments((prev) => {
        const filtered = prev.filter((p) => !(p.user_id === userId && p.month === month));
        return [...filtered, { user_id: userId, year: selectedYear, month, paid: !currentlyPaid }];
      });
    }
    setToggling(null);
  };

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="container max-w-full mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Članarine</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin
              ? `Sezona ${selectedYear} · ${activePlayers.length} aktivnih igrača`
              : `Vaše uplate · Sezona ${selectedYear}`}
          </p>
        </div>

        {/* Year selector */}
        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-28 bg-background">
            <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card className="shadow-sm overflow-hidden py-0">
          <CardContent className="p-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
                <div className="h-4 bg-muted rounded animate-pulse w-32" />
                <div className="flex-1 flex gap-2 justify-end">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <div key={j} className="w-7 h-7 rounded-full bg-muted/50 animate-pulse flex-shrink-0" />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                      <TableHead className="sticky left-0 z-30 bg-muted/40 backdrop-blur min-w-[160px] font-semibold">
                        Igrač
                      </TableHead>
                      {MONTHS.map((m, i) => (
                        <TableHead
                          key={m}
                          className={cn(
                            "text-center min-w-[72px] text-xs font-semibold",
                            i + 1 === currentMonth && selectedYear === new Date().getFullYear()
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {m}
                        </TableHead>
                      ))}
                      <TableHead className="text-center min-w-[70px] text-xs font-semibold text-muted-foreground">
                        Ukupno
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePlayers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center py-10 text-sm text-muted-foreground">
                          Nema igrača za odabrani filter
                        </TableCell>
                      </TableRow>
                    ) : (
                      activePlayers.map((player) => {
                        const paidCount = paidCountForUser(player.user_id);
                        return (
                          <TableRow key={player.user_id} className="hover:bg-muted/30">
                            <TableCell className="sticky left-0 z-20 bg-card border-r border-border">
                              <div className="flex items-center gap-2">
                                <PlayerAvatar
                                  firstName={player.first_name}
                                  lastName={player.last_name}
                                  size="sm"
                                />
                                <span className="text-sm font-medium truncate max-w-[100px]">
                                  {player.first_name} {player.last_name}
                                </span>
                              </div>
                            </TableCell>

                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                              const paidMonth = isPaid(player.user_id, month);
                              const key = `${player.user_id}-${month}`;
                              const isToggling = toggling === key;
                              const isCurrent = month === currentMonth && selectedYear === new Date().getFullYear();
                              const isFuture = selectedYear === new Date().getFullYear() && month > currentMonth;

                              return (
                                <TableCell
                                  key={month}
                                  className={cn("text-center p-1", isCurrent && "bg-primary/5")}
                                >
                                  <Tooltip>
                                    <TooltipTrigger
                                      render={
                                        <div className="flex items-center justify-center gap-1">
                                          {/* Plaćeno radio */}
                                          <button
                                            onClick={() => isAdmin && !paidMonth && handleToggle(player.user_id, month)}
                                            disabled={isToggling || !isAdmin || paidMonth}
                                            className={cn(
                                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                              paidMonth
                                                ? "border-emerald-500 bg-emerald-500"
                                                : isAdmin
                                                  ? "border-muted-foreground/30 hover:border-emerald-400 cursor-pointer"
                                                  : "border-muted-foreground/20 cursor-default",
                                              isToggling && "opacity-50"
                                            )}
                                          >
                                            {paidMonth && <div className="w-2 h-2 rounded-full bg-white" />}
                                          </button>
                                          {/* Neplaćeno radio */}
                                          <button
                                            onClick={() => isAdmin && paidMonth && handleToggle(player.user_id, month)}
                                            disabled={isToggling || !isAdmin || !paidMonth || isFuture}
                                            className={cn(
                                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                              !paidMonth && !isFuture
                                                ? "border-rose-400 bg-rose-400"
                                                : isAdmin && !isFuture
                                                  ? "border-muted-foreground/30 hover:border-rose-400 cursor-pointer"
                                                  : "border-muted-foreground/15 cursor-default",
                                              isToggling && "opacity-50"
                                            )}
                                          >
                                            {!paidMonth && !isFuture && <div className="w-2 h-2 rounded-full bg-white" />}
                                          </button>
                                        </div>
                                      }
                                    />
                                    <TooltipContent side="top" className="text-xs">
                                      {FULL_MONTHS[month - 1]}: {paidMonth ? "✓ Plaćeno" : "✗ Nije plaćeno"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              );
                            })}

                            <TableCell className="text-center">
                              <Badge
                                className={cn(
                                  "text-white text-xs font-bold border-0",
                                  paidCount === 12
                                    ? "bg-emerald-600"
                                    : paidCount >= 6
                                    ? "bg-amber-600"
                                    : "bg-red-600"
                                )}
                              >
                                {paidCount}/12
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
