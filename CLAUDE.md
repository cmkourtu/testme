# Claude Development Guidelines

## Pre-commit Requirements

Before making any commits, **always** run these commands to ensure code quality:

```bash
# Format code with prettier
pnpm run format

# Check for linting errors
pnpm run lint

# Run tests
pnpm test
```

## Why This Matters

- **Formatting**: Consistent code style across the project
- **Linting**: Catches TypeScript errors and enforces code quality standards
- **Tests**: Ensures functionality works as expected

## Notes

- Pre-commit hooks are skipped in the GitHub Actions workflow
- Manual verification is required before committing
- CI will fail if these checks don't pass
- Use `pnpm run format:check` to check formatting without modifying files
