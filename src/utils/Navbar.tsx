import styled from "styled-components";
import { FiMenu } from "react-icons/fi";
import SlidingMenu from "../SlidingMenu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useBodyClick from "../UseBodyClick";
import { useRef } from "react";

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  min-width: 420px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 16px;
  box-sizing: border-box;

  background: linear-gradient(
    180deg,
    rgba(13, 102, 73, 0.95),
    rgba(13, 102, 73, 0.85)
  );

  backdrop-filter: blur(8px);

  z-index: 900;
`;


const Brand = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: #e6f4ee;
  letter-spacing: 0.4px;
`;

const MenuButton = styled.button`
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #9ad18b;
  color: #0f3d2e;

  border: none;
  border-radius: 12px;

  cursor: pointer;

  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
  }
`;

const Navbar = () => {
  const [clicked, setClicked] = useState<boolean>(false);
  const navigate = useNavigate();
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    setClicked(prev =>!prev);
  };

   useBodyClick(() => {
        setClicked(false); // Close modal when body is clicked
    }, [menuButtonRef]);

  return (
    <>
      <SlidingMenu clickActivator={clicked}></SlidingMenu>
        <Nav>
          <Brand
            onClick={() =>
              navigate(`/alexpink/songs`)
            }
          >
            {localStorage.getItem("username")?.toString()}
          </Brand>

          <MenuButton
          ref={menuButtonRef}
            onClick={() => {
              handleClick();
            }}
            aria-label="Open menu"
          >
            <FiMenu size={24} />
          </MenuButton>
        </Nav>
      
         
    </>
  );
};

export default Navbar;
