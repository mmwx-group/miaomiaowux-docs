import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1200,height:1400} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','jimlee','user'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
const errs=[]
p.on('pageerror', e => errs.push(String(e).slice(0,200)))
await p.goto('http://127.0.0.1:12890/', { waitUntil:'networkidle' })
await p.waitForTimeout(2000)
// 分组数量徽章
console.log('分组×N徽章:', await p.locator('span:has-text("×18"), span:text-matches("×\\\\d+")').count())
console.log('卡片视图按钮:', await p.getByTitle(/卡片视图|Card view/).count())
await p.screenshot({ path:'/tmp/uv/card-collapsed.png', fullPage:false })
// 展开第一个分组
const drawer = p.locator('button').filter({ hasText: /×\d+/ }).first()
if (await drawer.count()) { await drawer.click(); await p.waitForTimeout(600) }
await p.screenshot({ path:'/tmp/uv/card-expanded.png', fullPage:false })
// 切列表视图
await p.getByTitle(/列表视图|List view/).click()
await p.waitForTimeout(600)
await p.screenshot({ path:'/tmp/uv/list.png', fullPage:false })
if(errs.length){console.log('页面错误:');errs.forEach(e=>console.log('  ',e))} else console.log('无错误')
await b.close()
