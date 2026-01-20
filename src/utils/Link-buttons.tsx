import styled, { keyframes } from "styled-components";
import StreamingIcon from "../StreamingIcons";
import type { Database } from "../supabase/Database";
import { FaPlay } from "react-icons/fa";
import { trackMetaEvent } from "./metaPixel";

/* =======================
   Animations
======================= */

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* =======================
   Styled Components
======================= */

export const ButtonsContainer = styled.div`
  width: 93%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-sizing: border-box;

  > * {
    opacity: 0;
    animation: ${fadeUp} 0.1s ease forwards;
  }
`;

export const LinkButton = styled.a`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 14px;

  background-color: #9ad18b;
  color: #0f3d2e;

  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;

  padding: 14px 18px;
  border-radius: 14px;
  min-height: 56px;

  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.15);

  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.2s ease;

  &:hover {
    filter: brightness(1.04);
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.15);
  }
`;

export const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg,
  img {
    width: 100%;
    height: 100%;
  }
`;

/* =======================
   Types
======================= */

type StreamingPlatform = Database["public"]["Enums"]["streaming_platform"];

interface LinkButtonsProps {
  songLink: string;
  platform: StreamingPlatform;
  songTitle: string;
  coverUrl?: string;
  songId: string;
  artist: string;
}

/* =======================
   Helpers
======================= */

const formatPlatformLabel = (platform: string) =>
  platform.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

/* =======================
   Component
======================= */

const LinkButtons = ({
  songLink,
  platform,
  songId,
  songTitle,
  artist,
}: LinkButtonsProps) => {
  return (
    <ButtonsContainer className="buttons-container">
      <LinkButton
        href={songLink}
        target="_blank"
        rel="noopener noreferrer"
        className="link-button"
        onClick={(e) => {
          e.preventDefault();

          trackMetaEvent("OutboundMusicClick", {
            artist: artist,
            song_id: songId,
            song_title: songTitle,
            platform: platform,
          });

          setTimeout(() => {
            window.open(songLink, "_blank", "noopener,noreferrer");
          }, 150);
        }}
      >
        <IconWrapper>
          <StreamingIcon platform={platform ==="youtube_music" ? "youtube" : platform} />
        </IconWrapper>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <p>{formatPlatformLabel(platform === "youtube_music" ? "youtube" : platform)}</p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <p>Reproducir</p>
            <FaPlay size={16} />
          </div>
        </div>
      </LinkButton>
    </ButtonsContainer>
  );
};

export default LinkButtons;
