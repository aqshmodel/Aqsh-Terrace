// .storybook/main.ts または .storybook/main.tsx

import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path'; // ★ node:path ではなく path でインポート
import { mergeConfig } from 'vite'; // viteからmergeConfigをインポート

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    // 他のアドオン...
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config, { configType }) { // configType も受け取れるようにする（必須ではないが慣例）
    // プロジェクトの vite.config.ts から resolve.alias をマージ
    return mergeConfig(config, {
      // ★★★ ここからが重要 ★★★
      resolve: {
        alias: {
          // ここでプロジェクトのvite.config.tsと同じエイリアス設定を行う
          // __dirname は .storybook ディレクトリを指すため、そこから見た src のパスを指定
          '@': path.resolve(__dirname, '../src'),
        },
      },
      // ★★★ ここまでが重要 ★★★
      // 必要に応じて他の Vite 設定もマージできます
      // 例: define, plugins など
    });
  },
};
export default config;