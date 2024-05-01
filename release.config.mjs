/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ['master'],
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    [
      '@semantic-release/release-notes-generator',
      { preset: 'conventionalcommits' },
    ],
    '@semantic-release/changelog',
    ['@semantic-release/npm'],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message:
          'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}\n\n[skip ci]',
      },
    ],
    '@semantic-release/github',
  ],
};
