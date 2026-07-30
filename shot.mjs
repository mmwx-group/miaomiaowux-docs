import { chromium } from 'playwright'
import fs from 'fs'
const tok = fs.readFileSync('/tmp/lotrun/admin.token','utf8').trim()
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1400, height: 1200 } })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:[tok,'admin','admin'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
p.on('console', m => { if (m.type()==='error') console.log('[console]', m.text().slice(0,150)) })
await p.goto('http://127.0.0.1:12890/lottery-admin', { waitUntil:'domcontentloaded' })
await p.waitForTimeout(3000)
console.log('URL:', p.url())
await p.screenshot({ path:'/tmp/lotrun/admin.png', fullPage:true })
console.log('shot ok')
await b.close()
