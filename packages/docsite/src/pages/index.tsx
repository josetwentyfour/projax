import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.gradientText}>PROJAX</span>
          </h1>
          <p className={styles.heroTagline}>
            The Ultimate Cross-Platform Project Management Dashboard
          </p>
          <p className={styles.heroSubtitle}>
            Powerful CLI, Terminal UI, Desktop App & REST API for managing all your local development projects in one place
          </p>
          <div className={styles.buttons}>
            <Link
              className={styles.primaryButton}
              to="/docs/getting-started/quick-start">
              Get Started →
            </Link>
            <Link
              className={styles.secondaryButton}
              to="https://github.com/josetwentyfour/projax">
              View on GitHub
            </Link>
          </div>
          <span>Install</span>
          <div className={styles.installCommand}>
            <code>npm install -g projax</code>
          </div>
          <span>or try it out</span>
          <div className={styles.installCommand}>
            <code>npx projax@latest</code>
          </div>
        </div>
      </div>
    </header>
  );
}

function Feature({icon, title, description}) {
  return (
    <div className={styles.feature}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresGrid}>
          <Feature
            icon="🚀"
            title="Powerful CLI"
            description="Full-featured command-line interface for managing projects, running scripts, and automating workflows with intelligent script selection."
          />
          <Feature
            icon="🎨"
            title="Terminal UI (Prxi)"
            description="Beautiful interactive terminal interface with vim bindings, real-time updates, and intuitive project navigation."
          />
          <Feature
            icon="🖥️"
            title="Desktop App"
            description="Electron-based desktop application with a modern UI for visual project management and monitoring."
          />
          <Feature
            icon="⚡"
            title="Port Management"
            description="Automatic port detection, conflict resolution, and intelligent port scanning from configuration files."
          />
          <Feature
            icon="🔄"
            title="Background Processes"
            description="Run scripts in the background with process management, log tracking, and automatic port conflict resolution."
          />
          <Feature
            icon="🧪"
            title="Test Detection"
            description="Automatically detects and tracks test files from Jest, Vitest, and Mocha with framework-specific support."
          />
          <Feature
            icon="🌐"
            title="REST API"
            description="Express-based API server for centralized data access, enabling integrations and custom tooling."
          />
          <Feature
            icon="📦"
            title="Multi-Platform"
            description="Support for Node.js, Python, Rust, Go, and Makefile projects with intelligent script detection."
          />
          <Feature
            icon="🔐"
            title="JSON Database"
            description="Lightweight JSON-based database with automatic migrations and cross-platform compatibility."
          />
        </div>
      </div>
    </section>
  );
}

function QuickStart() {
  return (
    <section className={styles.quickStart}>
      <div className="container">
        <h2>Quick Start</h2>
        <div className={styles.quickStartGrid}>
          <div className={styles.quickStartCard}>
            <div className={styles.stepNumber}>1</div>
            <h3>Install</h3>
            <pre><code>npm install -g projax</code></pre>
          </div>
          <div className={styles.quickStartCard}>
            <div className={styles.stepNumber}>2</div>
            <h3>Add Projects</h3>
            <pre><code>prx add ~/my-project --name "My Project"</code></pre>
          </div>
          <div className={styles.quickStartCard}>
            <div className={styles.stepNumber}>3</div>
            <h3>Run & Manage</h3>
            <pre><code>prx list{'\n'}prx 1 dev{'\n'}prx i  # Terminal UI</code></pre>
          </div>
        </div>
        <div className={styles.quickStartCTA}>
          <Link to="/docs/getting-started/quick-start" className={styles.ctaButton}>
            View Full Documentation →
          </Link>
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section className={styles.useCases}>
      <div className="container">
        <h2>Perfect For</h2>
        <div className={styles.useCasesGrid}>
          <div className={styles.useCase}>
            <h3>👨‍💻 Full-Stack Developers</h3>
            <p>Manage multiple frontend, backend, and microservice projects simultaneously</p>
          </div>
          <div className={styles.useCase}>
            <h3>🏢 Development Teams</h3>
            <p>Standardize project workflows and share configurations across team members</p>
          </div>
          <div className={styles.useCase}>
            <h3>🔧 DevOps Engineers</h3>
            <p>Automate local development environments and integrate with CI/CD pipelines</p>
          </div>
          <div className={styles.useCase}>
            <h3>🎓 Educators & Students</h3>
            <p>Organize course projects, assignments, and learning resources efficiently</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Project Management Dashboard`}
      description="Cross-platform project management dashboard with CLI, Terminal UI, Desktop app, and REST API for tracking local development projects">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <QuickStart />
        <UseCases />
      </main>
    </Layout>
  );
}

