import { useState, useRef } from "react";
import styled from "styled-components";
import { supabase } from "./utils/ClientSupabase";

// ─── Styled ───────────────────────────────────────────────────────────────────

const Box = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const Label = styled.p`
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--green-accent);
  margin: 0 0 0.75rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  color: var(--text-main);
  font-size: 0.9rem;
  padding: 0.6rem 0.75rem;
  box-sizing: border-box;
  resize: vertical;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: var(--green-main);
  }
`;

const Row = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  margin-top: 0.75rem;
  flex-wrap: wrap;
`;

const FileBtn = styled.label`
  background: var(--bg-card-soft);
  border: 1px dashed var(--border-soft);
  border-radius: 10px;
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--green-main);
    color: var(--text-main);
  }

  input {
    display: none;
  }
`;

const FileName = styled.span`
  font-size: 0.8rem;
  color: var(--text-muted);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ExclusiveToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--text-muted);
  cursor: pointer;
  margin-left: auto;

  input {
    accent-color: var(--green-main);
  }
`;

const PublishBtn = styled.button`
  background: var(--green-main);
  color: #0b2f23;
  border: none;
  border-radius: 12px;
  padding: 0.55rem 1.4rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.75rem;
  width: 100%;
  transition: opacity 0.15s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  color: #e36d6d;
  font-size: 0.8rem;
  margin: 0.5rem 0 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

const BUCKET = "post-media";

type Props = {
  profileId: string;
  onCreated: () => void;
};

const CreatePost = ({ profileId, onCreated }: Props) => {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isExclusive, setIsExclusive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getMediaType = (file: File): "image" | "audio" | "video" | null => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("video/")) return "video";
    return null;
  };

  const handleSubmit = async () => {
    if (!content.trim() && !file) return;
    setLoading(true);
    setError(null);

    let media_url: string | null = null;
    let media_type: "image" | "audio" | "video" | null = null;

    if (file) {
      media_type = getMediaType(file);
      if (!media_type) {
        setError("Tipo de archivo no soportado.");
        setLoading(false);
        return;
      }
      const ext = file.name.split(".").pop();
      const path = `${profileId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError("Error al subir el archivo: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);
      media_url = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: profileId,
      content: content.trim() || null,
      media_url,
      media_type,
      is_exclusive: isExclusive,
    });

    if (insertError) {
      setError("Error al publicar: " + insertError.message);
    } else {
      setContent("");
      setFile(null);
      setIsExclusive(false);
      if (fileRef.current) fileRef.current.value = "";
      onCreated();
    }

    setLoading(false);
  };

  return (
    <Box>
      <Label>Nueva publicación</Label>
      <Textarea
        placeholder="¿Qué quieres compartir con tus fans?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Row>
        <FileBtn>
          📎 Adjuntar archivo
          <input
            ref={fileRef}
            type="file"
            accept="image/*,audio/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </FileBtn>
        {file && <FileName>{file.name}</FileName>}
        <ExclusiveToggle>
          <input
            type="checkbox"
            checked={isExclusive}
            onChange={(e) => setIsExclusive(e.target.checked)}
          />
          Solo fans
        </ExclusiveToggle>
      </Row>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <PublishBtn
        onClick={handleSubmit}
        disabled={loading || (!content.trim() && !file)}
      >
        {loading ? "Publicando..." : "Publicar"}
      </PublishBtn>
    </Box>
  );
};

export default CreatePost;
