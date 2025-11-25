import { findProjectPath, isPathWithin } from '../detector';
import * as path from 'path';

describe('Detector', () => {
  describe('isPathWithin', () => {
    it('should return true when child path is within parent path', () => {
      const parentPath = '/home/user/projects/frontend';
      const childPath = '/home/user/projects/frontend/src/components';
      expect(isPathWithin(childPath, parentPath)).toBe(true);
    });

    it('should return false when child path is outside parent path', () => {
      const parentPath = '/home/user/projects/frontend';
      const childPath = '/home/user/projects/backend';
      expect(isPathWithin(childPath, parentPath)).toBe(false);
    });

    it('should return false when child path is a parent of the specified parent', () => {
      const parentPath = '/home/user/projects/frontend';
      const childPath = '/home/user/projects';
      expect(isPathWithin(childPath, parentPath)).toBe(false);
    });

    it('should return true when paths are identical', () => {
      const parentPath = '/home/user/projects/frontend';
      const childPath = '/home/user/projects/frontend';
      expect(isPathWithin(childPath, parentPath)).toBe(true);
    });
  });

  describe('findProjectPath', () => {
    it('should find exact match in registered paths', () => {
      const currentPath = '/home/user/projects/frontend';
      const registeredPaths = [
        '/home/user/projects/frontend',
        '/home/user/projects/backend',
      ];
      expect(findProjectPath(currentPath, registeredPaths)).toBe('/home/user/projects/frontend');
    });

    it('should find parent project when in subdirectory', () => {
      const currentPath = '/home/user/projects/frontend/src/components';
      const registeredPaths = [
        '/home/user/projects/frontend',
        '/home/user/projects/backend',
      ];
      expect(findProjectPath(currentPath, registeredPaths)).toBe('/home/user/projects/frontend');
    });

    it('should return null when no matching project found', () => {
      const currentPath = '/home/user/other-projects/random';
      const registeredPaths = [
        '/home/user/projects/frontend',
        '/home/user/projects/backend',
      ];
      expect(findProjectPath(currentPath, registeredPaths)).toBeNull();
    });

    it('should find project by containment check', () => {
      const currentPath = '/home/user/projects/frontend/packages/ui';
      const registeredPaths = [
        '/home/user/projects/frontend',
        '/home/user/projects/backend',
      ];
      expect(findProjectPath(currentPath, registeredPaths)).toBe('/home/user/projects/frontend');
    });
  });
});
