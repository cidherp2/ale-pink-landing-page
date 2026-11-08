import styled from "styled-components";
import { useIsolatedNavigate } from "./utils/legacyPixels";
import { supabase } from "./utils/ClientSupabase";
import { useState } from "react";

const MenuContainer = styled.div<{ $open: boolean }>`
  width: 420px;
  height: ${({ $open }) => ($open ? "calc(100dvh - 64px)" : "0vh")};
  background-color: var(--bg-main);
  margin-top: 64px;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
  box-sizing: border-box;

  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  transition: height 0.3s ease-out;
  z-index: 100000;
`;

const MenuButton = styled.button`
  width: 80%;
  max-width: 320px;
  padding: 16px 20px;

  background-color: #9ad18b;
  color: #0f3d2e;

  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 14px;

  cursor: pointer;

  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.25);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:active {
    transform: translateY(3px);
    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.25);
  }
`;

const LogoutButton = styled(MenuButton)`
  background-color: #e36d6d;
  color: #3d0f0f;
`;

type SlidingMenuProps = {
  clickActivator: boolean;
  username: string | null;
};

const SlidingMenu = (props: SlidingMenuProps) => {
  const navigate = useIsolatedNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      setLogoutError("No se pudo cerrar la sesión. Intenta de nuevo.");
      return;
    }
    setLogoutError(null);
    navigate("/login");
  };

  return (
    <MenuContainer $open={props.clickActivator}>
      <div
        style={{
          width: "100%",
          paddingTop: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {props.username && (
          <MenuButton onClick={() => navigate(`/profile/${encodeURIComponent(props.username ?? "")}`)}>
            Perfil
          </MenuButton>
        )}

        <MenuButton onClick={() => navigate("/feed")}>Feed</MenuButton>

        <MenuButton onClick={() => navigate("/analytics")}>
          Telemetría
        </MenuButton>

        <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
        {logoutError && <p role="alert">{logoutError}</p>}
      </div>
    </MenuContainer>
  );
};

export default SlidingMenu;
