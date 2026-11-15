import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { useExistingDatabasePassword } from './database-credentials.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const backend = path.resolve(root, '../repairmatch-backend');

// Compile with an LTS JDK supported by this backend's annotation processors.
// This only changes this command's environment, not the system Java installation.
if (process.platform === 'win32') {
  const candidates = [process.env.JAVA_HOME];
  for (const directory of [
    path.join(process.env.USERPROFILE || '', '.jdks'),
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Java'),
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Eclipse Adoptium'),
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Microsoft'),
  ]) {
    if (existsSync(directory)) {
      candidates.push(...readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isDirectory()).map(entry => path.join(directory, entry.name)));
    }
  }
  const jdks = candidates.filter(Boolean).flatMap(home => {
    try {
      const version = Number(readFileSync(path.join(home, 'release'), 'utf8')
        .match(/JAVA_VERSION="(\d+)/)?.[1]);
      return [17, 21].includes(version) && existsSync(path.join(home, 'bin', 'javac.exe'))
        ? [{ home, version }] : [];
    } catch { return []; }
  }).sort((a, b) => b.version - a.version);
  if (!jdks.length) {
    throw new Error('Install JDK 21 (or 17), then rerun. This backend must not compile with JDK 25/26/27.');
  }
  process.env.JAVA_HOME = jdks[0].home;
  process.env.Path = `${path.join(jdks[0].home, 'bin')};${process.env.Path || ''}`;
  console.log(`Using JDK ${jdks[0].version}: ${jdks[0].home}`);
}
function run(command, args, cwd = backend) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
// Read-only preflight: no containers or credentials are created without a running daemon.
run('docker', ['info', '--format', '{{.ServerVersion}}']);
useExistingDatabasePassword();
const backendEnv = path.join(backend, '.env');
const localEnv = path.join(root, '.env.backend.local');
const envFile = existsSync(backendEnv) ? backendEnv : localEnv;
if (!existsSync(envFile)) {
  writeFileSync(envFile, `DB_PASSWORD=${randomBytes(24).toString('hex')}\nJWT_SECRET=${randomBytes(32).toString('base64')}\n`, { flag: 'wx' });
}
// Build the existing backend without changing its source. This is not a backend test run.
if (process.platform === 'win32') {
  run('cmd.exe', ['/d', '/c', 'mvnw.cmd --batch-mode --no-transfer-progress package -DskipTests']);
} else {
  run('./mvnw', ['--batch-mode', '--no-transfer-progress', 'package', '-DskipTests']);
}
run('docker', ['compose', '--env-file', envFile, 'up', '-d', 'api']);
run('docker', ['compose', '--env-file', envFile, 'ps']);
console.log('Backend starts at http://localhost:8080/api; use the PC LAN IP from your phone.');
