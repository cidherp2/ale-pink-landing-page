import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "./utils/ClientSupabase";
import { FiHeart, FiMessageCircle, FiTrash2, FiLock } from "react-icons/fi";
import CreatePost from "./CreatePost";

// ─── Types ────────────────────────────────────────────────────────────────────

type Post = {
  id: string;
  content: string | null;
  media_url: string | null;
  media_type: "image" | "audio" | "video" | null;
  is_exclusive: boolean;
  created_at: string;
  user_id: string;
  profiles: { username: string; avatar_url: string | null } | null;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
};

// ─── Styled ───────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: var(--bg-main);
  color: var(--text-main);
  padding: 1.5rem 1rem 4rem;
  box-sizing: border-box;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--green-accent);
  margin: 0 0 1.5rem;
`;

const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.25rem;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
`;

const Avatar = styled.div<{ url?: string | null }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--green-main);
  background-image: ${({ url }) => (url ? `url(${url})` : "none")};
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-main);
`;

const DateText = styled.span`
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: auto;
`;

const ExclusiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #f0c040;
  background: rgba(240, 192, 64, 0.12);
  border-radius: 6px;
  padding: 2px 7px;
`;

const ContentText = styled.p`
  font-size: 0.95rem;
  line-height: 1.55;
  margin: 0 0 0.75rem;
  white-space: pre-wrap;
`;

const MediaImg = styled.img`
  width: 100%;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  object-fit: cover;
  max-height: 400px;
`;

const MediaAudio = styled.audio`
  width: 100%;
  margin-bottom: 0.75rem;
`;

const MediaVideo = styled.video`
  width: 100%;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  max-height: 400px;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ActionBtn = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ active }) =>
    active ? "var(--green-accent)" : "var(--text-muted)"};
  padding: 0;
  transition: color 0.15s;

  &:hover {
    color: var(--green-accent);
  }
`;

const DeleteBtn = styled(ActionBtn)`
  margin-left: auto;
  &:hover {
    color: #e36d6d;
  }
`;

const CommentsSection = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-soft);
`;

const CommentItem = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
  font-size: 0.85rem;
`;

const CommentUser = styled.span`
  font-weight: 600;
  color: var(--green-accent);
  flex-shrink: 0;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const CommentInput = styled.input`
  flex: 1;
  background: var(--bg-card-soft);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  padding: 0.4rem 0.75rem;
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;

  &:focus {
    border-color: var(--green-main);
  }
`;

const SendBtn = styled.button`
  background: var(--green-main);
  color: #0b2f23;
  border: none;
  border-radius: 10px;
  padding: 0.4rem 0.9rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
`;

const Empty = styled.p`
  color: var(--text-muted);
  text-align: center;
  margin-top: 3rem;
