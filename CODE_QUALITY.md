# Code Quality Guidelines

This document outlines the code quality standards and best practices for the Donation Impact Tracker project.

## Table of Contents
1. [Code Structure](#code-structure)
2. [TypeScript Best Practices](#typescript-best-practices)
3. [React Best Practices](#react-best-practices)
4. [Error Handling](#error-handling)
5. [Testing](#testing)
6. [Performance](#performance)
7. [Accessibility](#accessibility)

## Code Structure

### Directory Organization
```
src/
├── components/        # React components
├── services/          # API and external service integrations
├── types/            # TypeScript type definitions
├── data/             # Mock data and constants
├── utils/            # Utility functions and helpers
└── App.tsx           # Main application component
```

### File Naming Conventions
- React components: PascalCase (e.g., `Dashboard.tsx`)
- Utilities and services: camelCase (e.g., `validation.ts`)
- Types: PascalCase interfaces/types (e.g., `ImpactSummary`)
- CSS files: Match component name (e.g., `Dashboard.css`)

## TypeScript Best Practices

### Type Safety
✅ **DO:**
```typescript
interface UserProps {
  name: string;
  age: number;
}

const User: React.FC<UserProps> = ({ name, age }) => {
  // Implementation
};
```

❌ **DON'T:**
```typescript
const User = (props: any) => {
  // Avoid using 'any' type
};
```

### Interface Definitions
- Use interfaces for component props
- Define return types for functions
- Avoid `any` type unless absolutely necessary
- Use union types for known value sets

```typescript
type ImpactType = 'meals_served' | 'books_distributed' | 'students_supported';
```

## React Best Practices

### Component Structure
1. Import statements
2. Type/Interface definitions
3. Component declaration
4. Hooks (useState, useEffect, etc.)
5. Helper functions
6. Render logic
7. Export statement

### Hooks Best Practices

✅ **DO:**
```typescript
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    const data = await api.getData();
    if (isMounted) {
      setData(data);
    }
  };
  
  fetchData();
  
  return () => {
    isMounted = false;
  };
}, []);
```

❌ **DON'T:**
```typescript
useEffect(() => {
  // Missing cleanup for async operations
  api.getData().then(setData);
}, []);
```

### State Management
- Use `useState` for component-level state
- Use `useCallback` for callback functions passed to child components
- Use `useMemo` for expensive computations
- Avoid unnecessary re-renders

## Error Handling

### ErrorBoundary Component
All major components should be wrapped in ErrorBoundary:

```typescript
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

### API Error Handling
```typescript
try {
  const data = await api.getData();
  setData(data);
} catch (error) {
  console.error('Error fetching data:', error);
  setError('Failed to load data. Please try again.');
}
```

### User-Friendly Error Messages
- Don't expose technical details to users
- Provide actionable error messages
- Log detailed errors to console for debugging

## Testing

### Unit Tests (TODO)
While tests are not currently implemented, follow these guidelines when adding them:

```typescript
describe('ImpactMetrics', () => {
  it('should render correctly with valid data', () => {
    // Test implementation
  });
  
  it('should handle missing data gracefully', () => {
    // Test implementation
  });
});
```

### Test Coverage Goals
- Components: 80% coverage
- Utilities: 90% coverage
- Services: 85% coverage

## Performance

### Code Splitting
Consider implementing lazy loading for routes:

```typescript
const Dashboard = React.lazy(() => import('./components/Dashboard'));
```

### Optimization Techniques
1. Use `React.memo` for expensive components
2. Implement pagination for large data sets
3. Lazy load images and heavy components
4. Minimize bundle size (currently 601 KB)

### Bundle Size Recommendations
- Main bundle should be < 500 KB (gzipped)
- Consider code splitting for routes
- Use dynamic imports for large libraries

## Accessibility

### ARIA Labels
```tsx
<button aria-label="Close dialog" onClick={handleClose}>
  ×
</button>
```

### Keyboard Navigation
- All interactive elements should be keyboard accessible
- Implement proper tab order
- Add keyboard shortcuts for common actions

### Color Contrast
- Ensure text has sufficient contrast (WCAG AA minimum)
- Don't rely solely on color to convey information

### Semantic HTML
```tsx
// ✅ Good
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// ❌ Bad
<div onClick={navigate}>Dashboard</div>
```

## Code Review Checklist

Before submitting code:
- [ ] TypeScript compilation passes without errors
- [ ] All variables and functions have appropriate types
- [ ] No console.log statements in production code
- [ ] Error handling implemented for async operations
- [ ] Components are properly documented
- [ ] No hardcoded credentials or sensitive data
- [ ] Input validation implemented where needed
- [ ] Build succeeds without warnings
- [ ] Code follows project naming conventions
- [ ] Accessibility considerations addressed

## Security Checklist

- [ ] Input sanitization implemented
- [ ] Environment variables used for sensitive data
- [ ] XSS prevention measures in place
- [ ] CSRF protection for forms
- [ ] Dependencies updated and scanned
- [ ] No exposed API keys or secrets

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Azure Maps Documentation](https://docs.microsoft.com/en-us/azure/azure-maps/)
- [OWASP Security Guidelines](https://owasp.org/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
