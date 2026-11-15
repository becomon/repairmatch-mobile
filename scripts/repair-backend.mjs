import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { selectPhoneIp, setMobileApiUrl } from './phone-network.mjs';
import { useExistingDatabasePassword } from './database-credentials.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const backend = path.resolve(root, '../repairmatch-backend');
if (!useExistingDatabasePassword({ syncLocalPassword: process.argv.includes('--sync-local-password') })) {
  throw new Error('Could not inspect the PostgreSQL container. Check Docker access.');
}
const envFile = existsSync(path.join(backend, '.env')) ? path.join(backend, '.env') : path.join(root, '.env.backend.local');
const phoneIp = process.argv.includes('--phone') ? selectPhoneIp(undefined, process.argv.find(arg => arg.startsWith('--ip='))?.slice(5)) : null;
if (phoneIp) process.env.REPAIRMATCH_LAN_IP = phoneIp;
const files = phoneIp ? ['-f', path.join(backend, 'compose.yaml'), '-f', path.join(root, 'compose.phone.yaml')] : [];
const result = spawnSync('docker', ['compose', ...files, '--env-file', envFile, 'up', '-d', '--no-deps', '--force-recreate', 'api'], { cwd: backend, stdio: 'inherit', windowsHide: true });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
console.log('Waiting for the API to respond (up to 90 seconds)...');
const deadline = Date.now() + 90000;
let ready = false;
while (Date.now() < deadline) {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/appliance-types', { signal: AbortSignal.timeout(2000) });
    if ([200, 401].includes(response.status)) { ready = true; break; }
  } catch { /* Spring may still be starting. */ }
  await new Promise(resolve => setTimeout(resolve, 2000));
}
if (!ready) {
  const logs = spawnSync('docker', ['logs', '--tail', '220', 'repairmatch-backend-api-1'], { encoding: 'utf8', windowsHide: true });
  console.error('API did not become ready. Relevant startup errors:');
  const lines = `${logs.stdout || ''}\n${logs.stderr || ''}`.split(/\r?\n/)
    .filter(line => /FATAL|PSQLException|SQLState|Connection refused|UnknownHost|Application run failed|Caused by:/i.test(line));
  for (const line of lines.slice(-15)) console.error(line.replaceAll(process.env.DB_PASSWORD, '[redacted]'));
  process.exit(1);
}
if (phoneIp) {
  const url = setMobileApiUrl(path.join(root, '.env.local'), phoneIp);
  console.log(`API lista. Desde el navegador del celular abre http://${phoneIp}:8080/v3/api-docs`);
  console.log(`Dirección configurada en la app: ${url}`);
  console.log('Inicia Expo con npm start -- --clear --lan y conecta el celular al mismo Wi-Fi.');
} else {
  console.log('API lista. Puedes usar http://localhost:5173 para abrir la web.');
}
