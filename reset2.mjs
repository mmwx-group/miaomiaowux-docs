import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1500,height:1100} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','iluobei','admin'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
p.on('dialog', d => d.accept())  // 自动确认 confirm
await p.goto('http://127.0.0.1:12890/licenses', { waitUntil:'domcontentloaded' })
await p.waitForTimeout(2000)
const resetBtn = p.locator('button:has-text("重置编号")')
console.log('重置按钮(带文字):', await resetBtn.count())
await p.screenshot({ path:'/tmp/ot/row2.png', clip:{ x: 1050, y: 195, width: 440, height: 60 } })
// 点第一个，看结果窗口
await resetBtn.first().click()
await p.waitForTimeout(1200)
console.log('结果窗口:', await p.locator('h3:has-text("编号已重置")').count())
await p.screenshot({ path:'/tmp/ot/resetdlg.png' })
await b.close()
console.log('done')
