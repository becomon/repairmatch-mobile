import { spawnSync } from 'node:child_process';

export function useExistingDatabasePassword({ syncLocalPassword = false, execute = spawnSync } = {}) {
  const inspect = execute('docker', ['inspect', 'repairmatch-backend-postgres-1'], { encoding: 'utf8', windowsHide: true });
  if (inspect.error) throw inspect.error;
  if (inspect.status !== 0) return false;
  const container = JSON.parse(inspect.stdout)[0];
  if (!container.State.Running) throw new Error('Start the existing PostgreSQL container first.');
  const variables = container.Config.Env;
  const value = name => variables.find(entry => entry.startsWith(`${name}=`))?.slice(name.length + 1);
  const password = value('POSTGRES_PASSWORD');
  if (!password || value('POSTGRES_USER') !== 'repairmatch' || value('POSTGRES_DB') !== 'repairmatch') {
    throw new Error('Unexpected database configuration. No credentials or data were changed.');
  }
  function checkNetworkPassword() {
    return execute('docker', ['exec', 'repairmatch-backend-postgres-1', 'sh', '-c',
      'PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -Atc "SELECT 1"'],
      { encoding: 'utf8', windowsHide: true });
  }
  let check = checkNetworkPassword();
  if (check.error) throw check.error;
  if (check.status !== 0 && syncLocalPassword && /password authentication failed/i.test(check.stderr || '')) {
    console.log('Synchronizing the local repairmatch role password with the existing PostgreSQL container configuration.');
    // psql reads the secret from its environment; SQL literal quoting is handled
    // by psql. No password is put in command arguments, output or source files.
    const reset = execute('docker', ['exec', '-i', 'repairmatch-backend-postgres-1',
      'psql', '-X', '-U', 'repairmatch', '-d', 'repairmatch', '-v', 'ON_ERROR_STOP=1'], {
      encoding: 'utf8', windowsHide: true,
      input: "\\getenv repairmatch_password POSTGRES_PASSWORD\nALTER ROLE repairmatch WITH PASSWORD :'repairmatch_password';\n",
    });
    if (reset.error) throw reset.error;
    if (reset.status !== 0) throw new Error('Local password synchronization failed. No database volume was removed.');
    check = checkNetworkPassword();
  }
  if (check.error) throw check.error;
  if (check.status !== 0) {
    const reason = /password authentication failed/i.test(check.stderr || '') ? 'password mismatch'
      : /could not translate host name/i.test(check.stderr || '') ? 'Docker DNS failure'
      : /Connection refused/i.test(check.stderr || '') ? 'connection refused' : 'database connection failure';
    throw new Error(`PostgreSQL network check failed: ${reason}. For a local password mismatch, run npm run backend:repair -- --sync-local-password. No volumes were removed.`);
  }
  process.env.DB_PASSWORD = password;
  console.log('Verified PostgreSQL authentication over the Docker network; reusing credentials for the API.');
  return true;
}
