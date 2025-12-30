/**
 * OSS ライセンス情報生成スクリプト
 * 
 * package.json の依存関係から licenses.json を生成します。
 * 
 * 使用方法:
 *   bun scripts/generate-licenses.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface License {
  name: string;
  version: string;
  license: string;
  url?: string;
}

interface PackageJson {
  name?: string;
  version?: string;
  license?: string;
  repository?: string | { url?: string };
  homepage?: string;
}

// 除外するパッケージ（devDependenciesや内部パッケージ）
const EXCLUDE_PACKAGES = [
  '@types/',
  'eslint',
  'babel-plugin',
];

// 主要パッケージのみ
const INCLUDE_ONLY = [
  'react',
  'react-native',
  'react-dom',
  'expo',
  '@expo/',
  '@react-navigation/',
  'react-native-',
  'typescript',
];

function shouldInclude(name: string): boolean {
  if (EXCLUDE_PACKAGES.some(prefix => name.startsWith(prefix))) {
    return false;
  }
  return INCLUDE_ONLY.some(prefix => name.startsWith(prefix) || name === prefix);
}

function getRepoUrl(pkg: PackageJson, name: string): string | undefined {
  if (pkg.homepage?.includes('github.com')) {
    return pkg.homepage.replace(/#.*$/, '');
  }
  
  if (pkg.repository) {
    const repoUrl = typeof pkg.repository === 'string' 
      ? pkg.repository 
      : pkg.repository.url;
    
    if (repoUrl) {
      return repoUrl
        .replace(/^git\+/, '')
        .replace(/\.git$/, '')
        .replace(/^git:\/\//, 'https://');
    }
  }
  
  const knownUrls: Record<string, string> = {
    'react': 'https://github.com/facebook/react',
    'react-dom': 'https://github.com/facebook/react',
    'react-native': 'https://github.com/facebook/react-native',
    'typescript': 'https://github.com/microsoft/TypeScript',
  };
  
  if (knownUrls[name]) return knownUrls[name];
  if (name.startsWith('expo') || name.startsWith('@expo/')) {
    return 'https://github.com/expo/expo';
  }
  if (name.startsWith('@react-navigation/')) {
    return 'https://github.com/react-navigation/react-navigation';
  }
  
  return undefined;
}

async function generateLicenses() {
  const projectRoot = join(import.meta.dir, '..');
  const packageJsonPath = join(projectRoot, 'package.json');
  const nodeModulesPath = join(projectRoot, 'node_modules');
  const outputPath = join(projectRoot, 'assets', 'licenses.json');

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = { ...packageJson.dependencies };

  const licenses: License[] = [];

  for (const [name, version] of Object.entries(dependencies)) {
    if (!shouldInclude(name)) continue;

    const pkgPath = join(nodeModulesPath, name, 'package.json');
    
    let license = 'Unknown';
    let url: string | undefined;

    if (existsSync(pkgPath)) {
      try {
        const pkg: PackageJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        license = pkg.license || 'Unknown';
        url = getRepoUrl(pkg, name);
      } catch {
        console.warn('Could not read ' + name);
      }
    }

    licenses.push({ name, version: String(version), license, url });
  }

  licenses.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(outputPath, JSON.stringify(licenses, null, 2));

  console.log('Generated ' + outputPath);
  console.log(licenses.length + ' packages');
  licenses.forEach(l => console.log('  - ' + l.name + ' (' + l.license + ')'));
}

generateLicenses().catch(console.error);
