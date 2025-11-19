import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  gettingStarted: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/introduction',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/architecture',
      ],
    },
  ],

  cli: [
    {
      type: 'category',
      label: 'CLI',
      items: [
        'cli/overview',
        {
          type: 'category',
          label: 'Commands',
          items: [
            'cli/commands/add',
            'cli/commands/list',
            'cli/commands/scan',
            'cli/commands/remove',
            'cli/commands/rename',
            'cli/commands/run',
            'cli/commands/scripts',
            'cli/commands/pwd',
            'cli/commands/cd',
            'cli/commands/prxi',
            'cli/commands/web',
            'cli/commands/api',
            'cli/commands/ps',
            'cli/commands/stop',
            'cli/commands/scan-ports',
          ],
        },
        'cli/advanced-features',
        'cli/shell-integration',
      ],
    },
  ],

  api: [
    {
      type: 'category',
      label: 'API',
      items: [
        'api/overview',
        'api/installation',
        'api/endpoints',
        'api/data-models',
        'api/database',
        'api/port-management',
        'api/error-handling',
        'api/integration',
      ],
    },
  ],

  core: [
    {
      type: 'category',
      label: 'Core',
      items: [
        'core/overview',
        'core/installation',
        'core/api-reference',
        'core/database',
        'core/test-detection',
        'core/port-scanning',
        'core/settings',
        'core/examples',
      ],
    },
  ],

  desktop: [
    {
      type: 'category',
      label: 'Desktop',
      items: [
        'desktop/overview',
        'desktop/installation',
        'desktop/features',
        'desktop/usage',
        'desktop/integration',
        'desktop/development',
      ],
    },
  ],

  prxi: [
    {
      type: 'category',
      label: 'Prxi',
      items: [
        'prxi/overview',
        'prxi/installation',
        'prxi/features',
        'prxi/keyboard-shortcuts',
        'prxi/usage',
        'prxi/development',
      ],
    },
  ],

  examples: [
    {
      type: 'category',
      label: 'Examples & Tutorials',
      items: [
        'examples/basic-workflow',
        'examples/multi-project-management',
        'examples/port-conflict-resolution',
        'examples/background-processes',
        'examples/shell-integration',
        'examples/common-use-cases',
      ],
    },
  ],

  troubleshooting: [
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/port-conflicts',
        'troubleshooting/background-processes',
        'troubleshooting/database-issues',
        'troubleshooting/api-server-issues',
        'troubleshooting/script-execution',
        'troubleshooting/common-errors',
      ],
    },
  ],
};

export default sidebars;

