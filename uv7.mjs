import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1200,height:900} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','jimlee','user'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
const errs=[]; p.on('pageerror', e => errs.push(String(e).slice(0,200)))
await p.goto('http://127.0.0.1:12890/', { waitUntil:'networkidle' })
await p.waitForTimeout(1500)
// 默认:折叠关闭 → 平铺(应显示很多单卡,无 ×13 分组)
console.log('默认平铺,×N分组数:', await p.locator('span:text-matches("×\\\\d+")').count())
console.log('折叠开关:', await p.getByRole('button',{name:/折叠同类|Group same/}).count())
await p.screenshot({ path:'/tmp/uv/flat.png', clip:{x:40,y:130,width:1120,height:280} })
// 开折叠
await p.getByRole('button',{name:/折叠同类|Group same/}).first().click()
await p.waitForTimeout(500)
console.log('折叠后,×N分组数:', await p.locator('span:text-matches("×\\\\d+")').count())
// 开排序
await p.getByRole('button',{name:/^排序|^Sort/}).first().click()
await p.waitForTimeout(400)
console.log('SortableBlock(拖动排序提示):', await p.locator('text=/拖动排序|drag to reorder/').count())
await p.screenshot({ path:'/tmp/uv/dnd.png', clip:{x:40,y:130,width:1120,height:280} })
if(errs.length){console.log('错误:');errs.forEach(e=>console.log('  ',e))} else console.log('无错误')
await b.close()
