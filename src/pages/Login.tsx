import { Box, Container } from "@mui/material";
import LoginCard from "../components/auth/LoginCard";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  return (
    <Container component="main" maxWidth="sm">
      <Box className="min-h-screen flex flex-col justify-center items-center py-8">
        <LoginCard title="DGTE - LIGA" subtitle="Prijavite se za nastavak">
          <LoginForm />
        </LoginCard>
      </Box>
    </Container>
  );
}
