import { formatContextAsText } from '../resources';

describe('Resources', () => {
  describe('formatContextAsText', () => {
    it('should format project context with all fields', () => {
      const context = {
        project: {
          name: 'Frontend App',
          path: '/home/user/projects/frontend',
          description: 'React frontend application',
          framework: 'react',
          tags: ['frontend', 'ui'],
          git_branch: 'main',
        },
        linkedProjects: [
          {
            name: 'Backend API',
            path: '/home/user/projects/backend',
            description: 'Node.js API',
            tags: ['backend', 'api'],
          },
        ],
        workspace: {
          name: 'Full Stack App',
          description: 'Complete application workspace',
          tags: ['monorepo'],
        },
      };

      const text = formatContextAsText(context);

      expect(text).toContain('# Project Context');
      expect(text).toContain('Frontend App');
      expect(text).toContain('/home/user/projects/frontend');
      expect(text).toContain('React frontend application');
      expect(text).toContain('react');
      expect(text).toContain('frontend, ui');
      expect(text).toContain('main');
      expect(text).toContain('Full Stack App');
      expect(text).toContain('Backend API');
      expect(text).toContain('/home/user/projects/backend');
    });

    it('should format project context with minimal fields', () => {
      const context = {
        project: {
          name: 'Simple App',
          path: '/home/user/projects/app',
          description: null,
          framework: null,
          tags: [],
          git_branch: null,
        },
        linkedProjects: [],
        workspace: null,
      };

      const text = formatContextAsText(context);

      expect(text).toContain('# Project Context');
      expect(text).toContain('Simple App');
      expect(text).toContain('/home/user/projects/app');
      expect(text).not.toContain('Description:');
      expect(text).not.toContain('Framework:');
      expect(text).not.toContain('Tags:');
      expect(text).not.toContain('Git Branch:');
      expect(text).not.toContain('## Workspace');
      expect(text).not.toContain('## Linked Projects');
    });

    it('should format workspace information when present', () => {
      const context = {
        project: {
          name: 'App',
          path: '/home/user/projects/app',
          description: null,
          framework: null,
          tags: [],
          git_branch: null,
        },
        linkedProjects: [],
        workspace: {
          name: 'My Workspace',
          description: 'Development workspace',
          tags: ['dev', 'personal'],
        },
      };

      const text = formatContextAsText(context);

      expect(text).toContain('## Workspace');
      expect(text).toContain('My Workspace');
      expect(text).toContain('Development workspace');
      expect(text).toContain('dev, personal');
    });

    it('should format linked projects', () => {
      const context = {
        project: {
          name: 'App',
          path: '/home/user/projects/app',
          description: null,
          framework: null,
          tags: [],
          git_branch: null,
        },
        linkedProjects: [
          {
            name: 'Project A',
            path: '/home/user/projects/a',
            description: 'First project',
            tags: ['tag1'],
          },
          {
            name: 'Project B',
            path: '/home/user/projects/b',
            description: null,
            tags: [],
          },
        ],
        workspace: null,
      };

      const text = formatContextAsText(context);

      expect(text).toContain('## Linked Projects in Workspace');
      expect(text).toContain('Project A');
      expect(text).toContain('/home/user/projects/a');
      expect(text).toContain('First project');
      expect(text).toContain('tag1');
      expect(text).toContain('Project B');
      expect(text).toContain('/home/user/projects/b');
    });
  });
});
