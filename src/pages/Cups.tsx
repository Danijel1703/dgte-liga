import { Plus, Trophy, Users, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import CupModal from "../components/CupModal";
import { useAuth } from "../providers/AuthProvider";
import { useLoader } from "../providers/Loader";
import { useUsers } from "../providers/UsersProvider";
import type { TCup } from "../types";
import { supabase } from "../utils/supabase";
import { formatCupDate, CUP_STATUS_BADGE } from "../utils/cupDisplay";

type TCupListItem = TCup & { participantCount: number };

function SkeletonCupCard() {
  return (
    <Card className="shadow-sm overflow-hidden py-0">
      <div className="h-1 bg-muted" />
      <CardContent className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse w-40" />
        <div className="h-4 bg-muted rounded animate-pulse w-28" />
      </CardContent>
    </Card>
  );
}

export default function Cups() {
  const [cups, setCups] = useState<TCupListItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const { users: players } = useUsers();
  const { user } = useAuth();
  const { setLoading } = useLoader();
  const navigate = useNavigate();

  const isAdmin = !!players.find((p) => p.user_id === user?.id)?.is_admin;

  const initialize = async () => {
    setLoading(true);
    setDataLoading(true);

    const { data, error } = await supabase
      .from("cup")
      .select("*, cup_group (id, is_deleted, cup_group_member (user_id, is_deleted))")
      .eq("is_deleted", false)
      .order("played_on", { ascending: false, nullsFirst: false });

    if (error) {
      toast.error("Greška pri učitavanju kupova.");
    } else {
      type TRow = TCup & {
        cup_group?: Array<{
          is_deleted: boolean;
          cup_group_member?: Array<{ user_id: string; is_deleted: boolean }>;
        }>;
      };
      setCups(
        ((data ?? []) as TRow[]).map((cup) => {
          const userIds = new Set<string>();
          for (const group of cup.cup_group ?? []) {
            if (group.is_deleted) continue;
            for (const member of group.cup_group_member ?? []) {
              if (!member.is_deleted) userIds.add(member.user_id);
            }
          }
          return { ...cup, participantCount: userIds.size };
        })
      );
    }

    setLoading(false);
    setDataLoading(false);
  };

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCupCreate = async (name: string, playedOn: string | null) => {
    const { data, error } = await supabase
      .from("cup")
      .insert({ name, played_on: playedOn })
      .select("id")
      .single();

    if (error) {
      toast.error("Kup nije kreiran.");
      return;
    }
    toast.success("Kup je kreiran.");
    navigate(`/kup/${data.id}`);
  };

  return (
    <>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kupovi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Turniri sa skupinama i eliminacijskom fazom
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Kreiraj kup
            </Button>
          )}
        </div>

        {dataLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <SkeletonCupCard key={i} />
            ))}
          </div>
        ) : cups.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Nema kupova"
            description="Kupovi će se prikazati kada ih administrator kreira."
            action={
              isAdmin ? (
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Kreiraj kup
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cups.map((cup) => {
              const badge = CUP_STATUS_BADGE[cup.status];
              return (
                <Card
                  key={cup.id}
                  onClick={() => navigate(`/kup/${cup.id}`)}
                  className="shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden py-0 cursor-pointer"
                >
                  <div className="h-1 bg-primary" />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-base truncate">{cup.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCupDate(cup.played_on)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className={`text-xs border-0 ${badge.className}`}>
                        {badge.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {cup.participantCount} sudionika
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {createOpen && (
        <CupModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSave={onCupCreate}
        />
      )}
    </>
  );
}
