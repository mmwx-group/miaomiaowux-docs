import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1200,height:900} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','jimlee','user'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
await p.goto('http://127.0.0.1:12890/', { waitUntil:'networkidle' })
await p.waitForTimeout(1500)
// 展开 BETA 组也看多卡等高
await p.locator('button').filter({ hasText: /×13/ }).first().click()
await p.waitForTimeout(500)
await p.screenshot({ path:'/tmp/uv/card4.png', clip:{x:40,y:130,width:1120,height:340} })
await b.close()
