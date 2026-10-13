#!/usr/bin/env node
/* IndexNow: tell Bing (and the other IndexNow search engines) which pages changed.
   The same tool as statetestmath.com's, for this Eleventy site.

     node tools/indexnow.js            send pages whose HTML changed since the last send
     node tools/indexnow.js --all      send every page in the sitemap
     node tools/indexnow.js --dry-run  show what would be sent, send nothing

   Run it AFTER a push has deployed. It rebuilds _site/, confirms the key file is live on the site
   (engines reject a submission whose key they can't fetch), then posts the changed URLs to
   https://api.indexnow.org/indexnow. What was sent is recorded in data/indexnow-state.json
   (page -> content hash), so commit that file afterwards.

   Google does not use IndexNow; the sitemap in Google Search Console covers Google. */
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITE = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', '_data', 'site.json'), 'utf8'));
const ORIGIN = SITE.url.replace(/\/$/, '');
const HOST = new URL(ORIGIN).host;
const KEY = fs.readFileSync(path.join(ROOT, 'data', 'indexnow.key'), 'utf8').trim();
const STATE = path.join(ROOT, 'data', 'indexnow-state.json');
const OUT = path.join(ROOT, '_site');
const args = new Set(process.argv.slice(2));

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => { let b = ''; res.on('data', d => { b += d; }); res.on('end', () => resolve({ status: res.statusCode, body: b })); }).on('error', reject);
  });
}
function post(url, payload) {
  const data = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(data) } },
      res => { let b = ''; res.on('data', d => { b += d; }); res.on('end', () => resolve({ status: res.statusCode, body: b })); });
    req.on('error', reject);
    req.end(data);
  });
}
const fingerprint = html => crypto.createHash('sha1').update(html).digest('hex');

async function main() {
  execSync('npx @11ty/eleventy --quiet', { cwd: ROOT, stdio: 'inherit' });
  const sitemap = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
  const next = {}, send = [];
  for (const u of urls) {
    const rel = new URL(u).pathname;
    const file = path.join(OUT, rel.endsWith('/') ? rel + 'index.html' : rel);
    const fp = fs.existsSync(file) ? fingerprint(fs.readFileSync(file)) : 'missing';
    next[rel] = fp;
    if (args.has('--all') || state[rel] !== fp) send.push(u);
  }
  console.log(`${send.length} of ${urls.length} pages to send to IndexNow for ${HOST}`);
  if (!send.length || args.has('--dry-run')) { send.slice(0, 20).forEach(u => console.log('  ' + u)); return; }
  const live = await get(`${ORIGIN}/${KEY}.txt`);
  if (live.status !== 200 || live.body.trim() !== KEY) {
    console.error(`key file not live at ${ORIGIN}/${KEY}.txt (status ${live.status}); push and wait for the deploy first`);
    process.exit(1);
  }
  for (let i = 0; i < send.length; i += 9000) {
    const r = await post('https://api.indexnow.org/indexnow', { host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList: send.slice(i, i + 9000) });
    console.log(`IndexNow answered ${r.status} ${r.body.slice(0, 200)}`);
    if (r.status >= 300) process.exit(1);
  }
  fs.writeFileSync(STATE, JSON.stringify(next, null, 1) + '\n');
  console.log('recorded in data/indexnow-state.json; commit it');
}
main().catch(e => { console.error(e); process.exit(1); });
