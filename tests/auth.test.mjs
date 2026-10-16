import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoAuth, HttpAuth } from '../src/data/auth.js';
import { renderLogin } from '../src/ui/login.js';

const memory=()=>{const values=new Map();return {values,getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};
test('demo login rejects wrong credentials, restores a session without storing a password and logs out',async()=>{
  const storage=memory(),auth=new DemoAuth(storage,()=>1000);
  assert.equal(await auth.restore(),null);
  await assert.rejects(auth.login('admin','wrong'),/账号或密码/);
  assert.equal(await auth.restore(),null);
  const user=await auth.login('admin','Xinghe2026!');
  assert.deepEqual(await new DemoAuth(storage,()=>1001).restore(),user);
  assert.ok(![...storage.values.values()].join('').includes('Xinghe2026!'));
  await auth.logout();assert.equal(await auth.restore(),null);
});
test('expired and malformed demo sessions return to login',async()=>{
  const storage=memory();await new DemoAuth(storage,()=>0).login('admin','Xinghe2026!');
  assert.equal(await new DemoAuth(storage,()=>8*3600000).restore(),null);
  storage.setItem('xinghe-demo-session','invalid');
  assert.equal(await new DemoAuth(storage).restore(),null);
});
test('HTTP auth uses server sessions, passes credentials and installs CSRF token',async()=>{
  const calls=[],repo={request:async(...args)=>{calls.push(args);return {user:{id:'u',name:'员工'},csrfToken:'test-csrf'};}};
  const auth=new HttpAuth(repo);
  assert.equal((await auth.login('employee','test-password')).id,'u');
  assert.deepEqual(calls[0],['/auth/login','POST',{account:'employee',password:'test-password'}]);
  assert.equal(repo.csrfToken,'test-csrf');
  await auth.logout();assert.equal(repo.csrfToken,null);
  repo.request=async()=>{const error=new Error('expired');error.status=401;throw error;};
  assert.equal(await auth.restore(),null);
  repo.request=async()=>{throw new Error('offline');};
  await assert.rejects(auth.restore(),/offline/);
});
test('login provides no registration or demo credentials in HTTP mode',()=>{
  const html=renderLogin('http');
  assert.match(html,/autocomplete="current-password"/);
  assert.doesNotMatch(html,/注册|Xinghe2026|原型演示账号/);
});
