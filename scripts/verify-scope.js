#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const EXPECTED_SCOPE = "@content-workers";
const FORBIDDEN_PATTERNS = ["@lucidcms", "file:"];

const getAliasTarget = (pkg) => {
    return typeof pkg.lucidWorkspaceAliasTarget === "string"
        ? pkg.lucidWorkspaceAliasTarget
        : undefined;
};

function findPackageJsonFiles(baseDir) {
    const packageJsonFiles = [];
    const workspaceDirs = ["packages", "apps", "examples"];

    // Add root package.json
    const rootPackageJson = join(baseDir, "package.json");
    try {
        statSync(rootPackageJson);
        packageJsonFiles.push(rootPackageJson);
    } catch (error) {
        // Root package.json doesn't exist, skip
    }

    // Walk through workspace directories
    for (const workspaceDir of workspaceDirs) {
        const workspacePath = join(baseDir, workspaceDir);
        try {
            const entries = readdirSync(workspacePath);
            for (const entry of entries) {
                const packageJsonPath = join(workspacePath, entry, "package.json");
                try {
                    statSync(packageJsonPath);
                    packageJsonFiles.push(packageJsonPath);
                } catch (error) {
                    // package.json doesn't exist in this subdirectory, skip
                }
            }
        } catch (error) {
            // Workspace directory doesn't exist, skip
        }
    }

    return packageJsonFiles;
}

function checkDependencies(dependencies, context) {
    const violations = [];

    if (!dependencies) {
        return violations;
    }

    for (const [name, version] of Object.entries(dependencies)) {
        // Check for forbidden patterns
        for (const pattern of FORBIDDEN_PATTERNS) {
            if (name.includes(pattern)) {
                violations.push({
                    context,
                    type: "forbidden-package-name",
                    name,
                    version,
                    message: `Dependency name contains forbidden pattern "${pattern}"`,
                });
            }
            if (typeof version === "string" && version.includes(pattern)) {
                violations.push({
                    context,
                    type: "forbidden-version-pattern",
                    name,
                    version,
                    message: `Dependency version contains forbidden pattern "${pattern}"`,
                });
            }
        }

        // Check if it's a workspace package (starts with @) but not the expected scope
        if (name.startsWith("@") && !name.startsWith(EXPECTED_SCOPE)) {
            // Only flag it if it's not a well-known external package
            // We'll be lenient here and only flag packages that look like workspace packages
            const isExternalPackage = !name.startsWith("@lucidcms");
            if (!isExternalPackage) {
                violations.push({
                    context,
                    type: "wrong-scope",
                    name,
                    version,
                    message: `Package uses wrong scope (expected ${EXPECTED_SCOPE})`,
                });
            }
        }
    }

    return violations;
}

function verifyPackageJson(filePath) {
    const violations = [];

    try {
        const content = readFileSync(filePath, "utf-8");
        const pkg = JSON.parse(content);
        const relativePath = filePath.replace(process.cwd(), ".");

        // Check package name
        if (pkg.name && pkg.name.startsWith("@")) {
            const aliasTarget = getAliasTarget(pkg);
            const isAliasPackage = Boolean(aliasTarget);

            if (isAliasPackage && aliasTarget && !aliasTarget.startsWith(EXPECTED_SCOPE)) {
                violations.push({
                    context: relativePath,
                    type: "invalid-alias-target",
                    name: pkg.name,
                    message: `Alias target must start with ${EXPECTED_SCOPE}`,
                });
            }

            // Check for forbidden patterns in name (skip aliases)
            if (!isAliasPackage) {
                for (const pattern of FORBIDDEN_PATTERNS) {
                    if (pkg.name.includes(pattern)) {
                        violations.push({
                            context: relativePath,
                            type: "forbidden-package-name",
                            name: pkg.name,
                            message: `Package name contains forbidden pattern "${pattern}"`,
                        });
                    }
                }
            }

            // Check if it uses the correct scope (only for scoped packages)
            if (
                !isAliasPackage &&
                !pkg.name.startsWith(EXPECTED_SCOPE) &&
                pkg.name.startsWith("@lucidcms")
            ) {
                violations.push({
                    context: relativePath,
                    type: "wrong-package-scope",
                    name: pkg.name,
                    message: `Package name uses wrong scope (expected ${EXPECTED_SCOPE})`,
                });
            }
        }

        // Check all dependency sections
        const depTypes = [
            "dependencies",
            "devDependencies",
            "peerDependencies",
            "optionalDependencies",
        ];

        for (const depType of depTypes) {
            if (pkg[depType]) {
                const depViolations = checkDependencies(
                    pkg[depType],
                    `${relativePath} (${depType})`,
                );
                violations.push(...depViolations);
            }
        }
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
    }

    return violations;
}

function main() {
    const projectRoot = resolve(process.cwd());
    console.log(`🔍 Verifying scope for all package.json files in ${projectRoot}\n`);

    const packageJsonFiles = findPackageJsonFiles(projectRoot);
    console.log(`Found ${packageJsonFiles.length} package.json files\n`);

    let allViolations = [];

    for (const filePath of packageJsonFiles) {
        const violations = verifyPackageJson(filePath);
        allViolations = allViolations.concat(violations);
    }

    if (allViolations.length === 0) {
        console.log("✅ All package.json files use the correct scope!");
        console.log(`   All workspace packages use ${EXPECTED_SCOPE}`);
        console.log(`   No forbidden patterns (${FORBIDDEN_PATTERNS.join(", ")}) found`);
        process.exit(0);
    }

    console.error("❌ Scope verification failed!\n");
    console.error(`Found ${allViolations.length} violation(s):\n`);

    for (const violation of allViolations) {
        console.error(`  ${violation.context}`);
        console.error(`    ${violation.message}`);
        if (violation.name) {
            console.error(`    Package: ${violation.name}`);
        }
        if (violation.version) {
            console.error(`    Version: ${violation.version}`);
        }
        console.error("");
    }

    process.exit(1);
}

main();
