import styled from "styled-components";
import LinkButtons from "./utils/Link-buttons";
import { useEffect, useState } from "react";
import { supabase } from "./utils/ClientSupabase";
import { type Tables } from "./supabase/Database";
import { useParams } from "react-router-dom";
import CoverImage from "./CoverImage";

const Container = styled.div`
  width: 100%;
  background: #0d6649;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  gap: 1rem;
  @media (min-width: 1024px) {
    gap: 2rem;
    min-width: 1024px;
    max-width: 100vw;
  }
`;
const CoverImageContainer = styled.div`
  margin-top: 2rem;
  width: 200px;
  height: 200px;
  //border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
`;
type SongWithLinks = Tables<"songs"> & {
  song_links: Tables<"song_links">[];
};

const LandingPageContainer = () => {
  const [songs, setSongs] = useState<SongWithLinks[]>([]);

  //const songIdParam = urlParams.get('myParam');
  const { id } = useParams();

  const fetchSongs = async (songId: string) => {
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("* ,song_links(*)")
        .eq("id", songId);

      if (error) {
        console.log("Error fetching songs: ", error);
      }
      if (data) {
        console.log("Fetched songs: ", data);
        setSongs(data);
      
      }
    } catch (error) {
      console.log("Error fetching songs ", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSongs(id);
    }
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <Container
      className="LandingContainerUnique"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CoverImageContainer>
            {/* {coverUrl && (
              <img
                loading="lazy"
                src={coverUrl}
                alt="Cover Image"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )} */}
            
            <CoverImage src={songs[0]?.cover_url} />
        
            
      </CoverImageContainer>
          <h2 style={{ color: "#e6f4ef" }}> {songs[0]?.title}</h2>
          <p style={{ color: "#e6f4ef", marginTop: "-10px" }}>
            {songs[0]?.artist}
          </p>
        </div>
        {songs[0]?.song_links.map((link) => {
          return (
            <LinkButtons
              songLink={link.url}
              platform={link.platform}
              songTitle={songs[0].title}
              coverUrl={songs[0].cover_url!}
              songId={link.song_id}
              artist={songs[0]?.artist}
            ></LinkButtons>
          );
        })}
      </Container>
    </div>
  );
};

export default LandingPageContainer;
