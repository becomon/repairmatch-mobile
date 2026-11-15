import test from 'node:test';
import assert from 'node:assert/strict';
import { useExistingDatabasePassword } from '../scripts/database-credentials.mjs';
const fixture = {State:{Running:true}, Config:{Env:['POSTGRES_USER=repairmatch','POSTGRES_DB=repairmatch','POSTGRES_PASSWORD=synthetic-test-password']}};
const inspected = {status:0,stdout:JSON.stringify([fixture])};

test('checks credentials via Docker service DNS, not trusted loopback', () => {
  const prior = process.env.DB_PASSWORD;
  const calls=[];
  try {
    useExistingDatabasePassword({execute: (_cmd,args) => {calls.push(args); return calls.length === 1 ? inspected : {status:0};}});
    assert.match(calls[1].at(-1), /-h postgres /);
    assert.equal(process.env.DB_PASSWORD, 'synthetic-test-password');
  } finally { if(prior===undefined) delete process.env.DB_PASSWORD; else process.env.DB_PASSWORD=prior; }
});
test('does not change passwords unless the synchronization option is explicit', () => {
  let count=0;
  assert.throws(() => useExistingDatabasePassword({execute:()=> ++count===1 ? inspected : {status:1,stderr:'password authentication failed'}}), /password mismatch/);
  assert.equal(count,2);
});
test('synchronizes only an authentication failure and checks again', () => {
  const prior=process.env.DB_PASSWORD; const calls=[];
  try {
    useExistingDatabasePassword({syncLocalPassword:true,execute:(_cmd,args,options)=>{
      calls.push({args,options});
      return calls.length===1 ? inspected : calls.length===2 ? {status:1,stderr:'password authentication failed'} : {status:0};
    }});
    assert.equal(calls.length,4);
    assert.match(calls[2].options.input,/ALTER ROLE repairmatch/);
    assert.equal(calls[2].args.join(' ').includes('synthetic-test-password'),false);
  } finally { if(prior===undefined) delete process.env.DB_PASSWORD; else process.env.DB_PASSWORD=prior; }
});
test('never changes a password for a network failure', () => {
  let count=0;
  assert.throws(()=>useExistingDatabasePassword({syncLocalPassword:true,execute:()=>++count===1?inspected:{status:1,stderr:'Connection refused'}}),/connection refused/);
  assert.equal(count,2);
});
