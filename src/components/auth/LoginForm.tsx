import { Person } from "@mui/icons-material";
import { Alert, Box, Button, InputAdornment, TextField } from "@mui/material";
import React, { useState } from "react";
import { supabase } from "../../utils/supabase";
import { normalizeCroatianChars } from "../../utils/stringUtils";
import type { TUser } from "../../types.d";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
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

  // Load users on component mount
  React.useEffect(() => {
    getUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = users.find(
      (t) => t.first_name.toLowerCase() + t.last_name.toLowerCase() === username
    );

    if (!user) {
      setError("Korisničko ime netočno, molim vas pokušajte opet.");
      setLoading(false);
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
    } else {
      onSuccess?.();
    }
    setLoading(false);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
        onChange={handleUsernameChange}
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
  );
}
