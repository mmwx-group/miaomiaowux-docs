import { chromium } from 'playwright'
import fs from 'fs'
const tok = fs.readFileSync('/tmp/lotrun/admin.token','utf8').trim()
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1400,height:1200} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:[tok,'admin','admin'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
p.on('response', async r => { if (r.url().includes('/api/')) console.log(r.status(), r.url().replace('http://127.0.0.1:12890','')) })
await p.goto('http://127.0.0.1:12890/lottery-admin', { waitUntil:'domcontentloaded' })
await p.waitForTimeout(2500)
await b.close()
