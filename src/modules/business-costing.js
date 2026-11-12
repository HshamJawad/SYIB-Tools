window.initBusinessCostingStudio = function(){

let products=[];
const $=id=>document.getElementById(id);
const val=id=>Math.max(0,Number($(id).value)||0);
const money=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(Number.isFinite(n)?n:0)+' '+$('currency').value;
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
  products[i][k]=k==='name'?e.target.value:Math.max(0,Number(e.target.value)||0);
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
  notice='مثال شركة نادية للنسيج من كتيب ILO، الجزء الثاني، الصفحات المطبوعة 28–45. أُدخلت بيانات المنتجين من سجل التكاليف، واستُخدمت النفقات الشهرية 8,150 درهم للتصنيع غير المباشر و9,770 درهم للنفقات العامة. يعتمد الكتيب نسباً مقربة (0.14 و0.17) في المثال التوضيحي؛ لذلك قد تختلف النتائج عند استخدام النسب الدقيقة.';
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
  notice='تمرين صالون الحلاقة والتجميل من كتيب ILO، الصفحات المطبوعة 84–86. الأعداد الشهرية: 200 تدليك وجه، 100 تدليك قدمين، 150 تدليك جسم. القيم مدخلة من سجل التكاليف: مواد مباشرة 3,200 / 1,200 / 7,200 درهم، وأجور مباشرة 5,000 / 10,000 / 30,000 درهم. النفقات غير المباشرة 11,500 درهم والعامة 28,000 درهم. سعر الخدمة في الجدول مستند إلى بيانات المبيعات بالتمرين.';
 }else if(key==='chair'){
  // SIYB single-product case: Alibaba Chairs, printed pages 50–59.
  products=[{name:'كرسي',units:120,materials:9580,labor:19000,price:400}];
  $('business').value='شركة كراسي علي بابا';$('period').value='شهري';$('currency').value='MAD';
  $('manufacturingOH').value=0;$('generalOH').value=14200;
  notice='مثال شركة كراسي علي بابا من كتيب ILO، الصفحات المطبوعة 50–59. تكلفة المواد الشهرية 9,580 درهم، اليد العاملة 19,000 درهم، النفقات العامة 14,200 درهم، والإنتاج 120 كرسياً. التكلفة الإجمالية الشهرية 42,780 درهماً وتكلفة الكرسي 356.50 درهماً. هذا المثال يستخدم منهج السلعة الواحدة، وليس توزيع التكاليف على منتجات متعددة.';
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
  notice='مثال تجارة التقسيط – مكتبة آسفي، من الصفحات المطبوعة 88–89. متوسط مشتريات البضائع المعدة للبيع 60,000 درهم شهرياً، والنفقات العامة 15,000 درهم؛ أي نسبة نفقات عامة 25%. أسعار شراء الأصناف في الجدول مدخلة كتكلفة مواد للوحدة. في تجارة التقسيط لا تُضاف اليد العاملة إلى معادلة تكلفة السلعة بحسب نموذج الكتيب؛ بل تدخل أجور العاملين ضمن النفقات العامة.';
 }else{
  products=[{name:'منتج 1',units:100,materials:0,labor:0,price:0}];
  $('business').value='مقاولتي';$('period').value='شهري';$('currency').value='IQD';
  $('manufacturingOH').value=0;$('generalOH').value=0;
  notice='أدخل بيانات نشاطك يدوياً. استخدم الفترة المحاسبية نفسها لجميع الأرقام، وتأكد من تصنيف التكاليف وفق طبيعة نشاطك.';
 }
 $('exampleSelect').value=key;
 $('exampleNotice').textContent=notice;
 $('exampleNotice').style.display='block';
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
 if(which==='overheadExercise'){renderOverheadExercise();$('exampleNotice').textContent='تمرين تحميل التكاليف غير المباشرة على المنتجات من الشرائح 59–61 المرفقة.';$('exampleNotice').style.display='block';}
 if(which==='ledger'){renderLedger();$('exampleNotice').textContent='مثال مأخوذ من الشريحة 52 المرفقة: سجل الحسابات الأساسية لشهر تشرين الأول/أكتوبر 2017.';$('exampleNotice').style.display='block';}
 if(which==='depreciation'){renderDepreciation();$('exampleNotice').textContent='مثال مأخوذ من الشريحة 53 المرفقة: سجل الإهلاك/الاندثار بتاريخ 31/12/2017.';$('exampleNotice').style.display='block';}
 if(!on && which==='custom'){$('exampleNotice').style.display='block';}
}
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
  const r=ledgerData[+e.target.dataset.ledger],k=e.target.dataset.key;r[k]=Math.max(0,Number(e.target.value)||0);calcLedger();
 }));
 $('ledgerPrintedTotal').oninput=calcLedger;
 calcLedger();
}
function calcLedger(){
 const visible=ledgerData.reduce((s,r)=>s+r.general,0),printed=Number($('ledgerPrintedTotal').value)||0,gap=printed-visible;
 $('ledgerVisible').textContent=fmt(visible);$('ledgerTotal').textContent=fmt(printed);$('ledgerGap').textContent=fmt(gap);
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
  const r=depreciationData[+e.target.dataset.depr],k=e.target.dataset.key;r[k]=Math.max(0,Number(e.target.value)||0);renderDepreciation();
 }));
 const totals=depreciationData.reduce((a,r)=>{
  const annual=r.life>0?r.purchase/r.life:0,acc=annual*r.months/12;
  a.purchase+=r.purchase;a.annual+=annual;a.acc+=acc;a.book+=r.purchase-acc;return a;
 },{purchase:0,annual:0,acc:0,book:0});
 $('dPurchase').textContent=fmt(totals.purchase);$('dAnnual').textContent=fmt(totals.annual);$('dAccum').textContent=fmt(totals.acc);$('dBook').textContent=fmt(totals.book);
 $('dPurchaseK').textContent=fmt(totals.purchase);$('dAnnualK').textContent=fmt(totals.annual);$('dBookK').textContent=fmt(totals.book);
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
  overheadProducts[+e.target.dataset.ohIndex].direct=Math.max(0,Number(e.target.value)||0);calculateOverheadExercise();
 }));
 $('ohMonthly').oninput=calculateOverheadExercise;$('dmMonthly').oninput=calculateOverheadExercise;
 calculateOverheadExercise();
}
function calculateOverheadExercise(){
 const oh=Math.max(0,Number($('ohMonthly').value)||0),dm=Math.max(0,Number($('dmMonthly').value)||0),rate=dm>0?oh/dm:0;
 $('ohRate').value=dm>0?(rate*100).toFixed(2)+'%':'غير قابل للحساب';
 $('ohRateResult').textContent=dm>0?(rate*100).toFixed(2)+'%':'—';
 overheadProducts.forEach((p,i)=>{const indirect=p.direct*rate,total=p.direct+indirect;$('ohIndirect'+i).textContent=dm>0?indirect.toFixed(2):'—';$('ohTotal'+i).textContent=dm>0?total.toFixed(2):'—';});
 const first=overheadProducts[0].direct;$('ohFirstIndirect').textContent=dm>0?(first*rate).toFixed(2):'—';$('ohFirstTotal').textContent=dm>0?(first*(1+rate)).toFixed(2):'—';
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
  const visibleExpenses=ledgerData.reduce((a,r)=>a+r.general,0),printed=Number($('ledgerPrintedTotal').value)||0;
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
  const oh=Number($('ohMonthly').value)||0,dm=Number($('dmMonthly').value)||0,rate=dm?oh/dm:0;
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
window.loadExample=loadExample; window.addProduct=addProduct; window.removeProduct=removeProduct; window.exportXLSX=exportXLSX;

};
