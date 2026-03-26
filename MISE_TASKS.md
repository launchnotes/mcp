# Mise Task Runner Documentation

This project uses [mise](https://mise.jdx.dev/) for task automation. Mise provides a consistent interface for common development tasks.

## Installation

Install mise if you haven't already:
```bash
curl https://mise.run | sh
```

## Quick Start

```bash
# Install dependencies and build
mise run setup

# Start development with auto-rebuild
mise run dev

# Run all tests
mise run test

# Build the project
mise run build
```

## Available Tasks

### 📦 Build Tasks

| Task | Description | Command |
|------|-------------|---------|
| `build` | Build TypeScript to JavaScript | `mise run build` |
| `clean` | Remove build artifacts | `mise run clean` |
| `rebuild` | Clean and rebuild | `mise run rebuild` |
| `watch` | Auto-rebuild on changes | `mise run watch` |

### 🧪 Testing Tasks

| Task | Description | Command |
|------|-------------|---------|
| `test` | Run all tests | `mise run test` |
| `test:schema` | Validate GraphQL schema | `mise run test:schema` |
| `test:unit` | Run unit tests only | `mise run test:unit` |
| `test:tracking` | Test tracking headers | `mise run test:tracking` |
| `test:watch` | Run tests in watch mode | `mise run test:watch` |
| `test:ci` | Full CI test suite | `mise run test:ci` |

### 🚀 Development Tasks

| Task | Description | Command |
|------|-------------|---------|
| `dev` | Start dev server with auto-rebuild | `mise run dev` |
| `start` | Start the MCP server | `mise run start` |
| `debug` | Start with Node.js debugging | `mise run debug` |
| `setup` | Initial project setup | `mise run setup` |

### 📝 Code Quality

| Task | Description | Command |
|------|-------------|---------|
| `lint` | TypeScript type checking | `mise run lint` |
| `format` | Format code with Prettier | `mise run format` |
| `check` | Run all quality checks | `mise run check` |

### 📤 Deployment Tasks

| Task | Description | Command |
|------|-------------|---------|
| `deploy:dry-run` | Test npm publish | `mise run deploy:dry-run` |
| `deploy:npm` | Publish to npm | `mise run deploy:npm` |
| `deploy:local` | Install locally | `mise run deploy:local` |
| `release` | Create new release | `mise run release` |

### 🔢 Version Management

| Task | Description | Command |
|------|-------------|---------|
| `version:patch` | Bump patch (0.3.0 → 0.3.1) | `mise run version:patch` |
| `version:minor` | Bump minor (0.3.0 → 0.4.0) | `mise run version:minor` |
| `version:major` | Bump major (0.3.0 → 1.0.0) | `mise run version:major` |

### 🛠️ Utility Tasks

| Task | Description | Command |
|------|-------------|---------|
| `info` | Display project info | `mise run info` |
| `tools` | List all MCP tools | `mise run tools` |
| `validate` | Test API connection | `mise run validate` |

### 🔄 Workflows

These are composite tasks that run multiple operations:

| Task | Description | Command |
|------|-------------|---------|
| `workflow:feature` | Setup for new feature | `mise run workflow:feature` |
| `workflow:pr` | Pre-PR checklist | `mise run workflow:pr` |
| `workflow:publish` | Full publish workflow | `mise run workflow:publish` |

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your LaunchNotes API token:
   ```bash
   # Edit .env and add your token
   LAUNCHNOTES_API_TOKEN=your-token-here
   ```

3. Validate your setup:
   ```bash
   mise run validate
   ```

## Common Workflows

### Starting Development
```bash
# Initial setup
mise run setup

# Start development server
mise run dev
```

### Before Creating a PR
```bash
# Run all checks
mise run workflow:pr
```

### Publishing a New Version
```bash
# Create and publish a release
mise run release
mise run deploy:npm
```

### Running Specific Tests
```bash
# Test schema validation
mise run test:schema

# Test tracking headers
mise run test:tracking

# Run all tests
mise run test
```

## Task Dependencies

Many tasks have dependencies that run automatically:
- `test` depends on `build`
- `deploy:npm` depends on `check` and `build`
- `rebuild` runs `clean` then `build`

## Tips

- Use `mise tasks` to see all available tasks
- Tasks are defined in `.mise.toml`
- Most tasks use npm scripts under the hood
- Environment variables are inherited from your shell