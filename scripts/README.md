# Scripts

This directory contains utility scripts for the Lucid CMS monorepo.

## verify-scope.js

Verifies that all package.json files in the monorepo use the correct `@content-workers/*` scope.

### Usage

```bash
npm run verify:scope
```

### What it checks

1. **Package names**: Ensures all workspace packages use the `@content-workers/*` scope
2. **Dependencies**: Verifies all internal dependencies reference `@content-workers/*` packages
3. **Forbidden patterns**: Detects and reports:
   - Legacy `@lucidcms` scope references
   - `file:` protocol links in dependencies

### Exit codes

- `0`: All checks passed
- `1`: Violations detected

### Example output

**Success:**
```
✅ All package.json files use the correct scope!
   All workspace packages use @content-workers
   No forbidden patterns (@lucidcms, file:) found
```

**Failure:**
```
❌ Scope verification failed!

Found 2 violation(s):

  ./packages/example/package.json
    Package name uses wrong scope (expected @content-workers)
    Package: @lucidcms/example

  ./packages/example/package.json (dependencies)
    Dependency version contains forbidden pattern "file:"
    Package: some-package
    Version: file:../other-package
```

### When to run

- Before publishing packages
- In CI/CD pipelines to prevent scope violations
- After updating dependencies
- When adding new packages to the monorepo
