import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { selectPhoneIp, setMobileApiUrl } from '../scripts/phone-network.mjs';
const address = ip => ({family:'IPv4',internal:false,address:ip});
test('selects Wi-Fi instead of the WSL virtual network',()=>{
  assert.equal(selectPhoneIp({'Wi-Fi':[address('192.168.18.162')], 'vEthernet (WSL)':[address('172.24.64.1')]}),'192.168.18.162');
});
test('rejects nonlocal overrides and ambiguous networks',()=>{
  const networks={Ethernet:[address('192.168.1.2')],Ethernet2:[address('192.168.2.2')]};
  assert.throws(()=>selectPhoneIp(networks));
  assert.throws(()=>selectPhoneIp(networks,'8.8.8.8'));
  assert.equal(selectPhoneIp(networks,'192.168.2.2'),'192.168.2.2');
});
test('updates the API address and preserves Cloudinary settings',()=>{
 const directory=mkdtempSync(path.join(tmpdir(),'repairmatch-phone-'));
 try {
   const file=path.join(directory,'.env.local');
   writeFileSync(file,'EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api\nEXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=synthetic_preset\n');
   assert.equal(setMobileApiUrl(file,'192.168.1.2'),'http://192.168.1.2:8080/api');
   assert.match(readFileSync(file,'utf8'),/EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=synthetic_preset/);
   assert.doesNotMatch(readFileSync(file,'utf8'),/localhost/);
 } finally { unlinkSync(path.join(directory, '.env.local')); rmdirSync(directory); }
});
