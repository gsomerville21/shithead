module.exports = {
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'chore', hidden: true },
    { type: 'docs', section: 'Documentation' },
    { type: 'style', hidden: true },
    { type: 'refactor', section: 'Code Refactoring' },
    { type: 'perf', section: 'Performance Improvements' },
    { type: 'test', hidden: true }
  ],
  commitUrlFormat: 'https://github.com/yourusername/shithead-game/commit/{{hash}}',
  compareUrlFormat:
    'https://github.com/yourusername/shithead-game/compare/{{previousTag}}...{{currentTag}}',
  releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
  preset: 'angular'
};