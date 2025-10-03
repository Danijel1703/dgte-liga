import { useLocation, useNavigate } from "react-router";
import { supabase } from "../utils/supabase";

export default function Redirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectToLogin = () => {
    if (
      !location.pathname.includes("login") &&
      !location.pathname.includes("register")
    ) {
      navigate("/login");
    }
  };

  supabase.auth.onAuthStateChange((e, session) => {
    if (e !== "SIGNED_IN" && !session) return redirectToLogin();
    if (location.pathname.includes("login")) navigate("/");
  });

  return <></>;
}
