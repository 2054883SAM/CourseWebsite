const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|jose|next|@auth|@babel|@jest|@testing-library|@types|superjson|@panva|@edge-runtime|nanoid|jose|@peculiar|asn1js|webcrypto-core|@peculiar|react-hook-form|@swc|@edge-runtime|uuid|@microsoft|@azure|@opentelemetry|@babel|@jest|@testing-library|@types|@microsoft|@azure|@opentelemetry|@babel|@jest|@testing-library|@types|@supabase/auth-helpers-shared|@supabase/auth-helpers-nextjs|@supabase/supabase-js|@supabase/auth-ui-shared|@supabase/auth-ui-react|@supabase/auth-helpers-react)/)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  testEnvironmentOptions: {
    customExportConditions: ['browser', 'node', 'node-addons'],
  },
};

module.exports = createJestConfig(customJestConfig);
