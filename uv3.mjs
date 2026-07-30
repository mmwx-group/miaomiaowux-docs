import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1200,height:900} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','jimlee','user'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
await p.goto('http://127.0.0.1:12890/', { waitUntil:'networkidle' })
await p.waitForTimeout(1500)
// 切列表视图(拖拽更好演示),开排序
await p.getByTitle(/列表视图|List view/).click()
await p.waitForTimeout(400)
await p.getByRole('button', { name: /排序|Sort/ }).first().click()
await p.waitForTimeout(400)
const order0 = await p.locator('span.font-medium').allTextContents()
console.log('拖前顺序:', order0.filter(x=>x.trim()).slice(0,4))
// 用 dataTransfer 模拟 HTML5 drag: 把第一个块(BETA)拖到第三个(FREE)之后
const blocks = p.locator('[draggable="true"]')
const n = await blocks.count()
console.log('可拖块数:', n)
// playwright dragTo
await blocks.nth(0).dragTo(blocks.nth(2))
await p.waitForTimeout(500)
const order1 = await p.locator('span.font-medium').allTextContents()
console.log('拖后顺序:', order1.filter(x=>x.trim()).slice(0,4))
// localStorage 是否保存
const saved = await p.evaluate(() => localStorage.getItem('mmwx-lic-order'))
console.log('localStorage:', saved)
// 刷新后顺序保持?
await p.reload({ waitUntil:'networkidle' })
await p.waitForTimeout(1200)
const order2 = await p.locator('span.font-medium').allTextContents()
console.log('刷新后顺序:', order2.filter(x=>x.trim()).slice(0,4))
await b.close()
