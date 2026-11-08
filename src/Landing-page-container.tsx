import styled from "styled-components";
import LinkButtons from "./utils/Link-buttons";
import { useEffect, useState } from "react";
import { supabase } from "./utils/ClientSupabase";
import { type Database, type Tables } from "./supabase/Database";
import { useParams } from "react-router-dom";
import CoverImage from "./CoverImage";
import { isLegacyPixelOwner, loadLegacyPixels } from "./utils/legacyPixels";

type StreamingPlatform = Database["public"]["Enums"]["streaming_platform"];


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
  const { id, username } = useParams();
  const routeKey = JSON.stringify([id, username]);
  const [result, setResult] = useState<{
    routeKey: string;
    songs: SongWithLinks[];
    error: string | null;
  } | null>(null);
  const current = result?.routeKey === routeKey ? result : null;
  const songs = current?.songs ?? [];
  const loadError = current?.error ?? null;
  const ownerId = songs[0]?.user_id;
  const [marketingReady, setMarketingReady] = useState(false);

  useEffect(() => {
    if (!isLegacyPixelOwner(ownerId)) return;
    let active = true;
    loadLegacyPixels().then(
      () => { if (active) setMarketingReady(true); },
      (error: unknown) => console.error("Error loading marketing pixels:", error),
    );
    return () => { active = false; };
  }, [ownerId]);

   const trackAdClick = async (platformClick:StreamingPlatform,songId:string) => {
    try {
      const { error } = await supabase
        .from("ad_clicks")
        .insert([
          {
          platform_click: platformClick,
          song_id: songId,
          },
        ]);
        
      if (error) {
        console.error("Error tracking ad click:", error);
      }
    } catch (error) {
      console.error("Error in trackAdClick:", error);
    }
  };
  
 

  useEffect(() => {
    let active = true;
    const fetchSong = async () => {
      if (!id) return;
      let ownerId: string | undefined;
      if (username) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .maybeSingle();
        if (!active) return;
        if (error || !data) {
          if (error) console.error("Error fetching landing owner:", error);
          setResult({
            routeKey,
            songs: [],
            error: error ? "No se pudo cargar la landing." : "Landing no encontrada.",
          });
          return;
        }
        ownerId = data.id;
      }
      let query = supabase.from("songs").select("*, song_links(*)").eq("id", id);
      if (ownerId) query = query.eq("user_id", ownerId);
      const { data, error } = await query;
      if (!active) return;
      if (error) {
        console.error("Error fetching landing:", error);
        setResult({ routeKey, songs: [], error: "No se pudo cargar la landing." });
      } else {
        setResult({
          routeKey,
          songs: data,
          error: data.length ? null : "Landing no encontrada.",
        });
      }
    };
    void fetchSong();
    return () => { active = false; };
  }, [id, username, routeKey]);

  return (
    <div style={{ width: "100%" }}>
      <Container
      className="LandingContainerUnique"
      >
        {loadError && <p role="alert" style={{ color: "#e6f4ef" }}>{loadError}</p>}
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
              key={link.id}
              songLink={link.url}
              platform={link.platform}
              songTitle={songs[0].title}
              coverUrl={songs[0].cover_url!}
              songId={link.song_id}
              artist={songs[0]?.artist}
              triggerAd={() => trackAdClick(link.platform, link.song_id)}
              marketingEnabled={isLegacyPixelOwner(ownerId) && marketingReady}
            ></LinkButtons>
          );
        })}
      </Container>
    </div>
  );
};

export default LandingPageContainer;
