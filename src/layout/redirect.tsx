import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { supabase } from "../utils/supabase";

export default function Redirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectToLogin = () => {
      if (
        !location.pathname.includes("login") &&
        !location.pathname.includes("register")
      ) {
        navigate("/login");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, session) => {
      if (e !== "SIGNED_IN" && !session) return redirectToLogin();
      if (location.pathname.includes("login")) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate]);

  return <></>;
}
