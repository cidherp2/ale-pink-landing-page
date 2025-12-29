import styled from "styled-components";

export const Wrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #0d6649, #0f3d2e);
  padding: 24px 16px;
  display: flex;
  justify-content: center;
`;

export const Container = styled.div`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Title = styled.h2`
  color: #e6f4ef;
  text-align: center;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  all: unset;
  background: #e6f4ef;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 1rem;
  color: #0f3d2e;

  &::placeholder {
    color: #5b7f73;
  }
`;

export const SelectPlatform = styled.select`
  all: unset;
  background: #e6f4ef;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 1rem;
  color: #0f3d2e;

  &::placeholder {
    color: #5b7f73;
  }
`;

export const SectionTitle = styled.h4`
  color: #e6f4ef;
  margin-top: 8px;
`;

export const LinkRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  padding: 12px;
  border-radius: 12px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e6f4ef;
  font-size: 0.9rem;
`;

export const Button = styled.button`
  all: unset;
  background: #9ad18b;
  color: #0f3d2e;
  font-weight: 600;
  text-align: center;
  padding: 14px 16px;
  border-radius: 14px;
  cursor: pointer;
  min-height: 52px;

  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: translateY(3px);
    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.18);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled(Button)`
  background: #b7e4a4;
`;
