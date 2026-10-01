(function(root){
  'use strict';
  function value(row,measure){return measure==='gross'?row.gross:measure==='credits'?row.credits:row.net;}
  function summarize(data,state){
    const start=Math.max(0,Math.min(data.months.length-1,Number(state.start)));
    const end=Math.max(start,Math.min(data.months.length-1,Number(state.end)));
    const eligible=new Set(data.months.map((m,i)=>i).filter(i=>i>=start&&i<=end&&(!state.completeOnly||!data.months[i].partial)));
    const monthly=[...eligible].map(i=>({index:i,month:data.months[i].month,partial:data.months[i].partial,gross:0,credits:0,net:0,invoices:0}));
    const monthMap=new Map(monthly.map(r=>[r.index,r]));
    const totals={gross:0,credits:0,net:0,invoices:0};
    const markets=new Map();
    for(const row of data.country_month){
      const [month,country,gross,credits,invoices]=row;if(!eligible.has(month))continue;
      if(!markets.has(country))markets.set(country,{index:country,country:data.countries[country],gross:0,credits:0,net:0,invoices:0});
      const market=markets.get(country);market.gross+=gross;market.credits+=credits;market.net+=gross-credits;market.invoices+=invoices;
      if(state.country!=='all'&&country!==Number(state.country))continue;
      const m=monthMap.get(month);m.gross+=gross;m.credits+=credits;m.net+=gross-credits;m.invoices+=invoices;
      totals.gross+=gross;totals.credits+=credits;totals.net+=gross-credits;totals.invoices+=invoices;
    }
    const productMap=new Map();
    for(const row of data.product_segments){
      const [month,country,sku,gross,credits]=row;
      if(!eligible.has(month)||(state.country!=='all'&&country!==Number(state.country)))continue;
      if(!productMap.has(sku))productMap.set(sku,{sku:data.skus[sku][0],product:data.skus[sku][1],gross:0,credits:0,net:0});
      const product=productMap.get(sku);product.gross+=gross;product.credits+=credits;product.net+=gross-credits;
    }
    const measure=['net','gross','credits'].includes(state.measure)?state.measure:'net';
    const compareText=(a,b)=>a<b?-1:a>b?1:0;
    const products=[...productMap.values()].filter(r=>value(r,measure)!==0).sort((a,b)=>value(b,measure)-value(a,measure)||compareText(a.sku,b.sku));
    const rankedMarkets=[...markets.values()].filter(r=>value(r,measure)!==0).sort((a,b)=>value(b,measure)-value(a,measure)||compareText(a.country,b.country));
    return {totals,monthly,markets:rankedMarkets,products,eligibleMonths:eligible.size,productCount:productMap.size};
  }
  function csvText(text){
    let v=String(text??'');if(/^[=+\-@\t\r]/.test(v))v="'"+v;
    return '"'+v.replace(/"/g,'""')+'"';
  }
  function exportCsv(data,state,view){
    const country=state.country==='all'?'All countries':data.countries[Number(state.country)];
    const period=data.months[state.start].month+' through '+data.months[state.end].month+(state.completeOnly?' (full months only)':'');
    const header=['Record type','Period','Country scope','SKU','Description','Positive value GBP','Credit value GBP','Net value GBP','Sale invoices'];
    const lines=[header.map(csvText).join(',')];
    function row(type,periodLabel,scope,sku,description,r){lines.push([type,periodLabel,scope,sku,description].map(csvText).concat([(r.gross/100).toFixed(2),(r.credits/100).toFixed(2),(r.net/100).toFixed(2),r.invoices??'']).join(','));}
    row('Selected totals',period,country,'','All priced lines',view.totals);
    for(const m of view.monthly)row('Selected month',m.month+(m.partial?' (partial)':''),country,'','All priced lines',m);
    for(const market of view.markets)row('Market context',period,market.country,'','All countries in selected period',market);
    for(const product of view.products.slice(0,10))row('Top product by '+state.measure,period,country,product.sku,product.product,product);
    return '\uFEFF'+lines.join('\r\n')+'\r\n';
  }
  const api={summarize,value,exportCsv,csvText};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.DashboardCore=api;
})(typeof globalThis==='object'?globalThis:this);
