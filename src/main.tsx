import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
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
import "dayjs/locale/hr";
import { Rankings } from "./pages/Rankings.tsx";
import { Loader } from "./providers/Loader.tsx";
import Home from "./pages/Home.tsx";
import { AuthProvider } from "./providers/AuthProvider.tsx";
import Rules from "./pages/Rules.tsx";
import Payment from "./pages/Payment.tsx";
import Membership from "./pages/Membership.tsx";
import MatchHistory from "./pages/MatchHistory.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Loader>
      <BrowserRouter>
        <UsersProvider>
          <AuthProvider>
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
                <Route path="clanarine" element={<Membership />} />
                <Route path="match-history" element={<MatchHistory />} />
                <Route path="/" element={<Home />} />
              </Routes>
            </Layout>
            <Redirect />
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </UsersProvider>
      </BrowserRouter>
    </Loader>
  </StrictMode>
);
