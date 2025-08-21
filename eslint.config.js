const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['**/*.min.js', 'src/test/e2e/**']
  },
  {
    ...js.configs.recommended,
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 11,
      sourceType: 'commonjs',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        WebSocket: 'readonly',
        Worker: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // Web Worker globals
        self: 'writable',
        postMessage: 'readonly',
        onmessage: 'writable',
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly'
      }
    }
  }
];