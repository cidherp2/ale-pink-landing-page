import { useState } from "react";
import styled from "styled-components";
import { supabase } from "./utils/ClientSupabase";
import { useNavigate, Link } from "react-router-dom";

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
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;

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

const LoginLink = styled.p`
  color: #aaa;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 18px;

  a {
    color: #6fd3b1;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(null);

    if (!username.trim()) {
      setError("El username es obligatorio.");
      return;
    }
    if (username.trim().length < 3) {
      setError("El username debe tener al menos 3 caracteres.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError("El username solo puede tener letras, números y guiones bajos.");
      return;
    }

    setLoading(true);

    // Verificar que el username no esté tomado
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      setError("Ese username ya está en uso.");
      setLoading(false);
      return;
    }

    // Crear cuenta en auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: email.trim(),
        password,
      },
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const authId = signUpData.user?.id;
    if (!authId) {
      setError("No se pudo crear la cuenta. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    // Crear perfil de fan
    const { error: profileError } = await supabase.from("profiles").insert({
      auth_id: authId,
      username: username.trim().toLowerCase(),
    });

    if (profileError) {
      setError(
        "Cuenta creada pero hubo un error al guardar el perfil: " +
          profileError.message,
      );
      setLoading(false);
      return;
    }

    navigate("/feed");
    setLoading(false);
  };

  return (
    <Wrapper>
      <Card>
        <Title>Únete</Title>
        <Subtitle>Crea tu cuenta de fan</Subtitle>

        <Input
          type="text"
          placeholder="@username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button onClick={handleRegister} disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        {error && <ErrorText>{error}</ErrorText>}

        <LoginLink>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </LoginLink>
      </Card>
    </Wrapper>
  );
}
