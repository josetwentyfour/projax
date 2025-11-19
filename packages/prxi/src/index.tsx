import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp, useFocus, useFocusManager } from 'ink';
import {
  getDatabaseManager,
  getAllProjects,
  scanProject,
  Project,
} from '../../cli/src/core-bridge';
import { getProjectScripts, getRunningProcessesClean, runScriptInBackground, stopScript } from '../../cli/src/script-runner';

// Color scheme matching desktop app
const colors = {
  bgPrimary: '#0d1117',
  bgSecondary: '#161b22',
  bgTertiary: '#1c2128',
  bgHover: '#21262d',
  borderColor: '#30363d',
  textPrimary: '#c9d1d9',
  textSecondary: '#8b949e',
  textTertiary: '#6e7681',
  accentCyan: '#39c5cf',
  accentBlue: '#58a6ff',
  accentGreen: '#3fb950',
  accentPurple: '#bc8cff',
  accentOrange: '#ffa657',
};

// Helper function to get display path
function getDisplayPath(fullPath: string): string {
  const parts = fullPath.split('/').filter(Boolean);
  if (parts.length === 0) return fullPath;
  
  const lastDir = parts[parts.length - 1];
  
  // If last directory is "src", go one up
  if (lastDir === 'src' && parts.length > 1) {
    return parts[parts.length - 2];
  }
  
  return lastDir;
}

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  useInput((input: string, key: any) => {
    if (input === 'q' || key.escape || key.return) {
      onClose();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accentCyan}
      padding={1}
      width={70}
    >
      <Text bold color={colors.accentCyan}>
        PROJAX Terminal UI - Help
      </Text>
      <Text> </Text>
      <Text color={colors.accentCyan}>Navigation:</Text>
      <Text>  ↑/k        Move up in project list</Text>
      <Text>  ↓/j        Move down in project list</Text>
      <Text>  Tab        Switch between list and details</Text>
      <Text>  ←/→        Switch between list and details</Text>
      <Text> </Text>
      <Text color={colors.accentCyan}>Actions:</Text>
      <Text>  s          Scan selected project for tests</Text>
      <Text>  p          Scan ports for selected project</Text>
      <Text>  r          Show scripts (use CLI to run)</Text>
      <Text>  x          Stop all scripts for project</Text>
      <Text>  d          Delete selected project</Text>
      <Text> </Text>
      <Text color={colors.accentCyan}>General:</Text>
      <Text>  q/Esc      Quit</Text>
      <Text>  ?          Show this help</Text>
      <Text> </Text>
      <Text color={colors.textSecondary}>Press any key to close...</Text>
    </Box>
  );
};

interface LoadingModalProps {
  message: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ message }) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accentCyan}
      padding={1}
      width={40}
    >
      <Text>{message}</Text>
      <Text color={colors.textSecondary}>Please wait...</Text>
    </Box>
  );
};

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  useInput((input: string, key: any) => {
    if (key.escape || key.return) {
      onClose();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="#f85149"
      padding={1}
      width={60}
    >
      <Text color="#f85149" bold>
        Error
      </Text>
      <Text> </Text>
      <Text>{message}</Text>
      <Text> </Text>
      <Text color={colors.textSecondary}>Press any key to close...</Text>
    </Box>
  );
};

interface ProjectListProps {
  projects: Project[];
  selectedIndex: number;
  runningProcesses: any[];
  isFocused: boolean;
}

const ProjectListComponent: React.FC<ProjectListProps> = ({ projects, selectedIndex, runningProcesses, isFocused }) => {
  const { focus } = useFocus({ id: 'projectList' });
  
  return (
    <Box 
      flexDirection="column" 
      width="35%" 
      minHeight={0}
      borderStyle="round" 
      borderColor={isFocused ? colors.accentCyan : colors.borderColor} 
      padding={1}
      flexShrink={0}
    >
      <Text bold color={colors.textPrimary}>
        Projects ({projects.length})
      </Text>
      <Text> </Text>
      {projects.length === 0 ? (
        <Text color={colors.textTertiary}>No projects found</Text>
      ) : (
        projects.map((project, index) => {
          const isSelected = index === selectedIndex;
          const displayPath = project.description || getDisplayPath(project.path);
          const shortDesc = displayPath.length > 25 ? displayPath.substring(0, 22) + '...' : displayPath;
          
          // Check if this project has running scripts
          const projectRunning = runningProcesses.filter(
            (p: any) => p.projectPath === project.path
          );
          const hasRunningScripts = projectRunning.length > 0;
          
          return (
            <Text key={project.id} color={isSelected ? colors.accentCyan : colors.textPrimary} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}
              {hasRunningScripts && <Text color={colors.accentGreen}>● </Text>}
              {project.name}
              {hasRunningScripts && <Text color={colors.accentGreen}> ({projectRunning.length})</Text>}
              {/* <Text color={colors.textSecondary}> - {shortDesc}</Text> */}
            </Text>
          );
        })
      )}
    </Box>
  );
};

