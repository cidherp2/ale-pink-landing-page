// styles/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    --bg-main: #0b2f23;        /* verde muy oscuro */
    --bg-card: #0f3b2d;        /* verde profundo */
    --bg-card-soft: #124634;   /* hover / inputs */

    --green-main: #3fb58f;     /* verde vivo pero soft */
    --green-accent: #6fd3b1;   /* highlights */

    --text-main: #f2f6f4;
    --text-muted: #b6ccc4;

    --border-soft: rgba(255,255,255,0.08);
  }

  body {
    margin: 0;
    background: var(--bg-main);
    color: var(--text-main);
    font-family: system-ui, -apple-system, BlinkMacSystemFont;
  }
`;



export default GlobalStyle;
