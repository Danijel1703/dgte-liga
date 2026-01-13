import { useMediaQuery } from "@mui/material";
import theme from "../theme";
import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import { useUsers } from "../providers/UsersProvider";
import PaymentReminderModal from "../components/PaymentReminderModal";

export default function Layout({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const isAuthPage =
    location.pathname.includes("login") ||
    location.pathname.includes("register");

  const { user } = useAuth();
  const { users } = useUsers();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (user && users.length > 0) {
      const currentUser = users.find((u) => u.user_id === user.id);
      if (currentUser && !currentUser.paid && !currentUser.is_viewer) {
        setShowPaymentModal(true);
      }
    }
  }, [user, users]);

  return (
    <>
      <div
        style={{
          width: isMobile || isAuthPage ? "100%" : "calc(100% - 240px)",
          marginLeft: isMobile || isAuthPage ? "0" : "240px",
        }}
        className="flex justify-center items-center my-10"
      >
        {children}
      </div>
      <PaymentReminderModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </>
  );
}
