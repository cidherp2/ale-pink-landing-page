import { Link } from "react-router-dom";
import styled from "styled-components";
import type { Tables } from "./supabase/Database";
import { useEffect, useState } from "react";
import { supabase } from "./utils/ClientSupabase";
import AddSongButton from "./utils/AddButton";
import { useNavigate } from "react-router-dom";
import { ProfileButton } from "./utils/AddButton";

export const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #0d6649, #0f3d2e);
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

export const Card = styled.div`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Header = styled.div`
  text-align: center;
  color: #e6f4ef;
`;

export const Title = styled.h1`
  font-size: clamp(1.6rem, 5vw, 2rem);
  margin-bottom: 6px;
`;

export const Subtitle = styled.p`
  font-size: 0.95rem;
  opacity: 0.85;
`;

export const SongsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const SongCard = styled(Link)`
  background: #9ad18b;
  color: #0f3d2e;
  text-decoration: none;

  padding: 16px 18px;
  border-radius: 16px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  font-weight: 600;
  font-size: 1rem;

  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: translateY(3px);
    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.18);
  }
`;

export const Arrow = styled.span`
  font-size: 1.2rem;
`;

type Song = Tables<"songs">;

type SongMenuProps = {
  userId: string;
  usrname:string
};
const SongsLinkTreeMenu = (props: SongMenuProps) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const navigate = useNavigate();

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
    return data?.id || null;
  }

  const fetchSongs = async () => {
    try {
      if (!props.userId) {
        navigate("/login");
        return;
      }
      const userId = await getUserIdFromAuthId(props.userId);
      if (!userId) {
        navigate("/login");
        return;
      }
      const { data } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data){
        setSongs(data);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  useEffect(() => {
  fetchSongs()

  }, []);

  return (
    <Page>
      <Card>
        <Header>
          <Title>Todas mis canciones</Title>
          <Subtitle>Todos mis lanzamientos en un solo lugar</Subtitle>
        </Header>

        <SongsList>
          {songs.map((song) => (
            <SongCard key={song.id} to={`/alexpink/songs/${song.id}`}>
              {song.title}
              <Arrow>→</Arrow>
            </SongCard>
          ))}
        </SongsList>
      </Card>
      <div style={{display:"flex", gap:"1rem"}}>
      <ProfileButton
      username={props.usrname}
      ></ProfileButton>
      
      <AddSongButton></AddSongButton>
      </div>
    </Page>
  );
};

export default SongsLinkTreeMenu;
