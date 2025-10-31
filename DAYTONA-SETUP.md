# Daytona Setup Guide

This guide explains how to use Daytona as an alternative to Docker for running the Nurdscode application.

## What is Daytona?

Daytona is a self-hosted development environment manager that provides:
- Standardized development containers
- Easy workspace management
- Alternative to Docker Desktop
- Built-in support for various container runtimes

## Prerequisites

- Linux, macOS, or Windows with WSL2
- Minimum 4GB RAM
- 10GB free disk space

## Installation

### Linux / macOS

```bash
# Install Daytona
curl -sf https://download.daytona.io/daytona/install.sh | sudo sh

# Verify installation
daytona version

# Start Daytona server
daytona server start
```

### Windows (WSL2)

```bash
# In WSL2 terminal
curl -sf https://download.daytona.io/daytona/install.sh | sh

# Add to PATH
export PATH="$HOME/.daytona/bin:$PATH"

# Verify installation
daytona version
```

## Setup Nurdscode with Daytona

### 1. Create Workspace

```bash
# Navigate to project directory
cd /path/to/Nurds_Code_Dot_Com

# Create Daytona workspace
daytona create --name nurdscode-app

# Daytona will automatically:
# - Detect project structure
# - Read .daytona.yaml configuration
# - Set up container environment
```

### 2. Configure Environment

```bash
# Set environment variables
daytona env set VITE_STRIPE_PUBLISHABLE_KEY pk_test_your_key
daytona env set VITE_API_URL http://localhost:8787

# View all environment variables
daytona env list
```

### 3. Start Development Server

```bash
# Start the workspace
daytona start

# This will:
# - Install dependencies
# - Start Vite dev server on port 3000
# - Make the app available at http://localhost:3000
```

### 4. Access the Application

```bash
# Open in browser
daytona open

# Or manually visit
# http://localhost:3000
```

## Running Different Modes

### Development Mode

```bash
# Start development server with hot reload
daytona start --mode dev

# View logs
daytona logs -f
```

### Production Mode

```bash
# Build and run production build
daytona start --mode prod

# Access at http://localhost:80
```

### Worker Development

```bash
# Start Cloudflare Worker locally
daytona exec "npm run worker:dev"

# Worker will be available at http://localhost:8787
```

## Managing Workspaces

### List Workspaces

```bash
# Show all workspaces
daytona list
```

### Stop Workspace

```bash
# Stop current workspace
daytona stop

# Stop specific workspace
daytona stop nurdscode-app
```

### Delete Workspace

```bash
# Remove workspace (keeps project files)
daytona delete nurdscode-app
```

## Building for Production

### Build Container Image

```bash
# Build the application
daytona build

# This creates a container image similar to Docker
```

### Export Image

```bash
# Export as OCI-compatible image
daytona export nurdscode-app:latest -o nurdscode-app.tar

# Load into Docker if needed
docker load < nurdscode-app.tar
```

### Push to Registry

```bash
# Login to Cloudflare Registry
daytona registry login registry.cloudflare.com \
  -u your-email \
  -p your-token

# Tag image
daytona tag nurdscode-app:latest registry.cloudflare.com/nurdscode-userappsandboxservice:custom

# Push to registry
daytona push registry.cloudflare.com/nurdscode-userappsandboxservice:custom
```

## Configuration (.daytona.yaml)

The project includes a `.daytona.yaml` file with pre-configured settings:

```yaml
name: nurdscode-app
container:
  image: node:20-alpine
  workdir: /workspace

build:
  commands:
    - npm ci
    - npm run build

dev:
  command: npm run dev
  port: 3000

ports:
  - 3000  # Development
  - 80    # Production
  - 8787  # Workers
```

## Advantages of Using Daytona

### vs Docker Desktop

- ✅ Lighter weight
- ✅ No licensing restrictions
- ✅ Better integration with IDEs
- ✅ Faster startup times

### vs Native Development

- ✅ Consistent environment across team
- ✅ Easy onboarding for new developers
- ✅ Isolated dependencies
- ✅ Matches production environment

## Troubleshooting

### Daytona command not found

```bash
# Add to PATH
echo 'export PATH="$HOME/.daytona/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Port already in use

```bash
# Check what's using the port
lsof -i :3000

# Stop existing workspace
daytona stop

# Or use different port
daytona start --port 3001
```

### Permission denied

```bash
# Run with sudo
sudo daytona server start

# Or fix permissions
sudo chown -R $USER:$USER ~/.daytona
```

### Cannot connect to Daytona server

```bash
# Restart server
daytona server stop
daytona server start

# Check status
daytona server status
```

## IDE Integration

### VS Code

```bash
# Install Daytona VS Code extension
code --install-extension daytona.daytona

# Open workspace in VS Code
daytona code
```

### JetBrains IDEs

```bash
# Open workspace in IntelliJ/WebStorm
daytona idea
```

## Additional Resources

- [Daytona Documentation](https://www.daytona.io/docs)
- [Daytona GitHub](https://github.com/daytonaio/daytona)
- [Community Support](https://github.com/daytonaio/daytona/discussions)

## Comparison: Docker vs Daytona

| Feature | Docker | Daytona |
|---------|--------|---------|
| Installation | Heavy (~500MB) | Light (~50MB) |
| Startup Time | 5-10 seconds | 1-2 seconds |
| IDE Integration | Manual | Built-in |
| Team Sharing | Dockerfile | .daytona.yaml |
| License | Freemium | Open Source |
| Learning Curve | Moderate | Easy |

## Support

If you encounter issues with Daytona:
1. Check the [troubleshooting section](#troubleshooting) above
2. Visit [Daytona GitHub Issues](https://github.com/daytonaio/daytona/issues)
3. Consult the main [DEPLOYMENT.md](./DEPLOYMENT.md) for alternative approaches
