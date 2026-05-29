import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Esta regla es demasiado estricta: bloquea el patrón estándar de
      // fetch asíncrono dentro de useEffect (incluso con useCallback).
      // En nuestros hooks usamos async/await, por lo que setState nunca
      // se llama de forma síncrona en el cuerpo del efecto.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
