import { Phone, ShieldCheck, User, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useState } from "react";
import { supabase } from "../utils/supabase";
import { normalizeCroatianChars } from "./ProfilePage";
import { useUsers } from "../providers/UsersProvider";
import { useAuth } from "../providers/AuthProvider";

export default function AddPlayer() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh, users } = useUsers();
  const { user } = useAuth();
  const currentUser = users.find((u) => u.user_id === user?.id);

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      setError(""); setSuccess("");

      const fullName = formData.firstName.toLowerCase() + "." + formData.lastName.toLowerCase();
      const email = fullName + "@" + fullName + ".com";
      const password = formData.firstName.toLowerCase() + formData.lastName.toLowerCase() + "123";

      const { data: currentSession } = await supabase.auth.getSession();

      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizeCroatianChars(email),
        password,
        options: { emailRedirectTo: undefined },
      });

      supabase.auth.setSession(currentSession.session!);

      if (authError) throw authError;

      const userId = data.user?.id;
      if (userId) {
        await supabase.from("user").insert({
          user_id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: normalizeCroatianChars(email),
          phone: formData.phoneNumber,
        });
        setSuccess(`Igrač ${formData.firstName} ${formData.lastName} je uspješno dodan!`);
        setFormData({ firstName: "", lastName: "", phoneNumber: "" });
        await refresh();
      }
    } catch (err: any) {
      setError(err.message || "Greška pri dodavanju igrača");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.is_admin) return null;

  return (
    <div className="container max-w-lg mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dodaj igrača</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Samo admini
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="add-first-name">Ime</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="add-first-name"
                    className="pl-9"
                    placeholder="Ime"
                    autoFocus
                    required
                    value={formData.firstName}
                    onChange={handleInputChange("firstName")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-last-name">Prezime</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="add-last-name"
                    className="pl-9"
                    placeholder="Prezime"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange("lastName")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-phone">Broj telefona</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="add-phone"
                  className="pl-9"
                  placeholder="npr. +385..."
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange("phoneNumber")}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Dodavanje u tijeku..." : "Dodaj igrača"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
