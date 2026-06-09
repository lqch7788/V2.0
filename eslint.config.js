// V2.0 ESLint flat config
// 基于 V1.1 配置改造，适配 Vue3 + 纯 JavaScript

import js from '@eslint/js'
import globals from 'globals'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-config-prettier'

export default [
  // 全局忽略
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'server/node_modules/**',
      'server/dist/**',
      'backup/**',
      '.worktrees/**',
      'server/data/**/*.db',
      // 观察期的 .ts 暂不检查（避免干扰）
      '**/*.ts',
      // 配置文件有特殊语法
      'vite.config.js',
      'playwright.config.js',
    ],
  },

  // 基础 JS 推荐规则
  js.configs.recommended,

  // Vue3 推荐配置（仅用于 .vue）
  ...vuePlugin.configs['flat/recommended'].map(config => ({
    ...config,
    files: ['**/*.vue'],
  })),

  // Prettier 兼容（关闭冲突规则）
  prettier,

  // 全部源文件配置
  {
    files: ['src/**/*.{js,vue}', 'server/src/**/*.js', 'server/scripts/**/*.js', 'e2e/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // ===== 错误级别（必须修复） =====
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none', // tsc 生成的 catch (error) {} 中 error 经常未用
      }],
      'no-undef': 'warn', // 改为 warn：.vue 文件中常用未显式 import 的全局
      'no-unreachable': 'error',
      'no-fallthrough': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-unused-expressions': 'warn',

      // ===== 警告级别（建议修复） =====
      'no-console': 'off', // 项目里 console 较多
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'prefer-const': 'warn',
      'no-var': 'warn',
      'eqeqeq': ['warn', 'smart'],
    },
  },

  // Vue 文件额外规则（用 vue-eslint-parser 解析）
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        // 不指定 sub-parser，让 vue-eslint-parser 用默认 espree
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off', // 单字组件名允许
      'vue/no-v-html': 'warn',
      'vue/component-definition-name-casing': ['warn', 'PascalCase'],
      'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
      'vue/no-mutating-props': 'error',
      'vue/no-parsing-error': 'error',
      // ===== Vue3 风格规则降级（V1.1 风格） =====
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-indent': 'off',
      'vue/attributes-order': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',
      'vue/require-default-prop': 'off',
      'vue/html-closing-bracket-spacing': 'off',
    },
  },

  // 测试文件配置
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', 'e2e/**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.mocha,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
]

