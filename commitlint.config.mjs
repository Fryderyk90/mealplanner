// Conventional Commits, see CONTRIBUTING.md#commit-messages
// Rule format: [level (0 off, 1 warn, 2 error), 'always' | 'never', value]
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'recipes',
        'planner',
        'shopping',
        'gateway',
        'bff',
        'web',
        'ui',
        'infra',
        'k8s',
        'ci',
        'deps',
        'docs',
      ],
    ],
  },
};
