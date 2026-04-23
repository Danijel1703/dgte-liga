import { Plus, Trophy, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "../providers/AuthProvider";
import { useMemo, useState } from "react";
import { useUsers } from "../providers/UsersProvider";
import { useAnnouncements } from "../hooks/useAnnouncements";
import AddAnnouncementModal from "../components/AddAnnouncementModal";
import AnnouncementList from "../components/AnnouncementList";

export default function Home() {
  const { user } = useAuth();
  const { users } = useUsers();
  const [addAnnouncementOpen, setAddAnnouncementOpen] = useState(false);
  const { announcements, loading, deleteAnnouncement, refresh } = useAnnouncements();

  const currentUser = useMemo(
    () => users.find((u) => u.user_id === user?.id),
    [user, users]
  );
  const isAdmin = currentUser?.is_admin;
  const activePlayers = users.filter((u) => !u.is_deleted && !u.is_viewer).length;
  const month = new Date().toLocaleString("hr-HR", { month: "long" });
  const capitalMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dobrodošli{currentUser ? `, ${currentUser.first_name}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {capitalMonth} {year} · {activePlayers} aktivnih igrača
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary">
            🎾 DGTE Liga
          </div>
        </div>

        {/* Announcements header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Obavjesti</h2>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setAddAnnouncementOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova obavjest
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-sm py-0">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <Card className="border-dashed shadow-none py-0">
            <CardContent className="py-14 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Nema obavjesti</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Nove obavjesti će se ovdje prikazati
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AnnouncementList
            announcements={announcements}
            loading={false}
            deleteAnnouncement={deleteAnnouncement}
            isAdmin={isAdmin}
          />
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">DGTE - Liga</span>
          </div>
          <p className="text-xs">Tenis liga za sve razine igrača · Sezona {year}</p>
        </div>
      </div>

      <AddAnnouncementModal
        open={addAnnouncementOpen}
        onClose={() => setAddAnnouncementOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