`;

// ─── Component ────────────────────────────────────────────────────────────────

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [isArtist, setIsArtist] = useState(false);
  const [openComments, setOpenComments] = useState<Record<string, Comment[]>>(
    {},
  );
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {},
  );

  const fetchPosts = useCallback(async (profileId: string | null) => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        id, content, media_url, media_type, is_exclusive, created_at, user_id,
        profiles ( username, avatar_url ),
        likes ( id, user_id ),
        comments ( id )
      `,
      )
      .order("created_at", { ascending: false });

    if (error || !data) return;

    const enriched: Post[] = data.map((p: any) => ({
      id: p.id,
      content: p.content,
      media_url: p.media_url,
      media_type: p.media_type,
      is_exclusive: p.is_exclusive,
      created_at: p.created_at,
      user_id: p.user_id,
      profiles: p.profiles,
      likes_count: p.likes?.length ?? 0,
      comments_count: p.comments?.length ?? 0,
      liked_by_me: profileId
        ? (p.likes ?? []).some((l: any) => l.user_id === profileId)
        : false,
    }));

    setPosts(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const authId = sessionData?.session?.user?.id;
      if (!authId) {
        setLoading(false);
        return;
      }

      const ARTIST_UID = "677ed28c-f504-43cf-9637-3acf8bc5acc8";
      if (authId === ARTIST_UID) setIsArtist(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("auth_id", authId)
        .single();

      if (profile) {
        setMyProfileId(profile.id);
        fetchPosts(profile.id);
      } else {
        fetchPosts(null);
      }
    };
    init();
  }, [fetchPosts]);

  const handleLike = async (post: Post) => {
    if (!myProfileId) return;
    if (post.liked_by_me) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", myProfileId);
    } else {
      await supabase
        .from("likes")
        .insert({ post_id: post.id, user_id: myProfileId });
    }
    fetchPosts(myProfileId);
  };

  const handleDelete = async (postId: string) => {
    if (!myProfileId) return;
    await supabase.from("posts").delete().eq("id", postId);
    fetchPosts(myProfileId);
  };

  const toggleComments = async (postId: string) => {
    if (openComments[postId] !== undefined) {
      setOpenComments((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      return;
    }
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, profiles ( username, avatar_url )")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setOpenComments((prev) => ({ ...prev, [postId]: (data as any) ?? [] }));
  };

  const handleComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!myProfileId || !commentInputs[postId]?.trim()) return;
    await supabase.from("comments").insert({
      post_id: postId,
      user_id: myProfileId,
      content: commentInputs[postId].trim(),
    });
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    // refrescar comentarios de ese post
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, profiles ( username, avatar_url )")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setOpenComments((prev) => ({ ...prev, [postId]: (data as any) ?? [] }));
    fetchPosts(myProfileId);
  };

  return (
    <Page>
      <Title>Feed</Title>

      {isArtist && (
        <CreatePost
          profileId={myProfileId!}
          onCreated={() => fetchPosts(myProfileId)}
        />
      )}

      {loading && <Empty>Cargando...</Empty>}
      {!loading && posts.length === 0 && (
        <Empty>No hay publicaciones aún.</Empty>
      )}

      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <Avatar url={post.profiles?.avatar_url} />
            <UserName>{post.profiles?.username ?? "—"}</UserName>
            {post.is_exclusive && (
              <ExclusiveBadge>
                <FiLock size={10} /> Exclusivo
              </ExclusiveBadge>
            )}
            <DateText>
              {new Date(post.created_at).toLocaleString("es-MX", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </DateText>
          </CardHeader>

          {post.content && <ContentText>{post.content}</ContentText>}

          {post.media_url && post.media_type === "image" && (
            <MediaImg src={post.media_url} alt="media" />
          )}
          {post.media_url && post.media_type === "audio" && (
            <MediaAudio controls src={post.media_url} />
          )}
          {post.media_url && post.media_type === "video" && (
            <MediaVideo controls src={post.media_url} />
          )}

          <Actions>
            <ActionBtn
              active={post.liked_by_me}
              onClick={() => handleLike(post)}
            >
              <FiHeart size={16} />
              {post.likes_count}
            </ActionBtn>
            <ActionBtn onClick={() => toggleComments(post.id)}>
              <FiMessageCircle size={16} />
              {post.comments_count}
            </ActionBtn>
            {isArtist && (
              <DeleteBtn onClick={() => handleDelete(post.id)}>
                <FiTrash2 size={15} />
              </DeleteBtn>
            )}
          </Actions>

          {openComments[post.id] !== undefined && (
            <CommentsSection>
              {openComments[post.id].map((c) => (
                <CommentItem key={c.id}>
                  <CommentUser>{c.profiles?.username ?? "—"}:</CommentUser>
                  <span>{c.content}</span>
                </CommentItem>
              ))}
              {myProfileId && (
                <CommentForm onSubmit={(e) => handleComment(e, post.id)}>
                  <CommentInput
                    placeholder="Escribe un comentario..."
                    value={commentInputs[post.id] ?? ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                  />
                  <SendBtn type="submit">Enviar</SendBtn>
                </CommentForm>
              )}
            </CommentsSection>
          )}
        </Card>
      ))}
    </Page>
  );
};

export default Feed;
