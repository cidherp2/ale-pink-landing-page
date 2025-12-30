import { useState } from "react";
import styled from "styled-components";
import { supabase } from "./utils/ClientSupabase";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #0d6649;
`;

const Card = styled.div`
  width: 100%;
  max-width: 380px;
  background: #0f0f0f;
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h1`
  color: #fff;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 6px;
`;

const Subtitle = styled.p`
  color: #aaa;
  font-size: 0.95rem;
  margin-bottom: 24px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  font-size: 16px;
  margin-bottom: 14px;
  box-sizing: border-box;

  &::placeholder {
    color: #666;
  }

  &:focus {
    outline: 2px solid #0d6649;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: #0d6649;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  transition: transform 0.15s ease, opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const ErrorText = styled.p`
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 12px;
  text-align: center;
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
        
    }
    if (!error) {
      navigate("/alexpink/songs");
    }

    setLoading(false);
  };

  return (
    <Wrapper>
      <Card>
        <Title>Bienvenido</Title>
        <Subtitle>Inicia sesión para gestionar tu música</Subtitle>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <Button onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        {error && <ErrorText>{error}</ErrorText>}
      </Card>
    </Wrapper>
  );
}
