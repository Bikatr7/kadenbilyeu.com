import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const router = readFileSync(resolve('src/Router.tsx'), 'utf8');
const adminPage = readFileSync(resolve('src/pages/AdminPage.tsx'), 'utf8');
const blogPage = readFileSync(resolve('src/pages/BlogPage.tsx'), 'utf8');
const terminalPage = readFileSync(resolve('src/pages/TerminalPage.tsx'), 'utf8');
const packageJson = readFileSync(resolve('package.json'), 'utf8');

assert.equal(
  existsSync(resolve('src/pages/TerminalPage.tsx')),
  true,
  'The authenticated terminal page must remain available',
);
assert.equal(
  router.includes("path: 'admin/terminal'"),
  true,
  'The authenticated terminal route must remain registered',
);
assert.equal(
  adminPage.includes("navigate('/admin/terminal')"),
  true,
  'The admin panel must link to the terminal',
);
assert.equal(
  packageJson.includes('@xterm/xterm'),
  true,
  'The terminal runtime dependency must remain installed',
);
assert.equal(
  terminalPage.includes('rows: term.rows') && terminalPage.includes('cols: term.cols'),
  true,
  'The terminal must send its fitted dimensions when the WebSocket opens',
);
assert.equal(
  adminPage.includes("getURL('/replace-database')"),
  true,
  'The admin panel must expose encrypted database restore',
);
assert.equal(
  blogPage.includes("getURL('/replace-database')"),
  true,
  'The blog admin controls must expose encrypted database restore',
);

console.log('Authenticated terminal and encrypted database restore are present.');
