# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Preparación multiusuario

La migración `supabase/migrations/20261108140000_prepare_multi_tenant.sql` debe
revisarse antes de aplicarse y coordinarse con el despliegue de la aplicación.
Se recomienda contar con un respaldo verificado. Las pruebas
en `supabase/tests/` usan datos y esquemas ficticios: ejecútalas únicamente
en una base de datos de pruebas aislada, nunca en producción.

La migración mantiene públicas las landing pages, canciones, enlaces y perfiles;
las consultas de clicks y la escritura de canciones quedan limitadas al
propietario. La lectura pública de perfiles sigue incluyendo todas sus columnas,
incluido `auth_id`: antes del despliegue se debe revisar si esto es aceptable.
Las URLs anteriores `/alexpink/songs/:id` siguen funcionando; los enlaces nuevos
usan `/u/:username/songs/:id`. Los píxeles existentes solo se cargan en las
landing pages del propietario histórico. Para cambiar ese propietario en otra
instalación se puede configurar `VITE_LEGACY_PIXEL_OWNER_ID` en la compilación.

Antes de activar producción:

1. Revisar la migración, las políticas existentes, las cuentas y portadas, y
   probar el registro, la confirmación de correo y los clientes existentes en un
   entorno equivalente a producción.
2. Preparar un respaldo y un procedimiento de recuperación de base de datos y
   aplicación. La migración no incluye una reversión automática.
3. Coordinar la migración y el frontend: el nuevo registro depende de un trigger
   y Analytics depende de la nueva relación de clicks. No desplegar el frontend
   nuevo de forma independiente antes de la migración.
4. Verificar tras el despliegue las landing pages antiguas y nuevas, los clicks,
   las portadas y el aislamiento entre dos usuarios.

La fecha predeterminada de los clicks nuevos será la hora de la base de datos.
Por compatibilidad, la migración todavía permite que clientes antiguos envíen
`created_at`; se requiere una segunda fase para retirar ese permiso una vez
actualizados los clientes. No corrige automáticamente fechas históricas. La
relación de clicks se agrega como `NOT VALID`: protege registros nuevos, pero
los datos históricos deben revisarse y validarse por separado; también debe
revisarse el efecto sobre el borrado de canciones. La paginación de resultados
agrupados evita el límite de 1.000 filas, pero no sustituye una prueba de carga
con millones de clicks.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
