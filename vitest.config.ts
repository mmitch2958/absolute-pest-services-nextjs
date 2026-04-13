import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['app/__tests__/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: [
      { find: /^@\/lib\/(.*)/, replacement: path.resolve(__dirname, './src/lib/$1') },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, './app/$1') },
    ],
  },
});
