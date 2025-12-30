import { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "./utils/ClientSupabase";
import StreamingIcon from "./StreamingIcons";
import type { Tables } from "./supabase/Database";
import { useParams } from "react-router-dom";

type Profile = Tables<"profiles">;

type SocialLink = {
  platform: string;
  url: string;
};

const Wrapper = styled.div`
  min-height: 100vh;
  padding: 24px 16px;
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border-radius: 22px;
  padding: 24px 20px;
  border: 1px solid var(--border-soft);
`;

const Avatar = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 16px;
  display: block;
`;

const Username = styled.h1`
  text-align: center;
  font-size: 1.45rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-main);
`;

const Links = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const LinkButton = styled.a`
  padding: 15px 18px;
  border-radius: 16px;
  background: var(--bg-card-soft);
  color: var(--text-main);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 500;

  border: 1px solid var(--border-soft);

  &:active {
    transform: scale(0.97);
  }

  svg {
    color: var(--green-accent);
  }
`;

const Contact = styled.div`
  margin-top: 26px;
  font-size: 0.9rem;
  color: var(--text-muted);
  text-align: center;
`;
const PlatformName = styled.span`
  text-transform: capitalize;
`;

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const{username} = useParams();

  useEffect(() => {
    if (!username) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [username]);

  if (!profile) return null;

  const socialLinks = (profile.social_links || []) as SocialLink[];

  return (
    <Wrapper>
      <Card>
        {profile.avatar_url && (
          <Avatar src={profile.avatar_url} alt={profile.username} />
        )}

        <Username>@{profile.username}</Username>

        <Links>
          {socialLinks.map((link, i) => (
            <LinkButton
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <StreamingIcon platform={link.platform as any} size={20} />
              <PlatformName>{link.platform.replace("_", " ")}</PlatformName>
            </LinkButton>
          ))}
        </Links>

        {profile.contact_value && (
          <Contact>
            Contact via {profile.contact_method}:{" "}
            <strong>{profile.contact_value}</strong>
          </Contact>
        )}
      </Card>
    </Wrapper>
  );
}
