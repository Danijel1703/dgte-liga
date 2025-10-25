import { Person, Phone, AdminPanelSettings } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { supabase } from "../utils/supabase";
import { normalizeCroatianChars } from "./ProfilePage";
import { useUsers } from "../providers/UsersProvider";
import { useAuth } from "../providers/AuthProvider";

export default function AddPlayer() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh, users } = useUsers();
  const { user } = useAuth();
  const currentUser = users.find((u) => u.user_id === user?.id);

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const fullName =
        formData.firstName.toLowerCase() +
        "." +
        formData.lastName.toLowerCase();

      const email = fullName + "@" + fullName + ".com";
      const password =
        formData.firstName.toLowerCase() +
        formData.lastName.toLowerCase() +
        "123";

      const { data: currentSession } = await supabase.auth.getSession();

      // Create user in Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizeCroatianChars(email),
        password: password,
        options: {
          emailRedirectTo: undefined, // Disable automatic login
        },
      });

      supabase.auth.setSession(currentSession.session!);

      if (authError) {
        throw authError;
      }

      const userId = data.user?.id;
      if (userId) {
        // Insert user into user table
        await supabase.from("user").insert({
          user_id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: normalizeCroatianChars(email),
          phone: formData.phoneNumber,
        });

        setSuccess(
          `Igrač ${formData.firstName} ${formData.lastName} je uspješno dodan!`
        );
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
        });
        await refresh();
      }
    } catch (error: any) {
      console.error("Error adding player:", error);
      setError(error.message || "Greška pri dodavanju igrača");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.is_admin) return null;

  return (
    <Container component="main" maxWidth="sm">
      <Box className="min-h-screen flex flex-col justify-center items-center py-8">
        <Card className="w-full">
          <CardContent className="p-8!">
            <Box className="text-center mb-5">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <AdminPanelSettings sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                  DGTE - LIGA
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Dodavanje novog igrača
              </Typography>
            </Box>

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

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="Ime"
                  name="firstName"
                  placeholder="Ime"
                  autoComplete="given-name"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleInputChange("firstName")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Prezime"
                  placeholder="Prezime"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleInputChange("lastName")}
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
                margin="normal"
                required
                fullWidth
                id="phoneNumber"
                label="Broj telefona"
                placeholder="Broj telefona"
                name="phoneNumber"
                autoComplete="tel"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange("phoneNumber")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? "Dodavanje u tijeku..." : "Dodaj igrača"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
