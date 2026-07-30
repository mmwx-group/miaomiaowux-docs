import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1200,height:900} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','jimlee','user'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
await p.goto('http://127.0.0.1:12890/', { waitUntil:'networkidle' })
await p.waitForTimeout(1500)
// 平铺,看不同描述长度的卡片是否等高(BETA有描述,某些可能没有)
await p.screenshot({ path:'/tmp/uv/desc.png', clip:{x:40,y:130,width:1120,height:320} })
await b.close()
