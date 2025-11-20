import { extractPortFromError } from '../port-utils';

describe('Port Utils', () => {
  describe('extractPortFromError', () => {
    it('should extract port from EADDRINUSE error with port only', () => {
      const error = 'EADDRINUSE: address already in use :::3000';
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should extract port from EADDRINUSE error with IP address', () => {
      const error = 'Error: listen EADDRINUSE: address already in use 0.0.0.0:3000';
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should extract port from simple "Port X is already in use" message', () => {
      const error = 'Port 3000 is already in use';
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should extract port from "port X is already in use by another process"', () => {
      const error = 'port 8080 is already in use by another process';
      const port = extractPortFromError(error);
      expect(port).toBe(8080);
    });

    it('should extract port from "Address already in use" message', () => {
      const error = 'Address already in use: 5432';
      const port = extractPortFromError(error);
      expect(port).toBe(5432);
    });

    it('should extract port from EADDRINUSE with localhost', () => {
      const error = 'EADDRINUSE: address already in use localhost:3000';
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should extract port from EADDRINUSE with 127.0.0.1', () => {
      const error = 'listen EADDRINUSE: address already in use 127.0.0.1:4000';
      const port = extractPortFromError(error);
      expect(port).toBe(4000);
    });

    it('should extract port from error with multiple lines', () => {
      const error = `
        Error starting server
        EADDRINUSE: address already in use :::3000
        at Server.setupListenHandle
      `;
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should extract port from "(EADDRINUSE)" format', () => {
      const error = 'Failed to start: :3000 (EADDRINUSE)';
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should return null for error without port', () => {
      const error = 'Some other error occurred';
      const port = extractPortFromError(error);
      expect(port).toBeNull();
    });

    it('should return null for invalid port number', () => {
      const error = 'Port 999999 is already in use';
      const port = extractPortFromError(error);
      expect(port).toBeNull();
    });

    it('should return null for port 0', () => {
      const error = 'Port 0 is already in use';
      const port = extractPortFromError(error);
      expect(port).toBeNull();
    });

    it('should extract first valid port from multiple ports', () => {
      const error = 'Port 3000 is in use, also port 4000';
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should handle case-insensitive matching', () => {
      const error = 'PORT 3000 is already in use';
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should extract port from Node.js-style error', () => {
      const error = `
        Error: listen EADDRINUSE: address already in use :::3000
            at Server.setupListenHandle [as _listen2] (node:net:1313:16)
            at listenInCluster (node:net:1361:12)
      `;
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should extract port from Vite error message', () => {
      const error = 'Port 5173 is already in use';
      const port = extractPortFromError(error);
      expect(port).toBe(5173);
    });

    it('should extract port from Next.js error message', () => {
      const error = 'Error: Port 3000 is already in use';
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should extract common development ports', () => {
      const testCases = [
        { error: 'Port 3000 is in use', expected: 3000 }, // React/Next.js
        { error: 'Port 8080 is in use', expected: 8080 }, // Common API
        { error: 'Port 5173 is in use', expected: 5173 }, // Vite
        { error: 'Port 4200 is in use', expected: 4200 }, // Angular
        { error: 'Port 8000 is in use', expected: 8000 }, // Python/Django
        { error: 'Port 5000 is in use', expected: 5000 }, // Flask
      ];

      testCases.forEach(({ error, expected }) => {
        expect(extractPortFromError(error)).toBe(expected);
      });
    });

    it('should handle errors with extra whitespace', () => {
      const error = '   Port   3000   is already in use   ';
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });

    it('should extract port from complex error messages', () => {
      const error = `
        Failed to start development server.
        Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
        Please check if another process is already using port 3000.
      `;
      const port = extractPortFromError(error);
      expect(port).toBe(3000);
    });
  });
});

