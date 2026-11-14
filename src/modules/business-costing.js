window.initBusinessCostingStudio = function(){
if(window.SIYBRefreshLocaleDigits)window.SIYBRefreshLocaleDigits(document.getElementById('costingModuleRoot')||document);

let products=[];
const $=id=>document.getElementById(id);
const parseNumber=value=>window.SIYBParseNumber?window.SIYBParseNumber(value):(Number(value)||0);
const val=id=>Math.max(0,parseNumber($(id).value));
const money=n=>new Intl.NumberFormat(document.documentElement.lang==='ar'?'ar-IQ':'en-US',{maximumFractionDigits:2}).format(Number.isFinite(n)?n:0)+' '+$('currency').value;
function fmt(n){return new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(Number.isFinite(n)?n:0)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderProducts(){
 $('products').innerHTML='';
 products.forEach((p,i)=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><input class="name" data-i="${i}" data-k="name" value="${esc(p.name)}" aria-label="اسم المنتج"></td>
  <td><input type="number" min="0" step="1" data-i="${i}" data-k="units" value="${p.units}"></td>
  <td><input type="number" min="0" step=".01" data-i="${i}" data-k="materials" value="${p.materials}"></td>
  <td><input type="number" min="0" step=".01" data-i="${i}" data-k="labor" value="${p.labor}"></td>
  <td><input type="number" min="0" step=".01" data-i="${i}" data-k="price" value="${p.price||''}" placeholder="اختياري"></td>
  <td><button class="del" onclick="removeProduct(${i})" title="حذف المنتج">×</button></td>`;
  $('products').appendChild(tr);
 });
 $('products').querySelectorAll('input').forEach(el=>el.addEventListener('input',e=>{
  const i=+e.target.dataset.i,k=e.target.dataset.k;
  products[i][k]=k==='name'?e.target.value:Math.max(0,parseNumber(e.target.value));
  calculate();
 }));
}
function addProduct(){products.push({name:'منتج جديد',units:0,materials:0,labor:0,price:0});renderProducts();calculate()}
function removeProduct(i){products.splice(i,1);renderProducts();calculate()}
function calculate(){
 const direct=products.reduce((s,p)=>s+p.materials+p.labor,0);
 const mfg=val('manufacturingOH'),general=val('generalOH');
 let mRate=direct>0?mfg/direct:0,gRate=direct>0?general/direct:0;
 // The ILO textile worked example displays and applies rounded rates (0.14 and 0.17).
 if(activeExample==='textile'){mRate=Math.round(mRate*100)/100;gRate=Math.round(gRate*100)/100;}
 const totalUnits=products.reduce((s,p)=>s+p.units,0);
 let totalDirect=0,totalMfg=0,totalGeneral=0,totalCost=0;
 $('results').innerHTML='';
 products.forEach(p=>{
  const valid=p.units>0;
  const mat=valid?p.materials/p.units:0,lab=valid?p.labor/p.units:0,base=mat+lab;
  const mfgUnit=base*mRate,gUnit=base*gRate,full=base+mfgUnit+gUnit;
  const productDirect=p.materials+p.labor;
  const productMfg=productDirect*mRate,productGeneral=productDirect*gRate;
  const profit=p.price>0?p.price-full:null;
  totalDirect+=productDirect;totalMfg+=productMfg;totalGeneral+=productGeneral;totalCost+=productDirect+productMfg+productGeneral;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><b>${esc(p.name||'—')}</b></td><td class="num">${valid?fmt(mat):'—'}</td><td class="num">${valid?fmt(lab):'—'}</td><td class="num">${valid?fmt(mfgUnit):'—'}</td><td class="num">${valid?fmt(gUnit):'—'}</td><td class="num"><b>${valid?fmt(full):'—'}</b></td><td class="num">${p.price>0?fmt(p.price):'—'}</td><td class="num">${profit===null?'—':`<span class="status ${profit<0?'loss':''}">${fmt(profit)}</span>`}</td>`;
  $('results').appendChild(tr);
 });
 const indirect=totalMfg+totalGeneral,all=totalDirect+indirect,avg=totalUnits>0?all/totalUnits:0;
 const pct=n=>all>0?n/all*100:0;
 $('directTotal').textContent=money(direct);
 $('mDirect').textContent=money(totalDirect);$('mIndirect').textContent=money(indirect);$('mTotal').textContent=money(all);$('mUnits').textContent=fmt(totalUnits);
 $('mMRate').textContent=fmt(mRate*100)+'%';$('mGRate').textContent=fmt(gRate*100)+'%';$('mAvg').textContent=money(avg);
 $('pDirect').textContent=fmt(pct(totalDirect))+'%';$('pMfg').textContent=fmt(pct(totalMfg))+'%';$('pGeneral').textContent=fmt(pct(totalGeneral))+'%';
 $('bDirect').style.width=Math.min(100,pct(totalDirect))+'%';$('bMfg').style.width=Math.min(100,pct(totalMfg))+'%';$('bGeneral').style.width=Math.min(100,pct(totalGeneral))+'%';
}
let activeExample='custom';
function loadExample(){
 loadScenario('textile');
}
function loadScenario(key){
 activeExample=key;
 let notice='';
 if(key==='textile'){
  // SIYB handbook: Nadia Textile, September. Two products, direct monthly costs:
  // dust coats: 100 units, materials 30,400, direct labour 4,800.
  // work aprons: 50 units, materials 20,200, direct labour 1,800.
  // total direct costs 57,200; manufacturing OH 8,150; general OH 9,770.
  products=[
   {name:'المعاطف الواقية من الغبار',units:100,materials:30400,labor:4800,price:0},
   {name:'وزرات العمل',units:50,materials:20200,labor:1800,price:0}
  ];
  $('business').value='شركة نادية للنسيج';$('period').value='شهري';$('currency').value='MAD';
  $('manufacturingOH').value=8150;$('generalOH').value=9770;
  // Keep the scenario data available without showing handbook commentary in the user interface.
 }else if(key==='salon'){
  // SIYB exercise: Hair & Beauty Salon, service categories, printed pages 84–86.
  // From ledger: direct materials face 3,200; feet 1,200; body 7,200.
  // Direct labour face 5,000; feet 10,000; body 30,000.
  // Manufacturing overhead 11,500; general expenses 28,000.
  products=[
   {name:'تدليك الوجه',units:200,materials:3200,labor:5000,price:100},
   {name:'تدليك القدمين',units:100,materials:1200,labor:10000,price:80},
   {name:'تدليك الجسم',units:150,materials:7200,labor:30000,price:500}
  ];
  $('business').value='صالون الحلاقة والتجميل';$('period').value='شهري';$('currency').value='MAD';
  $('manufacturingOH').value=11500;$('generalOH').value=28000;
  notice='';
 }else if(key==='chair'){
  // SIYB single-product case: Alibaba Chairs, printed pages 50–59.
  products=[{name:'كرسي',units:120,materials:9580,labor:19000,price:400}];
  $('business').value='شركة كراسي علي بابا';$('period').value='شهري';$('currency').value='MAD';
  $('manufacturingOH').value=0;$('generalOH').value=14200;
  notice='';
 }else if(key==='retail'){
  // SIYB retail example: Asfi bookstore. Monthly purchases 60,000, overhead 15,000.
  products=[
   {name:'أقلام رصاص',units:1,materials:5.2,labor:0,price:0},
   {name:'أقلام حبر أزرق',units:1,materials:10,labor:0,price:0},
   {name:'أقلام تلوين',units:1,materials:60,labor:0,price:0},
   {name:'دفاتر كبيرة',units:1,materials:16,labor:0,price:0},
   {name:'ظرف كبير',units:1,materials:6,labor:0,price:0},
   {name:'ظرف صغير',units:1,materials:14,labor:0,price:0},
   {name:'شريط لاصق',units:1,materials:45.2,labor:0,price:0}
  ];
  $('business').value='مكتبة آسفي';$('period').value='شهري';$('currency').value='MAD';
  $('manufacturingOH').value=0;$('generalOH').value=15000;
  notice='';
 }else{
  products=[{name:'منتج 1',units:100,materials:0,labor:0,price:0}];
  $('business').value='مقاولتي';$('period').value='شهري';$('currency').value='IQD';
  $('manufacturingOH').value=0;$('generalOH').value=0;
  notice='أدخل بيانات نشاطك يدوياً. استخدم الفترة المحاسبية نفسها لجميع الأرقام، وتأكد من تصنيف التكاليف وفق طبيعة نشاطك.';
 }
 $('exampleSelect').value=key;
 $('exampleNotice').textContent=notice;
 $('exampleNotice').style.display=notice?'block':'none';
 renderProducts();calculate();
 toast(key==='custom'?'تم فتح نموذج الإدخال اليدوي':'تم تحميل المثال التدريبي');
}

const ledgerData=[
 {date:'30/10',detail:'راتب – البائع',inside:0,outside:250,general:250},
 {date:'30/10',detail:'راتب – المالك',inside:0,outside:500,general:500},
 {date:'30/10',detail:'مبيعات يومية',inside:520,outside:0,general:0},
 {date:'30/10',detail:'الكهرباء',inside:0,outside:100,general:100},
 {date:'30/10',detail:'النقل',inside:0,outside:180,general:180},
 {date:'30/10',detail:'مشتريات مواد',inside:0,outside:80,general:0},
 {date:'30/10',detail:'من البنك إلى الصندوق',inside:700,outside:0,general:0}
];
const depreciationData=[
 {name:'ماكينة كاش',date:'15/1/2014',purchase:500,life:5,months:47},
 {name:'لوحة مضيئة باسم المحل',date:'15/1/2014',purchase:500,life:5,months:47},
 {name:'جهاز كمبيوتر وطابعة',date:'15/1/2015',purchase:500,life:5,months:35},
 {name:'رفوف',date:'15/1/2016',purchase:1800,life:10,months:23},
 {name:'ثلاجات عرض',date:'15/1/2016',purchase:1500,life:10,months:23}
];
function showSlideExample(which){
 activeExample=which;
 const on=['ledger','depreciation','overheadExercise'].includes(which);
 $('slideExamples').style.display=on?'block':'none';
 $('mainCalculator').style.display=on?'none':'block';
 $('ledgerPanel').style.display=which==='ledger'?'block':'none';
 $('deprPanel').style.display=which==='depreciation'?'block':'none';
 $('overheadPanel').style.display=which==='overheadExercise'?'block':'none';
 // Clear any previous example note whenever the training example changes.
 $('exampleNotice').textContent='';
 $('exampleNotice').style.display='none';
 if(which==='overheadExercise'){renderOverheadExercise();}
 if(which==='ledger'){renderLedger();}
 if(which==='depreciation'){renderDepreciation();}
}
function setBar(id,v){const el=$(id);if(el)el.style.width=Math.max(0,Math.min(100,Number.isFinite(v)?v:0))+'%';}
function pctText(v){return Number.isFinite(v)?v.toFixed(1)+'%':'—';}
function renderLedger(){
 const body=$('ledgerRows');body.innerHTML='';
 ledgerData.forEach((r,i)=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${r.date}</td><td>${r.detail}</td>
   <td><input type="number" min="0" step=".01" value="${r.inside}" data-ledger="${i}" data-key="inside"></td>
   <td><input type="number" min="0" step=".01" value="${r.outside}" data-ledger="${i}" data-key="outside"></td>
   <td><input type="number" min="0" step=".01" value="${r.general}" data-ledger="${i}" data-key="general"></td>`;
  body.appendChild(tr);
 });
 body.querySelectorAll('input').forEach(el=>el.addEventListener('input',e=>{
  const r=ledgerData[+e.target.dataset.ledger],k=e.target.dataset.key;r[k]=Math.max(0,parseNumber(e.target.value));calcLedger();
 }));
 $('ledgerPrintedTotal').oninput=calcLedger;
 calcLedger();
}
function calcLedger(){
 const visible=ledgerData.reduce((s,r)=>s+r.general,0),printed=parseNumber($('ledgerPrintedTotal').value),gap=printed-visible;
 $('ledgerVisible').textContent=fmt(visible);$('ledgerTotal').textContent=fmt(printed);$('ledgerGap').textContent=fmt(gap);
 const cover=printed>0?visible/printed*100:0;
 $('ledgerCount').textContent=fmt(ledgerData.filter(r=>r.general>0).length);
 $('ledgerInside').textContent=fmt(ledgerData.reduce((s,r)=>s+r.inside,0));$('ledgerOutside').textContent=fmt(ledgerData.reduce((s,r)=>s+r.outside,0));
 $('ledgerCover').textContent=printed>0?pctText(cover):'—';setBar('ledgerCoverBar',cover);
 $('ledgerNote').textContent=Math.abs(gap)<0.001?'تطابق الإجمالي المطبوع مع مجموع البنود الظاهرة.':'تنبيه تدقيقي: مجموع البنود الظاهرة في الصورة هو '+fmt(visible)+'، بينما يظهر في خانة الإجمالي '+fmt(printed)+'. الفرق '+fmt(gap)+' لا يمكن تفسيره من الجزء الظاهر؛ لذلك لم أضف معاملات غير موجودة في الصورة.';
}
function renderDepreciation(){
 const body=$('deprRows');body.innerHTML='';
 depreciationData.forEach((r,i)=>{
  const annual=r.life>0?r.purchase/r.life:0,acc=annual*r.months/12,book=r.purchase-acc;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${r.name}</td><td>${r.date}</td>
  <td><input type="number" min="0" step=".1" value="${r.purchase}" data-depr="${i}" data-key="purchase"></td>
  <td><input type="number" min=".1" step=".1" value="${r.life}" data-depr="${i}" data-key="life"></td>
  <td><input type="number" min="0" step="1" value="${r.months}" data-depr="${i}" data-key="months"></td>
  <td class="num">${fmt(annual)}</td><td class="num">${fmt(acc)}</td><td class="num"><b>${fmt(book)}</b></td>`;
  body.appendChild(tr);
 });
 body.querySelectorAll('input').forEach(el=>el.addEventListener('input',e=>{
  const r=depreciationData[+e.target.dataset.depr],k=e.target.dataset.key;r[k]=Math.max(0,parseNumber(e.target.value));renderDepreciation();
 }));
 const totals=depreciationData.reduce((a,r)=>{
  const annual=r.life>0?r.purchase/r.life:0,acc=annual*r.months/12;
  a.purchase+=r.purchase;a.annual+=annual;a.acc+=acc;a.book+=r.purchase-acc;return a;
 },{purchase:0,annual:0,acc:0,book:0});
 $('dPurchase').textContent=fmt(totals.purchase);$('dAnnual').textContent=fmt(totals.annual);$('dAccum').textContent=fmt(totals.acc);$('dBook').textContent=fmt(totals.book);
 $('dPurchaseK').textContent=fmt(totals.purchase);$('dAnnualK').textContent=fmt(totals.annual);$('dBookK').textContent=fmt(totals.book);
 $('dAccumK').textContent=fmt(totals.acc);$('dCount').textContent=fmt(depreciationData.length);
 const pa=totals.purchase>0?totals.acc/totals.purchase*100:0,pb=totals.purchase>0?totals.book/totals.purchase*100:0;
 $('dPctAccum').textContent=totals.purchase>0?pctText(pa):'—';$('dPctBook').textContent=totals.purchase>0?pctText(pb):'—';setBar('dBarAccum',pa);setBar('dBarBook',pb);
}


