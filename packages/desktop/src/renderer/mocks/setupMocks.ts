import { createMockElectronAPI } from './mockElectronAPI';
import { setupMockFetch } from './mockAPI';

export const setupMocks = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if we're in Electron by checking if electronAPI exists
  // In Electron, electronAPI is set by preload script via contextBridge (read-only)
  // In browser, electronAPI won't exist (unless we're setting it up as a mock)
  const hasElectronAPI = typeof (window as any).electronAPI !== 'undefined';
  
  // Additional check for process type (may not be available with context isolation)
  const hasProcess = typeof (window as any).process !== 'undefined';
  const processType = (window as any).process?.type;
  
  console.log('[MOCK SETUP] Environment check:', {
    hasElectronAPI,
    hasProcess,
    processType,
    electronAPIType: typeof (window as any).electronAPI,
  });
  
  // If electronAPI already exists, we're in Electron - don't try to override it
  if (hasElectronAPI) {
    console.log('⚡ Running in Electron - using real APIs');
    return;
  }
  
  // If we're not in Electron and electronAPI doesn't exist, set up mocks
  if (!hasElectronAPI) {
    console.log('🔧 Setting up mocks for browser development...');
    
    // Setup Electron API mock
    Object.defineProperty(window, 'electronAPI', {
      value: createMockElectronAPI(),
      writable: false,
      configurable: false,
    });
    console.log('✅ Mock ElectronAPI initialized');
    
    // Setup fetch interceptor for API calls
    setupMockFetch();
    console.log('✅ Mock fetch interceptor initialized');
    
    console.log('✅ All mocks initialized. You can now develop in the browser!');
    console.log('📦 Mock data includes:', {
      projects: 3,
      workspaces: 2,
      runningProcesses: 1,
    });
    
    // Verify the mock is working
    if (typeof (window as any).electronAPI?.getProjects === 'function') {
      console.log('✅ Verified: electronAPI.getProjects is available');
    } else {
      console.error('❌ ERROR: electronAPI.getProjects is not available!');
    }
  }
};

