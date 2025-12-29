import styled from "styled-components"

export const ButtonsContainer = styled.div`
  width: 93%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  gap: 1rem;
`;

export const LinkButton = styled.a`
box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 14px;

  background-color: #9ad18b;
  color: #0f3d2e;

  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;

  padding: 14px 18px;
  border-radius: 14px;

  min-height: 56px;

  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.15);

  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: translateY(3px);
    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.15);
  }

`;

export const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg, img {
    width: 100%;
    height: 100%;
  }
`;

const formatPlatformLabel = (platform: string) => 
  platform
    .replace(/_/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());


interface LinkButtonsProps {
    songLink: string;
    platform: string;
    songTitle: string;
    coverUrl: string;
}
const LinkButtons = ({ songLink, platform, songTitle,coverUrl }: LinkButtonsProps) => {
    return (
        <ButtonsContainer className="buttons-container">
            <LinkButton href={songLink} target="_blank" className="link-button">
          <IconWrapper >
            <img src={coverUrl} alt={platform} />
          </IconWrapper>
         <p>{`${songTitle} - ${formatPlatformLabel(platform)}`}</p>
        </LinkButton>
        </ButtonsContainer>
    )
}

export default LinkButtons