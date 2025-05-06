// .storybook/preview.tsx
import React from 'react'; // React をインポート
import type { Preview, Decorator } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom'; // MemoryRouter をインポート
import '../src/index.css';

// MemoryRouterでラップするデコレーター
const withRouter: Decorator = (Story) => (
  <MemoryRouter initialEntries={['/']}> {/* 初期URLを '/' に設定 */}
    <Story />
  </MemoryRouter>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  // --- ▼▼▼ デコレーターを追加 ▼▼▼ ---
  decorators: [
    withRouter, // すべてのストーリーをMemoryRouterでラップ
    // 他のグローバルデコレーターがあればここに追加
  ],
  // --- ▲▲▲ デコレーターを追加 ▲▲▲ ---
};

export default preview;