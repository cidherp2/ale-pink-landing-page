import { Link } from "react-router-dom";
import styled from "styled-components";

const AddButton = styled(Link)`
width:145px;
  margin-top: 24px;
  padding: 16px 20px;
  border-radius: 16px;
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;

  background: var(--primary, #9ad18b);
  color: #fff;

  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  text-decoration: none;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  box-shadow: 0 10px 24px rgba(13, 102, 73, 0.35);

  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(13, 102, 73, 0.45);
    opacity: 0.95;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 8px 18px rgba(13, 102, 73, 0.35);
    opacity: 0.9;
  }
`;

const Icon = styled.span`
  font-size: 1.2rem;
  line-height: 1;
`;

type AddSongButtonProps = {
  username:string
}

const AddSongButton = () => {

  return (
    <AddButton to="/addsong">
      <Icon>＋</Icon>
      Añadir canción
    </AddButton>
  );
};
export const ProfileButton:React.FC<AddSongButtonProps> = (props) => {
  return (
    <AddButton 
    style={{left: '24px', right: 'auto'}}
    to={`/profile/${props.username}`}>
      <Icon>👨🏻‍💻</Icon>
      Perfil
    </AddButton>
  );
};

export default AddSongButton;
