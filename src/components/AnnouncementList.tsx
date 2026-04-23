import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import type { TAnnouncement } from "../types.d";

interface AnnouncementListProps {
  announcements: TAnnouncement[];
  loading: boolean;
  deleteAnnouncement: (id: string) => Promise<void>;
  isAdmin?: boolean;
}

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: hr });
  } catch {
    return dateString;
  }
};

export default function AnnouncementList({
  announcements,
  loading,
  deleteAnnouncement,
  isAdmin = false,
}: AnnouncementListProps) {
  const handleDelete = async (id: string) => {
    if (window.confirm("Jeste li sigurni da želite obrisati ovu obavjest?")) {
      try {
        await deleteAnnouncement(id);
      } catch {
        alert("Greška pri brisanju obavjesti");
      }
    }
  };

  if (loading) return <Spinner />;

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Nema obavjesti za prikaz
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Obavjesti</h2>
      {announcements.map((announcement: TAnnouncement) => (
        <Card
          key={announcement.id}
          className="relative border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="py-4 px-5 pr-12">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
              {announcement.text}
            </p>
            {announcement.created_at && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatDate(announcement.created_at)}
              </p>
            )}
          </CardContent>
          {isAdmin && (
            <button
              onClick={() => handleDelete(announcement.id!)}
              className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Obriši"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}
