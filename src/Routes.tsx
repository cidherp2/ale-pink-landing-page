import { Routes, Route } from "react-router-dom";
import LandingPageContainer from "./Landing-page-container";
import AddSong from "./AddSong";
import SongsLinkTreeMenu from "./SongsMenu";
import Login from "./Login";
import AuthGuard from "./utils/AuthGuard";
import { supabase } from "./utils/ClientSupabase";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Profile from "./Profile";

const AppRoutes = () => {
    
 
  

  const [user,setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const getUsernameFromAUthId = async (authId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("auth_id", authId)
    .single();

  if (error) {
    console.error("Error fetching username:", error);
    return null;
  }
  console.log("Fetched username:", data?.username);
  setUsername(data?.username || null);

  return data?.username || null;
}

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
        getUsernameFromAUthId(session?.user?.id ?? '');
      }
    );
  return () => {
    listener.subscription.unsubscribe();
  };
  
}, []);






  return (
    <Routes>
      <Route path="alexpink/songs/:id" element={<LandingPageContainer />} />
      <Route path="profile/:username" element={<Profile
        />} />
      <Route path="login" element={<Login />} />
      <Route element={<AuthGuard />}>
        <Route path="addsong" element={<AddSong />} />

        <Route
          path="alexpink/songs"
          element={<SongsLinkTreeMenu
            usrname={username ?? ''}
            userId={user?.id ?? ''} />}
        />
      </Route>
    </Routes>
  );
};
export default AppRoutes;
