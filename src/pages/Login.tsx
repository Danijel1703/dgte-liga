import { Person } from "@mui/icons-material";
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
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type { TUser } from "../types";
import { normalizeCroatianChars } from "./Register";

export default function Login() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TUser[]>([]);

  const getUsers = async () => {
    const { data } = await supabase.from("user").select("*");

    if (data) {
      setUsers(data);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // We are just trying to have some way of user management, meaning that each user
    // has it's profile but is not bothered with the whole registration flow

    const user = users.find(
      (t) => t.first_name.toLowerCase() + t.last_name.toLowerCase() === username
    );

    if (!user) {
      setError("Korisničko ime netočno, molim vas pokušajte opet.");
      return;
    }

    const email = user.email;
    const password = username + "123";
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeCroatianChars(email),
      password,
    });

    if (error) {
      setError("Korisničko ime netočno, molim vas pokušajte opet.");
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box className="min-h-screen flex flex-col justify-center items-center py-8">
        <Card className="w-full">
          <CardContent className="p-8!">
            <Box className="text-center mb-5">
              <Typography variant="h4" component="h1" gutterBottom>
                DGTE - LIGA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prijavite se za nastavak
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Korisničko ime"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2 }}
                disabled={loading}
              >
                {loading ? "Prijava u tijeku..." : "Prijavi se"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
