module.exports = {
  plugins: ['sonarjs'],
  extends: [
    './src/infrastructure/linter/typescript',
    'plugin:sonarjs/recommended-legacy',
  ],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir : __dirname,
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  overrides: [
    {
      files: [ '*' ],
      rules: {
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/cognitive-complexity': 'off'
      }
    }
  ]
}
