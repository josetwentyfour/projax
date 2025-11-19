import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import {
  getDatabaseManager,
  getAllProjects,
  scanProject,
  Project,
} from './core-bridge';
import { getProjectScripts } from './script-runner';

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
      width={60}
    >
      <Text bold color={colors.accentCyan}>
        PROJAX Terminal UI - Help
      </Text>
      <Text> </Text>
      <Text color={colors.accentCyan}>Navigation:</Text>
      <Text>  ↑/k        Move up in project list</Text>
      <Text>  ↓/j        Move down in project list</Text>
      <Text>  Enter      Select project</Text>
      <Text> </Text>
      <Text color={colors.accentCyan}>Actions:</Text>
      <Text>  s          Scan selected project</Text>
      <Text>  p          Scan ports</Text>
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
      width={50}
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
}

const ProjectListComponent: React.FC<ProjectListProps> = ({ projects, selectedIndex }) => {
  return (
    <Box flexDirection="column" width="30%" borderStyle="round" borderColor={colors.borderColor} padding={1}>
      <Text bold color={colors.textPrimary}>
        Projects
      </Text>
      <Text> </Text>
      {projects.length === 0 ? (
        <Text color={colors.textTertiary}>No projects found</Text>
      ) : (
        projects.map((project, index) => {
          const isSelected = index === selectedIndex;
          const desc = project.description || project.path;
          const shortDesc = desc.length > 30 ? desc.substring(0, 27) + '...' : desc;
          
          return (
            <Text key={project.id} color={isSelected ? colors.accentCyan : colors.textPrimary} bold={isSelected}>
              {isSelected ? '▶ ' : '  '}{project.name} - {shortDesc}
            </Text>
          );
        })
      )}
    </Box>
  );
};

interface ProjectDetailsProps {
  project: Project | null;
}

const ProjectDetailsComponent: React.FC<ProjectDetailsProps> = ({ project }) => {
  const [scripts, setScripts] = useState<any>(null);
  const [ports, setPorts] = useState<any[]>([]);

  useEffect(() => {
    if (!project) {
      setScripts(null);
      setPorts([]);
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
  }, [project]);
  
  if (!project) {
    return (
      <Box flexDirection="column" flexGrow={1} borderStyle="round" borderColor={colors.borderColor} padding={1}>
        <Text color={colors.textSecondary}>Select a project to view details</Text>
      </Box>
    );
  }
  
  const lastScanned = project.last_scanned
    ? new Date(project.last_scanned * 1000).toLocaleString()
    : 'Never';

  return (
    <Box flexDirection="column" flexGrow={1} borderStyle="round" borderColor={colors.borderColor} padding={1}>
      <Text bold color={colors.textPrimary}>
        {project.name}
      </Text>
      <Text color={colors.textSecondary}>{project.description || project.path}</Text>
      <Text color={colors.textTertiary}>{project.path}</Text>
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

      {scripts && scripts.scripts && scripts.scripts.size > 0 && (
        <>
          <Text bold>
            Available Scripts (<Text color={colors.accentCyan}>{scripts.scripts.size}</Text>):
          </Text>
          {Array.from(scripts.scripts.entries() as IterableIterator<[string, any]>).map(([name, script]) => (
            <Text key={name}>
              {'  '}
              <Text color={colors.accentGreen}>{name}</Text>
              {' - '}
              {script.command}
            </Text>
          ))}
          <Text> </Text>
        </>
      )}

      {ports.length > 0 && (
        <>
          <Text bold>
            Detected Ports (<Text color={colors.accentCyan}>{ports.length}</Text>):
          </Text>
          {ports.map((port: any) => (
            <Text key={port.id}>
              {'  '}Port <Text color={colors.accentCyan}>{port.port}</Text> - {port.config_source}
            </Text>
          ))}
          <Text> </Text>
        </>
      )}
    </Box>
  );
};

const StatusBar: React.FC = () => {
  return (
    <Box>
      <Text color={colors.accentGreen}>● API CONNECTED</Text>
      <Text color={colors.textSecondary}> | Press </Text>
      <Text bold>q</Text>
      <Text color={colors.textSecondary}> to quit, </Text>
      <Text bold>?</Text>
      <Text color={colors.textSecondary}> for help</Text>
    </Box>
  );
};

const App: React.FC = () => {
  const { exit } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = getAllProjects();
    setProjects(allProjects);
    if (selectedIndex >= allProjects.length) {
      setSelectedIndex(Math.max(0, allProjects.length - 1));
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

    // Navigation
    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => Math.min(projects.length - 1, prev + 1));
      return;
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
          const { scanProjectPorts } = await import('./port-scanner');
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
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="round" borderColor={colors.borderColor} padding={1}>
        <Text bold color={colors.accentCyan}>
          PROJAX
        </Text>
      </Box>
      
      <Box flexDirection="row" marginTop={1}>
        <ProjectListComponent projects={projects} selectedIndex={selectedIndex} />
        <Box width={1} />
        <ProjectDetailsComponent project={selectedProject} />
      </Box>
      
      <Box marginTop={1}>
        <StatusBar />
      </Box>
    </Box>
  );
};

// Render the app
render(<App />);