const overheadProducts=[
 {name:'فول مدمس (باقلاء) علبة وزن 450 غم',direct:0.75},
 {name:'طحين نوع براد وزن 1 كغم',direct:1.00},
 {name:'زيت طبخ نباتي حجم 1.8 لتر',direct:4.50},
 {name:'شاي سيلاني وزن 500 غم',direct:1.50}
];
function renderOverheadExercise(){
 $('ohProducts').innerHTML='';
 overheadProducts.forEach((p,i)=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><b>${p.name}</b></td><td><input type="number" min="0" step=".01" value="${p.direct}" data-oh-index="${i}" aria-label="تكلفة المواد المباشرة للوحدة"></td><td class="num" id="ohIndirect${i}">—</td><td class="num"><b id="ohTotal${i}">—</b></td>`;
  $('ohProducts').appendChild(tr);
 });
 $('ohProducts').querySelectorAll('input').forEach(el=>el.addEventListener('input',e=>{
  overheadProducts[+e.target.dataset.ohIndex].direct=Math.max(0,parseNumber(e.target.value));calculateOverheadExercise();
 }));
 $('ohMonthly').oninput=calculateOverheadExercise;$('dmMonthly').oninput=calculateOverheadExercise;
 calculateOverheadExercise();
}
function calculateOverheadExercise(){
 const oh=Math.max(0,parseNumber($('ohMonthly').value)),dm=Math.max(0,parseNumber($('dmMonthly').value)),rate=dm>0?oh/dm:0;
 $('ohRate').value=dm>0?(rate*100).toFixed(2)+'%':'غير قابل للحساب';
 $('ohRateResult').textContent=dm>0?(rate*100).toFixed(2)+'%':'—';
 if(window.SIYBRefreshLocaleDigits)window.SIYBRefreshLocaleDigits($('overheadPanel'));
 overheadProducts.forEach((p,i)=>{const indirect=p.direct*rate,total=p.direct+indirect;$('ohIndirect'+i).textContent=dm>0?indirect.toFixed(2):'—';$('ohTotal'+i).textContent=dm>0?total.toFixed(2):'—';});
 const first=overheadProducts[0].direct;$('ohFirstIndirect').textContent=dm>0?(first*rate).toFixed(2):'—';$('ohFirstTotal').textContent=dm>0?(first*(1+rate)).toFixed(2):'—';
 $('ohFirstDirect').textContent=first.toFixed(2);$('ohMonthlyK').textContent=fmt(oh);$('dmMonthlyK').textContent=fmt(dm);
 const share=dm>0?rate/(1+rate)*100:0;
 $('ohPctDirect').textContent=dm>0?pctText(100-share):'—';$('ohPctIndirect').textContent=dm>0?pctText(share):'—';setBar('ohBarDirect',dm>0?100-share:0);setBar('ohBarIndirect',share);
}

async function exportXLSX(){
 if(!window.ExcelJS){toast('مكتبة Excel غير متاحة');return;}
 try{
  const wb=new ExcelJS.Workbook();
  wb.creator='SIYB Digital Workshop Tools';
  wb.subject='بيانات وجداول أدوات SIYB';
  wb.title='SIYB Data Export';
  const makeSheet=(name,headers)=>{
   const sh=wb.addWorksheet(name);
   sh.views=[{rightToLeft:true,state:'frozen',ySplit:4}];
   sh.addRow(['SIYB DIGITAL WORKSHOP TOOLS']);
   sh.addRow(['تاريخ التصدير',new Date().toLocaleString('ar-IQ')]);
   sh.addRow([]);
   sh.addRow(headers);
   sh.getRow(1).font={bold:true,size:16,color:{argb:'FFFFFFFF'}};
   sh.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF123D56'}};
   sh.getRow(4).font={bold:true,color:{argb:'FFFFFFFF'}};
   sh.getRow(4).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF245B75'}};
   sh.getRow(4).alignment={vertical:'middle',horizontal:'center',wrapText:true};
   return sh;
  };
  // Sheet 1: the live business costing inputs and calculated unit costs.
  const cost=makeSheet('احتساب التكاليف',['المنتج','الوحدات','المواد المباشرة الإجمالية','العمل المباشر الإجمالي','مواد/وحدة','عمل/وحدة','تصنيع غير مباشر/وحدة','نفقات عامة/وحدة','التكلفة الكاملة/وحدة','سعر البيع','ربح/وحدة']);
  cost.addRow(['المقاولة',$('business').value,'الفترة',$('period').value,'العملة',$('currency').value]);
  const direct=products.reduce((s,p)=>s+p.materials+p.labor,0),mfg=val('manufacturingOH'),gen=val('generalOH');
  let mr=direct?mfg/direct:0,gr=direct?gen/direct:0;
  if(activeExample==='textile'){mr=Math.round(mr*100)/100;gr=Math.round(gr*100)/100;}
  products.forEach(p=>{
   const valid=p.units>0,mat=valid?p.materials/p.units:0,lab=valid?p.labor/p.units:0,base=mat+lab;
   const full=base*(1+mr+gr),profit=p.price>0?p.price-full:null;
   cost.addRow([p.name,p.units,p.materials,p.labor,mat,lab,base*mr,base*gr,full,p.price||null,profit]);
  });
  cost.addRow([]);cost.addRow(['ملخص التكاليف']);cost.addRow(['إجمالي التكاليف المباشرة',direct]);cost.addRow(['نفقات التصنيع غير المباشرة',mfg]);cost.addRow(['النفقات العامة',gen]);cost.addRow(['نسبة نفقات التصنيع غير المباشرة',mr]);cost.addRow(['نسبة النفقات العامة',gr]);cost.addRow(['إجمالي تكلفة الإنتاج',direct+mfg+gen]);
  cost.columns=[{width:34},{width:14},{width:22},{width:22},{width:15},{width:15},{width:22},{width:20},{width:22},{width:14},{width:14}];

  // Sheet 2: editable ledger values and reconciliation.
  const ledger=makeSheet('سجل الحسابات',['التاريخ','التفاصيل','داخل الصندوق','خارج الصندوق','المصروفات العامة']);
  ledger.addRow(['الفترة',$('ledgerPeriod').value]);
  ledgerData.forEach(r=>ledger.addRow([r.date,r.detail,r.inside,r.outside,r.general]));
  const visibleExpenses=ledgerData.reduce((a,r)=>a+r.general,0),printed=parseNumber($('ledgerPrintedTotal').value);
  ledger.addRow([]);ledger.addRow(['إجمالي المصروفات الظاهرة',visibleExpenses]);ledger.addRow(['الإجمالي المطبوع في الشريحة',printed]);ledger.addRow(['الفرق غير المفسر',printed-visibleExpenses]);
  ledger.columns=[{width:18},{width:34},{width:20},{width:20},{width:22}];

  // Sheet 3: depreciation inputs and calculated values.
  const depr=makeSheet('سجل الإهلاك',['العنصر','تاريخ الشراء','قيمة الشراء','العمر التشغيلي (سنة)','أشهر الاستخدام','الإهلاك السنوي','الإهلاك المتراكم','القيمة الدفترية']);
  depreciationData.forEach(r=>{
   const annual=r.life>0?r.purchase/r.life:0,acc=annual*r.months/12;
   depr.addRow([r.name,r.date,r.purchase,r.life,r.months,annual,acc,r.purchase-acc]);
  });
  const dt=depreciationData.reduce((a,r)=>{
   const annual=r.life>0?r.purchase/r.life:0,acc=annual*r.months/12;
   a.purchase+=r.purchase;a.annual+=annual;a.acc+=acc;a.book+=r.purchase-acc;return a;
  },{purchase:0,annual:0,acc:0,book:0});
  depr.addRow([]);depr.addRow(['الإجمالي','',dt.purchase,'','',dt.annual,dt.acc,dt.book]);
  depr.columns=[{width:34},{width:18},{width:18},{width:22},{width:18},{width:18},{width:20},{width:20}];

  // Sheet 4: overhead allocation exercise.
  const ohSheet=makeSheet('تحميل التكاليف',['المنتج','التكلفة المباشرة للوحدة','التكلفة غير المباشرة','التكلفة الكلية']);
  const oh=parseNumber($('ohMonthly').value),dm=parseNumber($('dmMonthly').value),rate=dm?oh/dm:0;
  overheadProducts.forEach(p=>ohSheet.addRow([p.name,p.direct,p.direct*rate,p.direct*(1+rate)]));
  ohSheet.addRow([]);ohSheet.addRow(['النفقات غير المباشرة الشهرية',oh]);ohSheet.addRow(['إجمالي المواد المباشرة الشهرية',dm]);ohSheet.addRow(['نسبة التحميل',rate]);
  ohSheet.columns=[{width:48},{width:24},{width:24},{width:22}];

  wb.eachSheet(sh=>sh.eachRow(row=>row.eachCell(cell=>{
   cell.alignment={vertical:'middle',wrapText:true};
   if(typeof cell.value==='number')cell.numFmt='#,##0.00;[Red]-#,##0.00';
  })));
  const buffer=await wb.xlsx.writeBuffer();
  const blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='SIYB-all-workflows-'+new Date().toISOString().slice(0,10)+'.xlsx';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  toast('تم تصدير جميع بيانات وجداول الأداة إلى ملف Excel واحد');
 }catch(error){
  console.error('SIYB Excel export failed:',error);
  toast('تعذر تصدير البيانات. يرجى المحاولة مرة أخرى.');
 }
}

async function exportPDF(){
 const JsPDF=window.jspdf&&window.jspdf.jsPDF||window.jsPDF;
 const arabic=window.SIYBArabicPDF;
 if(!JsPDF||!arabic){toast('تعذر تحميل مكتبة PDF أو دعم العربية');return;}
 let restore=()=>{};
 try{
  const pdf=new JsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
  restore=suspendJsPdfArabicParser(pdf,JsPDF);
  const font=await arabic.loadArabicFont(pdf);
  if(!font)throw new Error('Arabic Cairo font unavailable');
  pdf.setFont(font,'normal');pdf.setR2L(false);
  const W=pdf.internal.pageSize.getWidth(),H=pdf.internal.pageSize.getHeight();
  const margin=11,usable=W-2*margin;
  let y=35;
  const opts=align=>({align,isInputVisual:true,isOutputVisual:true,isInputRtl:false,isOutputRtl:false});
  const prep=value=>arabic.arabicVisual(String(value??'—'));
  const wrap=(value,width)=>pdf.splitTextToSize(arabic.shapeArabic(String(value??'—')),Math.max(3,width)).map(line=>arabic.bidiVisual(line));
  const text=(value,x,baseline,size=8,align='right',color=[38,57,68])=>{
   pdf.setFont(font,'normal');pdf.setFontSize(size);pdf.setTextColor(...color);
   pdf.text(prep(value),x,baseline,opts(align));
  };
  const line=(value,x,baseline,size=7.5,align='right',color=[38,57,68])=>{
   pdf.setFont(font,'normal');pdf.setFontSize(size);pdf.setTextColor(...color);
   pdf.text(value,x,baseline,opts(align));
  };
  const header=(continuation=false)=>{
   pdf.setFillColor(18,61,86);pdf.rect(0,0,W,24,'F');
   text('SIYB | تقرير البيانات والجداول',W-margin,10,14,'right',[255,255,255]);
   text(continuation?'متابعة التقرير':'أداة ورشة العمل الرقمية',W-margin,18,8,'right',[228,240,246]);
   text('تاريخ التصدير: '+new Date().toLocaleDateString('ar-IQ'),W-margin,30,8);
   y=39;
  };
  const next=()=>{pdf.addPage('a4','landscape');header(true);};
  const fmt=v=>typeof v==='number'?Number(v.toFixed(2)).toLocaleString('en-US',{maximumFractionDigits:2}):v;
  const table=(title,heads,rows,widths)=>{
   if(y>H-42)next();
   text(title,W-margin,y,11,'right',[18,61,86]);y+=5;
   const sum=widths.reduce((a,b)=>a+b,0),ww=widths.map(w=>w*usable/sum);
   const headerLines=heads.map((h,i)=>{pdf.setFontSize(7.2);return wrap(h,ww[i]-3.4);});
   const headerHeight=Math.max(9,...headerLines.map(lines=>lines.length*3.7+3));
   const paintHeader=()=>{
    let x=W-margin;
    heads.forEach((h,i)=>{
     const w=ww[i];x-=w;pdf.setFillColor(36,91,117);pdf.setDrawColor(210,222,229);
     pdf.rect(x,y,w,headerHeight,'FD');
     headerLines[i].forEach((v,k)=>line(v,x+w-1.7,y+3.5+k*3.7,7.2,'right',[255,255,255]));
    });y+=headerHeight;
   };
   paintHeader();
   rows.forEach((row,index)=>{
    pdf.setFontSize(7.2);
    const wrapped=row.map((v,i)=>wrap(v,ww[i]-3.4));
    const height=Math.max(8,...wrapped.map(a=>a.length*3.7+3));
    if(y+height>H-14){next();text(title+' (متابعة)',W-margin,y,10,'right',[18,61,86]);y+=5;paintHeader();}
    let x=W-margin;
    row.forEach((v,i)=>{
     const w=ww[i];x-=w;
     const fill=index%2===0?248:255;
     pdf.setFillColor(fill,index%2===0?251:255,index%2===0?252:255);
     pdf.setDrawColor(218,227,232);pdf.rect(x,y,w,height,'FD');
     wrapped[i].forEach((v,k)=>line(v,x+w-1.7,y+3.6+k*3.7,7.2));
    });
    y+=height;
   });
   y+=7;
  };
  header();
  const direct=products.reduce((a,p)=>a+p.materials+p.labor,0);
  const mfg=val('manufacturingOH'),gen=val('generalOH');
  let mr=direct?mfg/direct:0,gr=direct?gen/direct:0;
  if(activeExample==='textile'){mr=Math.round(mr*100)/100;gr=Math.round(gr*100)/100;}
  table('01 | احتساب التكاليف والمنتجات',
   ['المنتج','الوحدات','المواد المباشرة','العمل المباشر','مواد/وحدة','عمل/وحدة','تصنيع غير مباشر/وحدة','نفقات عامة/وحدة','التكلفة الكاملة/وحدة','سعر البيع','ربح/وحدة'],
   products.map(p=>{
    const mat=p.units>0?p.materials/p.units:0,lab=p.units>0?p.labor/p.units:0,base=mat+lab,full=base*(1+mr+gr);
    return [p.name,p.units,fmt(p.materials),fmt(p.labor),fmt(mat),fmt(lab),fmt(base*mr),fmt(base*gr),fmt(full),p.price||'—',p.price>0?fmt(p.price-full):'—'];
   }),[34,12,25,25,18,18,24,22,24,16,15]);
  table('ملخص التكاليف',['البيان','القيمة'],[
   ['المقاولة',$('business').value],['الفترة المحاسبية',$('period').value],['العملة',$('currency').value],
   ['إجمالي التكاليف المباشرة',fmt(direct)],['نفقات التصنيع غير المباشرة',fmt(mfg)],['النفقات العامة',fmt(gen)],
   ['نسبة نفقات التصنيع غير المباشرة',(mr*100).toFixed(2)+'%'],['نسبة النفقات العامة',(gr*100).toFixed(2)+'%'],
   ['إجمالي تكلفة الإنتاج',fmt(direct+mfg+gen)]
  ],[150,90]);
  const expenses=ledgerData.reduce((a,r)=>a+r.general,0),printed=parseNumber($('ledgerPrintedTotal').value);
  table('02 | سجل الحسابات والحركات',['التاريخ','التفاصيل','داخل الصندوق','خارج الصندوق','المصروفات العامة'],
   ledgerData.map(r=>[r.date,r.detail,fmt(r.inside),fmt(r.outside),fmt(r.general)]),[28,100,48,48,48]);
  table('مطابقة سجل الحسابات',['البيان','القيمة'],[
   ['الفترة',$('ledgerPeriod').value],['إجمالي المصروفات الظاهرة',fmt(expenses)],
   ['الإجمالي المطبوع في الشريحة',fmt(printed)],['الفرق غير المفسر',fmt(printed-expenses)]
  ],[150,90]);
  table('03 | سجل الإهلاك والقيمة الدفترية',
   ['العنصر','تاريخ الشراء','قيمة الشراء','العمر التشغيلي (سنة)','أشهر الاستخدام','الإهلاك السنوي','الإهلاك المتراكم','القيمة الدفترية'],
   depreciationData.map(r=>{
    const annual=r.life>0?r.purchase/r.life:0,acc=annual*r.months/12;
    return [r.name,r.date,fmt(r.purchase),r.life,r.months,fmt(annual),fmt(acc),fmt(r.purchase-acc)];
   }),[42,28,32,35,28,32,35,35]);
  const oh=parseNumber($('ohMonthly').value),dm=parseNumber($('dmMonthly').value),rate=dm?oh/dm:0;
  table('04 | تحميل التكاليف غير المباشرة',
   ['المنتج','التكلفة المباشرة للوحدة','التكلفة غير المباشرة','التكلفة الكلية'],
   overheadProducts.map(p=>[p.name,fmt(p.direct),fmt(p.direct*rate),fmt(p.direct*(1+rate))]),[65,70,70,68]);
  table('ملخص تحميل التكاليف',['البيان','القيمة'],[
   ['النفقات غير المباشرة الشهرية',fmt(oh)],['إجمالي المواد المباشرة الشهرية',fmt(dm)],['نسبة التحميل',(rate*100).toFixed(2)+'%']
  ],[150,90]);
  const count=pdf.getNumberOfPages();
  for(let i=1;i<=count;i++){
   pdf.setPage(i);
   text('صفحة '+i+' من '+count,W-margin,H-5,7,'right',[105,125,135]);
   text('SIYB Digital Workshop Tools',margin,H-5,7,'left',[105,125,135]);
  }
  pdf.save('SIYB-data-report-'+new Date().toISOString().slice(0,10)+'.pdf');
  toast('تم تصدير تقرير PDF النصي');
 }catch(error){
  console.error('SIYB selectable PDF export failed:',error);
  toast('تعذر تصدير PDF؛ يرجى مراجعة الخط أو المحاولة مجدداً');
 }finally{restore();}
}

function suspendJsPdfArabicParser(pdf,JsPDFClass){
 const restores=[];
 try{
  const events=pdf.internal&&pdf.internal.events;
  const topics=events&&typeof events.getTopics==='function'?events.getTopics():null;
  if(topics&&topics.preProcessText){
   Object.keys(topics.preProcessText).forEach(token=>{
    const fn=topics.preProcessText[token][0];
    if(fn===JsPDFClass.API.processArabic||
       (JsPDFClass.API.__arabicParser__&&fn===JsPDFClass.API.__arabicParser__.processArabic)){
     events.unsubscribe(token);
     restores.push(()=>events.subscribe('preProcessText',fn));
    }
   });
  }
 }catch(e){console.warn('[PDF] Could not detach jsPDF Arabic parser event.',e);}
 try{
  const original=JsPDFClass.API.processArabic;
  if(original){
   JsPDFClass.API.processArabic=undefined;
   restores.push(()=>{JsPDFClass.API.processArabic=original;});
  }
 }catch(e){console.warn('[PDF] Could not suspend API.processArabic.',e);}
 return ()=>restores.forEach(fn=>{try{fn();}catch(e){}});
}

function toast(s){
 let t=$('toast');
 if(!t){
  t=document.createElement('div');
  t.id='toast';t.className='toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');
  const root=$('costingModuleRoot')||document.body;root.appendChild(t);
 }
 t.textContent=s;t.classList.add('show');
 clearTimeout(t._hideTimer);
 t._hideTimer=setTimeout(()=>t.classList.remove('show'),2200);
}

['manufacturingOH','generalOH','currency','business','period'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='manufacturingOH'||id==='generalOH')activeExample='custom';calculate()}));
$('exampleSelect').addEventListener('change',e=>{
 const k=e.target.value;
 if(k==='ledger'||k==='depreciation'||k==='overheadExercise'){showSlideExample(k);return;}
 $('slideExamples').style.display='none';$('mainCalculator').style.display='block';
 if(k==='custom'){loadScenario('custom');return;}
 loadScenario(k);
 });
loadExample();
window.loadExample=loadExample; window.addProduct=addProduct; window.removeProduct=removeProduct; window.exportXLSX=exportXLSX; window.exportPDF=exportPDF;

};
