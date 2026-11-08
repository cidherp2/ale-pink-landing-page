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
  SelectPlatform,
  CoverUpload,
  CoverPreview,
  HiddenFileInput,
} from "./utils/AddSong.styles";
import type { Database } from "./supabase/Database";
import { useNavigate } from "react-router-dom";

type StreamingPlatform = Database["public"]["Enums"]["streaming_platform"];

type SongLink = {
  platform: StreamingPlatform;
  url: string;
  is_primary?: boolean;
};

type AddSongProps = {
  username: string;
  userId: string;
};

export default function AddSong({ username, userId }: AddSongProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [links, setLinks] = useState<SongLink[]>([
    { platform: '""', url: "", is_primary: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdSongId, setCreatedSongId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [coverFile, setCoverFile] = useState<File | null>(null);

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

  const handleChangeLink = <K extends keyof SongLink,>(
    index: number,
    field: K,
    value: SongLink[K],
  ) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const handleSubmit = async () => {
    if (!title || !artist) return alert("Title and artist required");

    setSubmitError(null);
    setLoading(true);

    // 1️⃣ Crear canción SIN cover aún
    const { data: song, error: songError } = await supabase
      .from("songs")
      .insert({
        title,
        artist,
        user_id:userId
      })
      .select()
      .single();

    if (songError || !song) {
      console.error("Error creating song:", songError);
      setSubmitError("No se pudo crear la canción.");
      setLoading(false);
      return;
    }
    setCreatedSongId(song.id);

    // 2️⃣ Subir cover y obtener URL
    const coverResult = await uploadCover(song.id);
    if (coverResult.error) {
      console.error("Cover upload error:", coverResult.error);
      setSubmitError("La canción se creó, pero no se pudo subir la portada. No vuelvas a guardarla para evitar duplicados.");
      setLoading(false);
      return;
    }
    const coverUrl = coverResult.url;

    // 3️⃣ Guardar cover_url si existe
    if (coverUrl) {
      const { error } = await supabase
        .from("songs")
        .update({ cover_url: coverUrl })
        .eq("id", song.id);
      if (error) {
        console.error("Error saving cover:", error);
        setSubmitError("La canción se creó, pero no se pudo asociar la portada. No vuelvas a guardarla para evitar duplicados.");
        setLoading(false);
        return;
      }
    }

    // 4️⃣ Insertar links
    const formattedLinks = links
      .filter((l) => l.url)
      .map((l) => ({
        song_id: song.id,
        platform: l.platform,
        url: l.url,
        is_primary: l.is_primary ?? false,
      }));

    if (formattedLinks.length > 0) {
      const { error } = await supabase.from("song_links").insert(formattedLinks);
      if (error) {
        console.error("Error saving song links:", error);
        setSubmitError("La canción se creó, pero no se pudieron guardar sus enlaces. No vuelvas a guardarla para evitar duplicados.");
        setLoading(false);
        return;
      }
    }

    // 5️⃣ Reset
    setTitle("");
    setArtist("");
    setCoverFile(null);
    setLinks([{ platform: "apple_music", url: "", is_primary: true }]);

    navigate(`/u/${encodeURIComponent(username)}/songs/${song.id}`);
    setLoading(false);
  };

  const uploadCover = async (songId: string) => {
    if (!coverFile) return { url: null, error: null };

    const fileExt = coverFile.name.split(".").pop();
    const filePath = `songs/${username}/${songId}.${fileExt}`;

    const { error } = await supabase.storage
      .from("CoverArt")
      .upload(filePath, coverFile, {
        upsert: true,
      });

    if (error) {
      return { url: null, error };
    }

    const { data } = supabase.storage.from("CoverArt").getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
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

        <SectionTitle>Cover</SectionTitle>

        <CoverUpload>
          {coverFile ? "Change cover" : "Upload cover image"}
          <HiddenFileInput
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setCoverFile(e.target.files[0]);
              }
            }}
          />
        </CoverUpload>

        {coverFile && (
          <CoverPreview
            src={URL.createObjectURL(coverFile)}
            alt="Cover preview"
          />
        )}

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
              <option value="" >
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

        {submitError && <p role="alert">{submitError}</p>}
        {createdSongId && submitError && (
          <p>La canción creada aparece en <a href="/songs">tus canciones</a>.</p>
        )}
        <Button onClick={handleSubmit} disabled={loading || Boolean(createdSongId)}>
          {loading ? "Saving..." : "Save song"}
        </Button>
      </Container>
    </Wrapper>
  );
}
