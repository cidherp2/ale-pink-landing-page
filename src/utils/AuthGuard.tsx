import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "./ClientSupabase";

const AuthGuard = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error("Error fetching user session:", error);
        setAuthenticated(false);
      } else {
        setAuthenticated(Boolean(data.session?.user));
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthGuard;
