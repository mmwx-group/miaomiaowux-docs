import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1400,height:1000} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','iluobei','admin'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
const errs = []
p.on('console', m => { if (m.type()==='error') errs.push('[console] '+m.text().slice(0,200)) })
p.on('pageerror', e => errs.push('[pageerror] '+String(e).slice(0,300)))
p.on('response', async r => { if (r.url().includes('/api/') && r.status()>=400) errs.push(`[http ${r.status()}] ${r.url()}`) })
await p.goto('http://127.0.0.1:12890/official-testers', { waitUntil:'domcontentloaded' })
await p.waitForTimeout(2500)
console.log('URL:', p.url())
console.log('页面标题存在:', await p.locator('h2:has-text("官方探测端")').count())
const addBtn = p.locator('button:has-text("添加")')
console.log('添加按钮:', await addBtn.count())
if (await addBtn.count()) {
  await addBtn.first().click()
  await p.waitForTimeout(600)
  console.log('对话框出现:', await p.locator('h3:has-text("添加官方探测端")').count())
  const nameInput = p.locator('input[placeholder*="家宽"]')
  if (await nameInput.count()) {
    await nameInput.fill('浏览器测试端')
    await p.waitForTimeout(200)
    const createBtn = p.locator('button:has-text("创建")')
    console.log('创建按钮 disabled:', await createBtn.first().isDisabled())
    await createBtn.first().click()
    await p.waitForTimeout(1500)
    console.log('token 弹窗出现:', await p.locator('text=接入 token').count())
  } else { console.log('!! 名称输入框找不到') }
}
await p.screenshot({ path:'/tmp/ot/page.png', fullPage:true })
if (errs.length) { console.log('\n错误:'); errs.forEach(e=>console.log(' ', e)) } else console.log('\n无错误')
await b.close()
