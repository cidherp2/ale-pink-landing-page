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
import { useNavigate } from "react-router-dom";
import Navbar from "./utils/Navbar";

const AppRoutes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authUser,setAuthUser] = useState<boolean>(false)
  const nav = useNavigate();

  const getUserIdFromAuthId = async (authId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", authId)
      .single();

    if (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
    console.log("Fetched user ID:", data?.id);
    setUserId(data?.id || null);

    return data?.id || null;
  };

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
    localStorage.setItem("username",data?.username)

    return data?.username || null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
       if (data){
      setUser(data.session?.user ?? null);
      if (data.session){
        setAuthUser(true)
      }
      
       }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if(session){
        setUser(session?.user ?? null);
        getUsernameFromAUthId(session?.user?.id ?? "");
        getUserIdFromAuthId(session?.user?.id ?? "")
        }
        if (!session){
          setAuthUser(false)
        }
        
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [nav]);

  useEffect(() => {
    if(authUser && window.location.pathname === "/login"){
      nav("/alexpink/songs");
    }

  },[authUser])

useEffect(() => {
  const root = document.querySelector<HTMLDivElement>("#root");
  if (!authUser) {
    
    if (root) {
      root.style.marginTop = "0";
    }
   
  }
   else {
      if (root) {
      root.style.marginTop = "64px";
    }
    }
}, [authUser]);
  return (
    <>
    {authUser &&
    <Navbar>

    </Navbar>
}

    <Routes>
      <Route
        path="alexpink/songs/:id"
        element={<LandingPageContainer />} />
      <Route path="profile/:username" element={<Profile />} />
      <Route path="login" element={<Login />} />
      <Route element={<AuthGuard />}>
        <Route
          path="addsong"
          element={<AddSong username={username ?? ""} userId={userId ?? ""} />} />

        <Route
          path="alexpink/songs"
          element={<SongsLinkTreeMenu
            usrname={username ?? ""}
            userId={user?.id ?? ""} />} />
      </Route>
    </Routes></>
  );
};
export default AppRoutes;
