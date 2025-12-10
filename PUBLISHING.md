# Publishing Guide

This document outlines the process for publishing packages to the `@content-workers` scope on npm.

## Prerequisites

### NPM Token Setup

To publish packages under the `@content-workers` scope, you need to configure your NPM authentication token:

1. **Generate an NPM token** with publish access to the `@content-workers` scope:
   - Log in to [npmjs.com](https://www.npmjs.com)
   - Go to **Access Tokens** in your account settings
   - Generate a new **Automation** or **Publish** token

2. **Configure your environment**:
   
   For local development:
   ```bash
   export NPM_TOKEN=your-npm-token-here
   ```
   
   For CI/CD (GitHub Actions, etc.):
   - Add `NPM_TOKEN` as a secret in your repository settings
   - The `.npmrc` file is already configured to use this token

### .npmrc Configuration

The repository includes an `.npmrc` file with the following configuration:

```
auto-install-peers = true

@content-workers:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

This configuration:
- Enables automatic installation of peer dependencies
- Maps the `@content-workers` scope to the npm registry
- Uses the `NPM_TOKEN` environment variable for authentication

## Scope Verification

Before publishing, always verify that all packages use the correct scope:

```bash
npm run verify:scope
```

This command checks that:
- All workspace packages use the `@content-workers/*` scope
- No lingering `@lucidcms` references exist
- No `file:` protocol links are present in dependencies

## Publishing Packages

### Pre-publish Checklist

1. ✅ Run scope verification: `npm run verify:scope`
2. ✅ Run tests: `npm test`
3. ✅ Run linting: `npm run lint`
4. ✅ Build packages: `npm run build`
5. ✅ Update version numbers in package.json files
6. ✅ Update CHANGELOG.md

### Manual Publishing

From the package directory:

```bash
cd packages/[package-name]
npm publish --access public
```

### Automated Publishing

The repository should be configured with CI/CD to automatically publish packages when:
- A new version tag is pushed (e.g., `v0.12.1-alpha.1`)
- All tests pass
- The `NPM_TOKEN` secret is configured

## Troubleshooting

### Authentication Errors

If you encounter authentication errors:

1. Verify your `NPM_TOKEN` is set correctly:
   ```bash
   echo $NPM_TOKEN
   ```

2. Ensure the token has publish permissions for the `@content-workers` scope

3. Check that the token hasn't expired

### Scope Violations

If `npm run verify:scope` fails:

1. Review the reported violations
2. Update package names to use `@content-workers/*`
3. Remove any `file:` protocol references
4. Replace any `@lucidcms` references with `@content-workers`
5. Run `npm install` to update `package-lock.json`
6. Re-run `npm run verify:scope` to verify fixes

## Package Scope Rules

All workspace packages must follow these rules:

- ✅ Package names: `@content-workers/[package-name]`
- ✅ Workspace dependencies: `@content-workers/*` or external packages
- ❌ No `@lucidcms` references
- ❌ No `file:` protocol links in dependencies
