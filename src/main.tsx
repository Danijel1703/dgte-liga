import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { hrHR } from "@mui/x-date-pickers/locales";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { WithAuth } from "./components/WithAuth.tsx";
import "./index.css";
import Layout from "./layout/layout.tsx";
import Redirect from "./layout/redirect.tsx";
import { Sidebar } from "./layout/sidebar.tsx";
import Groups from "./pages/Groups.tsx";
import Login from "./pages/Login.tsx";
import Matches from "./pages/Matches.tsx";
import Players from "./pages/Players.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import AddPlayer from "./pages/AddPlayer.tsx";
import { UsersProvider } from "./providers/UsersProvider.tsx";
import theme from "./theme.ts";
import "dayjs/locale/hr";
import { Rankings } from "./pages/Rankings.tsx";
import { Loader } from "./providers/Loader.tsx";
import Home from "./pages/Home.tsx";
import { AuthProvider } from "./providers/AuthProvider.tsx";
import Rules from "./pages/Rules.tsx";
import Payment from "./pages/Payment.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Loader>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        localeText={
          hrHR.components.MuiLocalizationProvider.defaultProps.localeText
        }
        adapterLocale="hr"
      >
        <BrowserRouter>
          <UsersProvider>
            <AuthProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <WithAuth>
                  <Sidebar />
                </WithAuth>
                <Layout>
                  <Routes>
                    <Route path="login" element={<Login />} />
                    <Route path="add-player" element={<AddPlayer />} />
                    <Route path="players" element={<Players />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="matches" element={<Matches />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="rankings" element={<Rankings />} />
                    <Route path="rules" element={<Rules />} />
                    <Route path="payment" element={<Payment />} />
                    <Route path="/" element={<Home />} />
                  </Routes>
                </Layout>
                <Redirect />
              </ThemeProvider>
            </AuthProvider>
          </UsersProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </Loader>
  </StrictMode>
);
