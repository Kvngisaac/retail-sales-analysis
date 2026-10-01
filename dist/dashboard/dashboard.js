'use strict';
const D=window.DASHBOARD_DATA;
const C=DashboardCore;
const country=document.getElementById('country'),start=document.getElementById('start-month'),end=document.getElementById('end-month'),measure=document.getElementById('measure'),complete=document.getElementById('complete-only');
const gbp=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:2});
const whole=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0});
const integers=new Intl.NumberFormat('en-GB');
const names={net:'net invoice value',gross:'positive invoice value',credits:'credit / negative-line value'};
const fmt=n=>gbp.format(n/100),short=n=>whole.format(n/100);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function label(month){const [y,m]=month.split('-').map(Number);return new Intl.DateTimeFormat('en-GB',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,1)));}
function state(){return {country:country.value,start:Number(start.value),end:Number(end.value),measure:measure.value,completeOnly:complete.checked};}
let currentView;
function render(){
  const s=state();currentView=C.summarize(D,s);const v=currentView,available=v.eligibleMonths>0;
  document.getElementById('empty-range').hidden=available;
  document.getElementById('export').disabled=!available;
  for(const [id,key]of [['net-kpi','net'],['gross-kpi','gross'],['credit-kpi','credits']])document.getElementById(id).textContent=available?fmt(v.totals[key]):'—';
  document.getElementById('invoice-kpi').textContent=available?integers.format(v.totals.invoices):'—';
  const scope=s.country==='all'?'All countries':D.countries[Number(s.country)];
  const noActivity=available&&v.monthly.every(r=>r.gross===0&&r.credits===0)?' No activity recorded for this country in this period.':'';
  document.getElementById('report-status').textContent=`${scope} · ${label(D.months[s.start].month)} through ${label(D.months[s.end].month)} · ${v.eligibleMonths} included month${v.eligibleMonths===1?'':'s'}${s.completeOnly?' · full months only':''}${noActivity}`;
  document.getElementById('trend-title').textContent='Monthly '+names[s.measure];
  document.getElementById('month-count').textContent=v.eligibleMonths+' months';
  document.getElementById('market-count').textContent=v.markets.length+' markets';
  document.getElementById('product-count').textContent=integers.format(v.productCount)+' eligible SKUs';
  const scale=Math.max(1,...v.monthly.map(r=>Math.abs(C.value(r,s.measure))));
  document.getElementById('monthly-chart').innerHTML=available?v.monthly.map(r=>{
    const amount=C.value(r,s.measure),width=Math.abs(amount)/scale*100;
    return `<button type="button" class="month-row${r.partial?' partial':''}${amount<0?' negative':''}" data-month="${r.index}" aria-label="Inspect ${label(r.month)} only, ${names[s.measure]} ${fmt(amount)}${r.partial?', partial month':''}"><span class="month-label">${label(r.month)}${r.partial?'<small>Partial</small>':''}</span><span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:${width}%"></span></span><span class="month-amount">${short(amount)}</span></button>`;
  }).join(''):'<p class="chart-empty">Choose a period containing an eligible month.</p>';
  const marketScale=Math.max(1,...v.markets.map(r=>Math.abs(C.value(r,s.measure))));
  // Keep a selected country visible even when it falls outside the first eight.
  const visibleMarkets=v.markets.slice(0,8);
  const selected=v.markets.find(r=>String(r.index)===s.country)||(s.country!=='all'&&available?{index:Number(s.country),country:D.countries[Number(s.country)],...v.totals}:null);
  if(selected&&!visibleMarkets.includes(selected))visibleMarkets.push(selected);
  document.getElementById('market-chart').innerHTML=visibleMarkets.length?visibleMarkets.map(r=>{
    const amount=C.value(r,s.measure),active=String(r.index)===s.country;
    return `<li class="market-row${active?' selected':''}${amount<0?' negative':''}"><div class="market-top"><span>${esc(r.country)}${active?'<span class="selected-marker">Selected country</span>':''}</span><strong>${short(amount)}</strong></div><div class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:${Math.abs(amount)/marketScale*100}%"></span></div></li>`;
  }).join(''):'<li class="chart-empty">No value for this measure in the selected period.</li>';
  document.getElementById('products-body').innerHTML=v.products.length?v.products.slice(0,10).map((r,i)=>`<tr><td>${i+1}</td><th scope="row" class="product-name">${esc(r.product)}</th><td class="sku-cell">${esc(r.sku)}</td><td>${fmt(r.gross)}</td><td>${fmt(r.credits)}</td><td class="${r.net<0?'product-negative':''}">${fmt(r.net)}</td></tr>`).join(''):'<tr><td colspan="6" class="chart-empty">No merchandise-like SKU value for this measure in the selected country and period.</td></tr>';
  document.getElementById('monthly-body').innerHTML=v.monthly.map(r=>`<tr><th scope="row">${label(r.month)}${r.partial?' (partial)':''}</th><td>${fmt(r.gross)}</td><td>${fmt(r.credits)}</td><td>${fmt(r.net)}</td><td>${integers.format(r.invoices)}</td></tr>`).join('');
}
country.innerHTML='<option value="all">All countries</option>'+D.countries.map((name,i)=>`<option value="${i}">${esc(name)}</option>`).join('');
const options=D.months.map((m,i)=>`<option value="${i}">${label(m.month)}${m.partial?' (partial)':''}</option>`).join('');
start.innerHTML=options;end.innerHTML=options;
function reset(){country.value='all';start.value='0';end.value=String(D.months.length-1);measure.value='net';complete.checked=false;render();}
start.addEventListener('change',()=>{if(Number(start.value)>Number(end.value))end.value=start.value;render();});
end.addEventListener('change',()=>{if(Number(end.value)<Number(start.value))start.value=end.value;render();});
for(const control of [country,measure,complete])control.addEventListener('change',render);
document.getElementById('reset').addEventListener('click',()=>{reset();country.focus();});
document.getElementById('monthly-chart').addEventListener('click',event=>{const button=event.target.closest('[data-month]');if(button){start.value=button.dataset.month;end.value=button.dataset.month;render();start.focus();}});
document.getElementById('export').addEventListener('click',()=>{
  if(!currentView.eligibleMonths)return;
  const s=state(),csv=C.exportCsv(D,s,currentView);
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=`retail-report-${D.months[s.start].month}-to-${D.months[s.end].month}.csv`;
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
reset();
