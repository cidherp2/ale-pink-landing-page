import { useEffect, useState } from "react";
import styled from "styled-components";
import defualtCover from "../public/verde.svg"

const Wrapper = styled.div`
  width: 100%;
  max-width: 320px;
  margin: 0 auto 24px;
  position: relative;
  aspect-ratio: 1 / 1;
`;

const Img = styled.img<{ visible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  //border-radius: 22px;

  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.15s ease;
`;

interface CoverImageProps {
  src?: string | null;
}

export default function CoverImage({ src }: CoverImageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);

  return (
    <Wrapper>
      {/* Default cover */}
      <Img
        src={defualtCover}
        alt="Default cover"
        visible={!loaded}
      />

      {/* Real cover */}
      {src && (
        <Img
          src={src}
          alt="Song cover"
          visible={loaded}
        />
      )}
    </Wrapper>
  );
}
