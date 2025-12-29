import { useState } from "react";
import { supabase } from "./utils/ClientSupabase";
import {
  Wrapper,
  Container,
  Title,
  Input,
  SectionTitle,
  LinkRow,
  CheckboxLabel,
  Button,
  SecondaryButton,
  SelectPlatform
} from "./utils/AddSong.styles";
import type { Tables, Database } from "./supabase/Database";
import { data, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

type StreamingPlatform = Database["public"]["Enums"]["streaming_platform"];

type SongLink = {
  platform: StreamingPlatform;
  url: string;
  is_primary?: boolean;
};

export default function AddSong() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [links, setLinks] = useState<SongLink[]>([
    { platform: "\"\"", url: "", is_primary: true },
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const tipoStreamingPlatforms = [
    { value: "spotify", label: "Spotify" },
    { value: "apple_music", label: "Apple Music" },
    { value: "youtube_music", label: "YouTube Music" },
    { value: "youtube", label: "YouTube" },
    { value: "soundcloud", label: "SoundCloud" },
    { value: "amazon_music", label: "Amazon Music" },
    { value: "deezer", label: "Deezer" },
    { value: "tidal", label: "Tidal" },
    { value: "pandora", label: "Pandora" },
    { value: "audiomack", label: "Audiomack" },
    { value: "bandcamp", label: "Bandcamp" },
    { value: "napster", label: "Napster" },
    { value: "anghami", label: "Anghami" },
    { value: "boomplay", label: "Boomplay" },
    { value: "mixcloud", label: "Mixcloud" },
  ];

  const handleAddLink = () => {
    setLinks([...links, { platform: "spotify", url: "" }]);
  };

  const handleChangeLink = (
    index: number,
    field: keyof SongLink,
    value: string | boolean
  ) => {
    const updated = [...links];
    // @ts-ignore
    updated[index][field] = value;
    setLinks(updated);
  };

  const handleSubmit = async () => {
    if (!title || !artist) return alert("Title and artist required");

    setLoading(true);

    const { data: song, error: songError } = await supabase
      .from("songs")
      .insert({
        title,
        artist,
        cover_url: coverUrl,
      })
      .select()
      .single();

    if (songError) {
      console.error(songError);
      setLoading(false);
      return;
    }

    const formattedLinks = links
      .filter((l) => l.url)
      .map((l) => ({
        song_id: song.id,
        platform: l.platform,
        url: l.url,
        is_primary: l.is_primary ?? false,
      }));

    const {  error: linksError } = await supabase
      .from("song_links")
      .insert(formattedLinks);

    if (!linksError) {
      setTitle("");
      setArtist("");
      setCoverUrl("");
      setLinks([{ platform: "apple_music", url: "", is_primary: true }]);
       navigate(`/alexpink/songs/${song.id}`);
    }

   
    setLoading(false);
  };

  return (
    <Wrapper>
      <Container>
        <Title>Add Song</Title>

        <Input
          placeholder="Song title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />

        <Input
          placeholder="Cover URL"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
        />

        <SectionTitle>Links</SectionTitle>

        {links.map((link, i) => (
          <LinkRow key={i}>
            <SelectPlatform
              value={link.platform ?? ""}
              onChange={(e) =>
                handleChangeLink(
                  i,
                  "platform",
                  e.target.value as StreamingPlatform
                )
              }
            >
              <option value="" disabled>
                Select platform
              </option>

              {tipoStreamingPlatforms.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectPlatform>
            <Input
              placeholder="URL"
              value={link.url}
              onChange={(e) => handleChangeLink(i, "url", e.target.value)}
            />
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={!!link.is_primary}
                onChange={(e) =>
                  handleChangeLink(i, "is_primary", e.target.checked)
                }
              />
              Primary
            </CheckboxLabel>
          </LinkRow>
        ))}

        <SecondaryButton onClick={handleAddLink}>+ Add link</SecondaryButton>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save song"}
        </Button>
      </Container>
    </Wrapper>
  );
}
