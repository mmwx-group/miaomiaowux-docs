import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport:{width:1200,height:900} })
await ctx.addCookies(['mmwx_license_token','mmwx_license_user','mmwx_license_role'].map((n,i)=>(
  { name:n, value:['TK0000000000000000000000','jimlee','user'][i], domain:'127.0.0.1', path:'/' })))
const p = await ctx.newPage()
const errs=[]
p.on('pageerror', e => errs.push(String(e).slice(0,200)))
await p.goto('http://127.0.0.1:12890/', { waitUntil:'networkidle' })
await p.waitForTimeout(1500)
// 卡片视图,看单张卡片底部是否还有空白(截 FREE/贡献者那两张)
await p.screenshot({ path:'/tmp/uv/card2.png', clip:{x:40,y:250,width:1120,height:200} })
// 开启排序模式
const sortBtn = p.getByRole('button', { name: /排序|Sort/ }).first()
console.log('排序按钮:', await sortBtn.count())
await sortBtn.click()
await p.waitForTimeout(500)
await p.screenshot({ path:'/tmp/uv/sortmode.png', fullPage:false })
if(errs.length){console.log('错误:');errs.forEach(e=>console.log('  ',e))} else console.log('无错误')
await b.close()
