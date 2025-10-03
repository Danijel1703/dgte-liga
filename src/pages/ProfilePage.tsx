import { Cancel, Person, Phone, Save } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  InputAdornment,
  TextField,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useUsers } from "../providers/UsersProvider";
import type { TUser } from "../types";
import { supabase } from "../utils/supabase";

export function normalizeCroatianChars(text: string): string {
  if (!text) {
    return "";
  }

  // Step 1: Handle Digraphs (DŽ, LJ, NJ) first.
  let normalizedText = text;

  normalizedText = normalizedText
    .replace(/DŽ/g, "DZ")
    .replace(/Dž/g, "Dz")
    .replace(/dž/g, "dz")
    .replace(/LJ/g, "LJ")
    .replace(/Lj/g, "Lj")
    .replace(/lj/g, "lj")
    .replace(/NJ/g, "NJ")
    .replace(/Nj/g, "Nj")
    .replace(/nj/g, "nj");

  // Step 2: Handle single-character diacritics (Č, Ć, Š, Ž, Đ)
  const singleCharMap: { [key: string]: string } = {
    Č: "C",
    č: "c",
    Ć: "C",
    ć: "c",
    Š: "S",
    š: "s",
    Ž: "Z",
    ž: "z",
    Đ: "D",
    đ: "d",
  };

  const charRegex = /[ČčĆćŠšŽžĐđ]/g;
  normalizedText = normalizedText.replace(charRegex, (match: string) => {
    return singleCharMap[match];
  });

  return normalizedText;
}

export default function ProfilePage() {
  const { users, refresh } = useUsers();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<TUser | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<TUser>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange =
    (field: keyof TUser) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedProfile((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSaveProfile = async () => {
    if (!profile || !authUser) return;

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const newPassword =
        (editedProfile.first_name || profile.first_name).toLowerCase() +
        (editedProfile.last_name || profile.last_name).toLowerCase() +
        "123";

      await supabase.auth.updateUser({
        password: newPassword,
      });

      await supabase
        .from("user")
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
        })
        .eq("user_id", profile.user_id);

      setSuccess("Profil je uspešno ažuriran!");
    } catch (error) {
      console.log(error);
      setError("Greška pri ažuriranju profila. Pokušajte ponovo.");
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
    setError("");
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

  if (!profile) return;

  return (
    <Container component="main" maxWidth="md">
      <Box className="min-h-screen py-8">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {/* Profile Information Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <Box className="flex flex-col md:flex-row gap-6">
              {/* Profile Form */}
              <Box className="flex-1">
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Ime"
                    value={editedProfile.first_name || ""}
                    onChange={handleInputChange("first_name")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Prezime"
                    value={editedProfile.last_name || ""}
                    onChange={handleInputChange("last_name")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Broj telefona"
                  value={editedProfile.phone || ""}
                  onChange={handleInputChange("phone")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box className="flex gap-2 mt-4">
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? "Čuvanje..." : "Sačuvaj"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Otkaži
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>{" "}
      </Box>
    </Container>
  );
}
