import { Phone, Save, X, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useUsers } from "../providers/UsersProvider";
import type { TUser } from "../types";
import { supabase } from "../utils/supabase";
import { normalizeCroatianChars } from "../utils/strings";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { toast } from "sonner";

export { normalizeCroatianChars };

export default function ProfilePage() {
  const { users, refresh } = useUsers();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<TUser | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<TUser>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange =
    (field: keyof TUser) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedProfile((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSaveProfile = async () => {
    if (!profile || !authUser) return;
    try {
      setLoading(true);
      const newPassword =
        (editedProfile.first_name || profile.first_name).toLowerCase() +
        (editedProfile.last_name || profile.last_name).toLowerCase() +
        "123";
      await supabase.auth.updateUser({ password: newPassword });
      await supabase
        .from("user")
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
        })
        .eq("user_id", profile.user_id);
      toast.success("Profil je uspješno ažuriran!");
    } catch {
      toast.error("Greška pri ažuriranju profila. Pokušajte ponovo.");
    } finally {
      await refresh();
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditedProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
      });
    }
  };

  useEffect(() => {
    if (authUser && users.length > 0) {
      const userProfile = users.find((u) => u.user_id === authUser.id);
      if (userProfile) {
        setProfile(userProfile);
        setEditedProfile({
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          phone: userProfile.phone,
        });
      }
    }
  }, [users, authUser]);

  if (!profile) return null;

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Identity header — no dark banner, just the data */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <PlayerAvatar
            firstName={profile.first_name}
            lastName={profile.last_name}
            size="lg"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">
              {profile.first_name} {profile.last_name}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {profile.is_admin && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                  style={{
                    background: "oklch(0.448 0.119 150 / 0.12)",
                    color: "oklch(0.35 0.10 150)",
                  }}
                >
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{
                  background: profile.paid
                    ? "oklch(0.44 0.12 155 / 0.12)"
                    : "oklch(0.55 0.20 27 / 0.12)",
                  color: profile.paid
                    ? "oklch(0.35 0.10 155)"
                    : "oklch(0.45 0.18 27)",
                }}
              >
                {profile.paid ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {profile.paid ? "Članarina plaćena" : "Članarina nije plaćena"}
              </span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <Card className="shadow-sm border-border/60 py-0">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-5">
              Uredi profil
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Ime</Label>
                  <Input
                    id="first-name"
                    value={editedProfile.first_name || ""}
                    onChange={handleInputChange("first_name")}
                    placeholder="Ime"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Prezime</Label>
                  <Input
                    id="last-name"
                    value={editedProfile.last_name || ""}
                    onChange={handleInputChange("last_name")}
                    placeholder="Prezime"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Broj telefona</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-9"
                    value={editedProfile.phone || ""}
                    onChange={handleInputChange("phone")}
                    placeholder="npr. +385..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Otkaži
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Čuvanje..." : "Sačuvaj promjene"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
