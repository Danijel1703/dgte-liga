import { type ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import { useUsers } from "../providers/UsersProvider";
import PaymentReminderModal from "../components/PaymentReminderModal";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname.includes("login") || location.pathname.includes("register");

  const { user } = useAuth();
  const { users } = useUsers();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user && users.length > 0) {
      const currentUser = users.find((u) => u.user_id === user.id);
      if (currentUser) {
        const shouldShow = !currentUser.paid && !currentUser.is_viewer;
        if (shouldShow) {
          if (!dismissed && !showPaymentModal) setShowPaymentModal(true);
        } else {
          setShowPaymentModal(false);
          if (dismissed) setDismissed(false);
        }
      }
    }
  }, [user, users, dismissed, showPaymentModal]);

  return (
    <>
      <div
        className={
          isAuthPage
            ? "w-full min-h-screen"
            : "md:ml-60 pt-14 md:pt-0 min-h-screen"
        }
      >
        {isAuthPage ? children : <div className="py-8 px-4">{children}</div>}
      </div>
      <PaymentReminderModal
        open={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setDismissed(true);
        }}
      />
    </>
  );
}
