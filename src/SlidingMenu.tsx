import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { supabase } from "./utils/ClientSupabase";
import { useEffect, useState } from "react";

const MenuContainer = styled.div<{ clicado: boolean }>`
  width: 420px;
  height: ${({ clicado }) => (clicado ? "100vh" : "0vh")};
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
  overflow: hidden;
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
  transition: transform 0.15s ease, box-shadow 0.15s ease;

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
};

const SlidingMenu = (props: SlidingMenuProps) => {
  const navigate = useNavigate();
  const [clicked,setClicked] = useState<boolean>(props.clickActivator)


  const handleLogout = async () => {
    // aquí va tu supabase.auth.signOut()
     await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(()=>{
setClicked(props.clickActivator)
  },[props.clickActivator])

   

  return (
    <MenuContainer clicado={clicked}>
      <div
      style={{width:"100%", paddingTop:"2rem", display:"flex", flexDirection:"column", gap:"2rem",alignItems:"center"}}
      >
              <MenuButton

              onClick={() => navigate(`/profile/${localStorage.getItem("username")}`)}>Perfil</MenuButton>

      <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
      </div>

    </MenuContainer>
  );
};

export default SlidingMenu;