interface ProjectDetailsProps {
  project: Project | null;
  runningProcesses: any[];
  isFocused: boolean;
}

const ProjectDetailsComponent: React.FC<ProjectDetailsProps> = ({ project, runningProcesses, isFocused }) => {
  const { focus } = useFocus({ id: 'projectDetails' });
  const [scripts, setScripts] = useState<any>(null);
  const [ports, setPorts] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    if (!project) {
      setScripts(null);
      setPorts([]);
      setTests([]);
      return;
    }

    // Load scripts
    try {
      const projectScripts = getProjectScripts(project.path);
      setScripts(projectScripts);
    } catch (error) {
      setScripts(null);
    }

    // Load ports
    try {
      const db = getDatabaseManager();
      const projectPorts = db.getProjectPorts(project.id);
      setPorts(projectPorts);
    } catch (error) {
      setPorts([]);
    }

    // Load tests
    try {
      const db = getDatabaseManager();
      const projectTests = db.getTestsByProject(project.id);
      setTests(projectTests);
    } catch (error) {
      setTests([]);
    }
  }, [project]);

  if (!project) {
    return (
      <Box 
        flexDirection="column" 
        flexGrow={1} 
        borderStyle="round" 
        borderColor={isFocused ? colors.accentCyan : colors.borderColor} 
        padding={1}
      >
        <Text color={colors.textSecondary}>Select a project to view details</Text>
      </Box>
    );
  }

  const lastScanned = project.last_scanned
    ? new Date(project.last_scanned * 1000).toLocaleString()
    : 'Never';

  // Get running processes for this project
  const projectProcesses = runningProcesses.filter((p: any) => p.projectPath === project.path);

  // Count tests by framework
  const testsByFramework = tests.reduce((acc: any, test: any) => {
    const framework = test.framework || 'unknown';
    acc[framework] = (acc[framework] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box 
      flexDirection="column" 
      flexGrow={1} 
      minHeight={0}
      borderStyle="round" 
      borderColor={isFocused ? colors.accentCyan : colors.borderColor} 
      padding={1}
    >
      <Text bold color={colors.textPrimary}>
        {project.name}
      </Text>
      {project.description && (
        <Text color={colors.textSecondary}>{project.description}</Text>
      )}
      <Text color={colors.textTertiary}>{project.path}</Text>
      <Text> </Text>
      
      {/* Stats */}
      <Box>
        <Text>Tests: <Text color={colors.accentCyan}>{tests.length}</Text></Text>
        <Text> | </Text>
        <Text>Frameworks: <Text color={colors.accentCyan}>{Object.keys(testsByFramework).length}</Text></Text>
        <Text> | </Text>
        <Text>Ports: <Text color={colors.accentCyan}>{ports.length}</Text></Text>
        <Text> | </Text>
        <Text>Scripts: <Text color={colors.accentCyan}>{scripts?.scripts?.size || 0}</Text></Text>
      </Box>
      <Text> </Text>
      
      {project.framework && (
        <>
          <Text>
            Framework: <Text color={colors.accentCyan}>{project.framework}</Text>
          </Text>
        </>
      )}
      
      <Text>Last Scanned: {lastScanned}</Text>
      <Text> </Text>

      {/* Running Processes */}
      {projectProcesses.length > 0 && (
        <>
          <Text bold color={colors.accentGreen}>
            Running Processes ({projectProcesses.length}):
          </Text>
          {projectProcesses.map((process: any) => {
            const uptime = Math.floor((Date.now() - process.startedAt) / 1000);
            const minutes = Math.floor(uptime / 60);
            const seconds = uptime % 60;
            const uptimeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            
            return (
              <Text key={process.pid}>
                {'  '}
                <Text color={colors.accentGreen}>●</Text>
                {' '}
                <Text color={colors.textPrimary}>{process.scriptName}</Text>
                <Text color={colors.textSecondary}> (PID: {process.pid}, {uptimeStr})</Text>
              </Text>
            );
          })}
          <Text> </Text>
        </>
      )}

      {/* Scripts */}
      {scripts && scripts.scripts && scripts.scripts.size > 0 && (
        <>
          <Text bold>
            Available Scripts (<Text color={colors.accentCyan}>{scripts.scripts.size}</Text>):
          </Text>
          {Array.from(scripts.scripts.entries() as IterableIterator<[string, any]>).slice(0, 5).map(([name, script]) => (
            <Text key={name}>
              {'  '}
              <Text color={colors.accentGreen}>{name}</Text>
              {' - '}
              <Text color={colors.textSecondary}>{script.command}</Text>
            </Text>
          ))}
          {scripts.scripts.size > 5 && (
            <Text color={colors.textTertiary}>  ... and {scripts.scripts.size - 5} more</Text>
          )}
          <Text> </Text>
        </>
      )}

      {/* Ports */}
      {ports.length > 0 && (
        <>
          <Text bold>
            Detected Ports (<Text color={colors.accentCyan}>{ports.length}</Text>):
          </Text>
          {ports.slice(0, 5).map((port: any) => (
            <Text key={port.id}>
              {'  '}Port <Text color={colors.accentCyan}>{port.port}</Text>
              <Text color={colors.textSecondary}> - {port.config_source}</Text>
            </Text>
          ))}
          {ports.length > 5 && (
            <Text color={colors.textTertiary}>  ... and {ports.length - 5} more</Text>
          )}
          <Text> </Text>
        </>
      )}

      {/* Test Files */}
      {tests.length > 0 && (
        <>
          <Text bold>
            Test Files (<Text color={colors.accentCyan}>{tests.length}</Text>):
          </Text>
          {Object.entries(testsByFramework).map(([framework, count]) => (
            <Text key={framework}>
              {'  '}
              <Text color={colors.accentPurple}>{framework}</Text>
              {': '}
              <Text color={colors.textSecondary}>{count as number}</Text>
            </Text>
          ))}
          <Text> </Text>
        </>
      )}
    </Box>
  );
};

interface StatusBarProps {
  focusedPanel: 'list' | 'details';
}

const StatusBar: React.FC<StatusBarProps> = ({ focusedPanel }) => {
  return (
    <Box flexDirection="column">
      <Box>
        <Text color={colors.accentGreen}>● API</Text>
        <Text color={colors.textSecondary}> | </Text>
        <Text color={colors.textSecondary}>Focus: </Text>
        <Text color={colors.accentCyan}>{focusedPanel === 'list' ? 'Projects' : 'Details'}</Text>
      </Box>
      <Box>
        <Text bold>↑↓/kj</Text>
        <Text color={colors.textSecondary}> Navigate | </Text>
        <Text bold>Tab/←→</Text>
        <Text color={colors.textSecondary}> Switch Panel | </Text>
        <Text bold>s</Text>
        <Text color={colors.textSecondary}> Scan | </Text>
        <Text bold>p</Text>
        <Text color={colors.textSecondary}> Ports | </Text>
        <Text bold>r</Text>
        <Text color={colors.textSecondary}> Run | </Text>
        <Text bold>x</Text>
        <Text color={colors.textSecondary}> Stop | </Text>
        <Text bold>d</Text>
        <Text color={colors.textSecondary}> Delete | </Text>
        <Text bold>?</Text>
        <Text color={colors.textSecondary}> Help | </Text>
        <Text bold>q</Text>
        <Text color={colors.textSecondary}> Quit</Text>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  const { exit } = useApp();
  const { focusNext, focusPrevious } = useFocusManager();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [runningProcesses, setRunningProcesses] = useState<any[]>([]);
  const [focusedPanel, setFocusedPanel] = useState<'list' | 'details'>('list');

  useEffect(() => {
    loadProjects();
    loadRunningProcesses();
    
    // Refresh running processes every 5 seconds
    const interval = setInterval(() => {
      loadRunningProcesses();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadProjects = () => {
    const allProjects = getAllProjects();
    setProjects(allProjects);
    if (selectedIndex >= allProjects.length) {
      setSelectedIndex(Math.max(0, allProjects.length - 1));
    }
  };

  const loadRunningProcesses = async () => {
    try {
      const processes = await getRunningProcessesClean();
      setRunningProcesses(processes);
    } catch (error) {
      setRunningProcesses([]);
    }
  };

  const selectedProject = projects.length > 0 ? projects[selectedIndex] : null;

  useInput((input: string, key: any) => {
    // Don't process input if modal is showing
    if (showHelp || isLoading || error) {
      return;
    }

    // Quit
    if (input === 'q' || key.escape) {
      exit();
      return;
    }

    // Help
    if (input === '?') {
      setShowHelp(true);
      return;
    }

    // Switch panels with Tab or Left/Right arrows
    if (key.tab || key.leftArrow || key.rightArrow) {
      setFocusedPanel((prev) => prev === 'list' ? 'details' : 'list');
      return;
    }

    // Navigation (only when focused on list)
    if (focusedPanel === 'list') {
      if (key.upArrow || input === 'k') {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        return;
      }

      if (key.downArrow || input === 'j') {
        setSelectedIndex((prev) => Math.min(projects.length - 1, prev + 1));
        return;
      }
    }

    // Scan project
    if (input === 's' && selectedProject) {
      setIsLoading(true);
      setLoadingMessage(`Scanning ${selectedProject.name}...`);
      
      setTimeout(async () => {
        try {
          await scanProject(selectedProject.id);
          loadProjects();
          setIsLoading(false);
        } catch (err) {
          setIsLoading(false);
          setError(err instanceof Error ? err.message : String(err));
        }
      }, 100);
      return;
    }

    // Scan ports
    if (input === 'p' && selectedProject) {
      setIsLoading(true);
      setLoadingMessage(`Scanning ports for ${selectedProject.name}...`);
      
      setTimeout(async () => {
        try {
          // Import port scanner dynamically
          const { scanProjectPorts } = await import('../../cli/src/port-scanner');
          await scanProjectPorts(selectedProject.id);
          loadProjects();
          setIsLoading(false);
        } catch (err) {
          setIsLoading(false);
          setError(err instanceof Error ? err.message : String(err));
        }
      }, 100);
      return;
    }

    // Run script
    if (input === 'r' && selectedProject) {
      setIsLoading(true);
      setLoadingMessage('Select script to run...');
      
      setTimeout(async () => {
        try {
          const projectScripts = getProjectScripts(selectedProject.path);
          if (projectScripts.scripts.size === 0) {
            setIsLoading(false);
            setError(`No scripts found in ${selectedProject.name}`);
            return;
          }
          
          setIsLoading(false);
          
          // For now, just show error to select a script
          const scriptList = Array.from(projectScripts.scripts.keys()).join(', ');
          setError(`Use CLI to run scripts: prx run ${selectedProject.name} <script>\nAvailable: ${scriptList}`);
        } catch (err) {
          setIsLoading(false);
          setError(err instanceof Error ? err.message : String(err));
        }
      }, 100);
      return;
    }

    // Stop all scripts for project
    if (input === 'x' && selectedProject) {
      setIsLoading(true);
      setLoadingMessage(`Stopping scripts for ${selectedProject.name}...`);
      
      setTimeout(async () => {
        try {
          const projectProcesses = runningProcesses.filter((p: any) => p.projectPath === selectedProject.path);
          if (projectProcesses.length === 0) {
            setIsLoading(false);
            setError(`No running scripts for ${selectedProject.name}`);
            return;
          }
          
          for (const proc of projectProcesses) {
            await stopScript(proc.pid);
          }
          
          await loadRunningProcesses();
          setIsLoading(false);
        } catch (err) {
          setIsLoading(false);
          setError(err instanceof Error ? err.message : String(err));
        }
      }, 100);
      return;
    }

    // Delete project
    if (input === 'd' && selectedProject) {
      setError('Project deletion not yet implemented in terminal UI. Use the desktop app or CLI.');
      return;
    }
  });

  if (showHelp) {
    return (
      <Box flexDirection="column" padding={1}>
        <HelpModal onClose={() => setShowHelp(false)} />
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <LoadingModal message={loadingMessage} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <ErrorModal message={error} onClose={() => setError(null)} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" minHeight={0} flexGrow={1}>
        <ProjectListComponent 
          projects={projects} 
          selectedIndex={selectedIndex} 
          runningProcesses={runningProcesses}
          isFocused={focusedPanel === 'list'}
        />
        <Box width={1} />
        <ProjectDetailsComponent 
          project={selectedProject} 
          runningProcesses={runningProcesses}
          isFocused={focusedPanel === 'details'}
        />
      </Box>
      
      <Box paddingX={1} borderStyle="single" borderColor={colors.borderColor} flexShrink={0}>
        <StatusBar focusedPanel={focusedPanel} />
      </Box>
    </Box>
  );
};

// Render the app
render(<App />);
