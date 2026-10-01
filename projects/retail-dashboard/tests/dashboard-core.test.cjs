const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const project=path.resolve(__dirname,'..');
const root=fs.existsSync(path.join(project,'dashboard-core.js'))?project:path.resolve(project,'../../dist/dashboard');
const C=require(path.join(root,'dashboard-core.js'));
const fixture={countries:['A','B'],months:[{month:'2011-01',partial:false},{month:'2011-02',partial:true}],skus:[['01','Item A'],['02','Item B']],country_month:[[0,0,10000,1000,1],[0,1,2000,500,1],[1,0,3000,5000,1]],product_segments:[[0,0,0,6000,500],[0,0,1,4000,500],[0,1,0,2000,500],[1,0,1,3000,5000]]};
const state={country:'all',start:0,end:1,measure:'net',completeOnly:false};
let v=C.summarize(fixture,state);
assert.deepEqual(v.totals,{gross:15000,credits:6500,net:8500,invoices:3});
assert.deepEqual(v.products.map(r=>[r.sku,r.net]),[['01',7000],['02',1500]]);
v=C.summarize(fixture,{...state,country:'0',start:1,end:1});
assert.equal(v.totals.net,-2000);assert.equal(v.markets[0].country,'A');
v=C.summarize(fixture,{...state,country:'0',start:1,end:1,completeOnly:true});
assert.equal(v.eligibleMonths,0);assert.equal(v.products.length,0);
v=C.summarize(fixture,{...state,measure:'credits'});
assert.equal(v.products[0].sku,'02');assert.equal(v.products[0].credits,5500);
const csv=C.exportCsv(fixture,state,C.summarize(fixture,state));
assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('Market context'));assert.ok(csv.includes('2011-02 (partial)'));assert.ok(csv.includes('150.00,65.00,85.00,3'));
assert.equal(C.csvText('=1+1'),'"\'=1+1"');assert.equal(C.csvText('a,"b"'),'"a,""b"""');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),sandbox);
const data=sandbox.window.DASHBOARD_DATA;
const controls=JSON.parse(fs.readFileSync(path.join(__dirname,'sql-controls.json'),'utf8'));
let checked=0,productViews=0;
for(const control of controls){
 for(const measure of ['net','gross','credits']){
  const result=C.summarize(data,{...control.state,measure});
  assert.deepEqual(result.totals,control.totals,JSON.stringify(control.state));
  assert.equal(result.eligibleMonths,control.eligibleMonths);
  if(control.products){assert.deepEqual(result.products.slice(0,10).map(({sku,net,gross,credits})=>({sku,net,gross,credits})),control.products[measure]);productViews++;}
  checked++;
 }
}
console.log('PASS: signed credits, complete SKU ranking, period/country scope, partial-only empty range, CSV escaping, '+checked+' SQL-reconciled filter views and '+productViews+' full SKU ranking views.');
