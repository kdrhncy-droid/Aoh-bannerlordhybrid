import { readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'coverage',
  '.cache',
  'playwright-report',
  'test-results',
]);
const testFilePattern = /\.(?:test|spec)\.(?:ts|tsx|js|jsx|mjs|cjs)$/;
const testFiles = [];

function collectTestFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) collectTestFiles(absolutePath);
    } else if (entry.isFile() && testFilePattern.test(entry.name)) {
      testFiles.push(relative(projectRoot, absolutePath));
    }
  }
}

collectTestFiles(projectRoot);
testFiles.sort();

if (testFiles.length === 0) {
  console.error('Test dosyası bulunamadı (.test.* veya .spec.*).');
  process.exitCode = 1;
} else {
  console.log(`Toplam ${testFiles.length} test dosyası çalıştırılıyor:`);
  for (const file of testFiles) console.log(`- ${file}`);

  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', '--test', ...testFiles],
    { cwd: projectRoot, stdio: 'inherit' }
  );

  if (result.error) {
    console.error(result.error);
    process.exitCode = 1;
  } else {
    process.exitCode = result.status ?? 1;
  }
}
