# Contributing to Donation Impact Tracker

Thank you for your interest in contributing to the Donation Impact Tracker! This document provides guidelines and best practices for contributing to this project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Pull Request Process](#pull-request-process)
6. [Testing Guidelines](#testing-guidelines)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/kathirt/donationimpacttracker.git
cd donationimpacttracker

# Install dependencies
npm install --force

# Copy environment template
cp .env.template .env.local

# Start development server
npm start
```

## Development Workflow

### Branch Naming Convention
- Feature: `feature/description`
- Bug fix: `fix/description`
- Hotfix: `hotfix/description`
- Documentation: `docs/description`

Example: `feature/add-donor-dashboard`

### Commit Message Format
Follow the conventional commits specification:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(dashboard): add real-time impact updates

Implement WebSocket connection for live donation tracking.
Updates dashboard metrics automatically when new donations arrive.

Closes #123
```

## Code Standards

### TypeScript
- Use strict type checking
- Avoid `any` type
- Define interfaces for all props and data structures
- Document complex type definitions

### React Components
- Use functional components with hooks
- Implement proper cleanup in useEffect
- Use TypeScript for all components
- Follow naming conventions (PascalCase for components)

### CSS
- Use meaningful class names
- Follow BEM naming convention when appropriate
- Ensure responsive design
- Test on multiple screen sizes

### Code Quality Tools
```bash
# Type checking
npm run build

# Format code (if configured)
npm run format

# Lint code
npm run lint
```

## Pull Request Process

### Before Submitting
1. Ensure code builds without errors
2. Test changes locally
3. Update documentation if needed
4. Add/update tests if applicable
5. Check for security vulnerabilities

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code builds successfully
- [ ] No TypeScript errors
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] Follows code standards
```

### Review Process
1. Submit pull request to `main` branch
2. Automated checks must pass
3. At least one approval required
4. Address review feedback
5. Merge when approved

## Testing Guidelines

### Unit Tests (Future Implementation)
```typescript
describe('Component', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});
```

### Manual Testing Checklist
- [ ] Dashboard loads correctly
- [ ] Filters work as expected
- [ ] Map displays impact locations
- [ ] Error handling works properly
- [ ] Responsive design on mobile
- [ ] Accessibility features working

## Security Guidelines

### Sensitive Data
- Never commit credentials or API keys
- Use environment variables
- Review `.gitignore` before committing

### Input Validation
- Validate all user inputs
- Sanitize strings to prevent XSS
- Use validation utilities from `src/utils/validation.ts`

### Dependencies
- Keep dependencies updated
- Run `npm audit` regularly
- Address security vulnerabilities promptly

## Documentation

### Code Comments
```typescript
/**
 * Fetches impact summary data for the dashboard
 * @param filters - Optional filters for data retrieval
 * @returns Promise with ImpactSummary data
 * @throws Error if API request fails
 */
async function fetchImpactSummary(filters?: FilterOptions): Promise<ImpactSummary> {
  // Implementation
}
```

### README Updates
- Update README.md for significant changes
- Include setup instructions for new features
- Document new environment variables

## Getting Help

### Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Azure Maps Docs](https://docs.microsoft.com/en-us/azure/azure-maps/)

### Communication
- GitHub Issues for bugs and features
- GitHub Discussions for questions
- Pull Requests for code review

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project acknowledgments

Thank you for contributing to making nonprofit impact tracking more transparent and accessible!
