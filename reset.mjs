import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1500,height:1100} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','iluobei','admin'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
await p.goto('http://127.0.0.1:12890/licenses', { waitUntil:'domcontentloaded' })
await p.waitForTimeout(2500)
const resetBtn = p.locator('button[title*="重置编号"]')
console.log('重置按钮数量:', await resetBtn.count())
// 定位第一行的操作区，截图
const firstRow = p.locator('.pixel-card, [class*="rounded"]').filter({ has: resetBtn }).first()
await p.screenshot({ path:'/tmp/ot/licenses.png', fullPage:false })
// 单独把一行操作区裁出来
if (await resetBtn.count()) {
  const box = await resetBtn.first().boundingBox()
  if (box) await p.screenshot({ path:'/tmp/ot/actions.png', clip:{ x: box.x-260, y: box.y-14, width: 320, height: 46 } })
}
await b.close()
console.log('done')
