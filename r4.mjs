import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1500,height:1100} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','iluobei','admin'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
const errs=[]
p.on('pageerror', e => errs.push(String(e).slice(0,200)))
await p.goto('http://127.0.0.1:12890/licenses', { waitUntil:'networkidle' })
await p.waitForTimeout(2500)
console.log('列表行数(license卡片):', await p.locator('.font-mono:has-text("MMWX")').count())
console.log('所有按钮数:', await p.locator('button').count())
if(errs.length){console.log('页面错误:'); errs.forEach(e=>console.log('  ',e))}
await p.screenshot({ path:'/tmp/ot/r4.png', fullPage:false })
await b.close()
