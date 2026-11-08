import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import LandingPageContainer from "./Landing-page-container";
import AddSong from "./AddSong";
import SongsLinkTreeMenu from "./SongsMenu";
import Login from "./Login";
import AuthGuard from "./utils/AuthGuard";
import { supabase } from "./utils/ClientSupabase";
import Profile from "./Profile";
import Analytics from "./Analytics";
import Feed from "./Feed";
import Register from "./Register";
import Navbar from "./utils/Navbar";

type ProfileResult = {
  authId: string;
  profile: { id: string; username: string } | null;
  error: string | null;
};

const AppRoutes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const authId = user?.id;
  useEffect(() => {
    if (!authId) return;
    let active = true;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("auth_id", authId)
        .maybeSingle();
      if (!active) return;
      if (error) console.error("Error fetching profile:", error);
      setProfileResult({
        authId,
        profile: data,
        error: error
          ? "No se pudo cargar tu perfil. Intenta de nuevo."
          : data
            ? null
            : "Tu cuenta no tiene un perfil asociado. Contacta al administrador.",
      });
    };
    void loadProfile();
    return () => {
      active = false;
    };
  }, [authId]);

  useEffect(() => {
    const root = document.querySelector<HTMLDivElement>("#root");
    if (root) root.style.marginTop = user ? "64px" : "0";
  }, [user]);

  const currentProfile =
    authId && profileResult?.authId === authId ? profileResult : null;
  const authenticated = Boolean(user);
  const redirect = authLoading ? (
    <div>Cargando...</div>
  ) : (
    <Navigate to={authenticated ? "/songs" : "/login"} replace />
  );
  const profileContent = (render: (profile: NonNullable<ProfileResult["profile"]>) => ReactNode) => {
    if (!currentProfile) return <div>Cargando perfil...</div>;
    if (currentProfile.error || !currentProfile.profile) {
      return <div role="alert">{currentProfile.error}</div>;
    }
    return render(currentProfile.profile);
  };

  return (
    <>
      {user && <Navbar username={currentProfile?.profile?.username ?? null} />}
      <Routes>
        <Route path="/" element={redirect} />
        <Route path="alexpink/songs/:id" element={<LandingPageContainer />} />
        <Route path="u/:username/songs/:id" element={<LandingPageContainer />} />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="login" element={authLoading || authenticated ? redirect : <Login />} />
        <Route path="register" element={authLoading || authenticated ? redirect : <Register />} />
        <Route path="feed" element={<Feed />} />
        <Route element={<AuthGuard authenticated={authenticated} loading={authLoading} />}>
          <Route
            path="addsong"
            element={profileContent((profile) => (
              <AddSong key={authId} username={profile.username} userId={profile.id} />
            ))}
          />
          <Route
            path="songs"
            element={profileContent((profile) => (
              <SongsLinkTreeMenu key={authId} userId={profile.id} username={profile.username} />
            ))}
          />
          <Route path="alexpink/songs" element={<Navigate to="/songs" replace />} />
          <Route
            path="analytics"
            element={profileContent((profile) => (
              <Analytics key={authId} profileId={profile.id} />
            ))}
          />
        </Route>
        <Route path="*" element={redirect} />
      </Routes>
    </>
  );
};

export default AppRoutes;
