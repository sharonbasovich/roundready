/* Fresh RoundReady core. No network, storage, HTML or physical actions. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RoundReady=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const MAX=10000;
function fail(message){throw new TypeError(message);}
function integer(v,name){if(!Number.isSafeInteger(v)||v<0||v>MAX)fail(name+' must be an integer from 0 to '+MAX);return v;}
function text(v,name){if(typeof v!=='string'||!v.trim()||v.length>80||/[\x00-\x1f\x7f]/.test(v))fail(name+' must be nonempty single-line text (80 characters maximum)');return v;}
function object(v,name){if(!v||typeof v!=='object'||Array.isArray(v))fail(name+' must be an object');}
function keys(v,allowed,name){object(v,name);if(Object.keys(v).some(k=>!allowed.includes(k)))fail(name+' contains unsupported fields');}
function validate(input){
 keys(input,['products','stations'],'round');
 if(!Array.isArray(input.products)||!input.products.length||input.products.length>10)fail('Use 1–10 products');
 if(!Array.isArray(input.stations)||!input.stations.length||input.stations.length>20)fail('Use 1–20 stations');
 const ids=new Set();
 input.products.forEach(p=>{keys(p,['id','name','available','pending'],'product');text(p.id,'product id');text(p.name,'product name');if(ids.has(p.id))fail('Duplicate product id');ids.add(p.id);integer(p.available,'available');integer(p.pending,'pending');});
 const stationIds=new Set();
 input.stations.forEach(s=>{keys(s,['id','name','items'],'station');text(s.id,'station id');text(s.name,'station name');if(stationIds.has(s.id))fail('Duplicate station id');stationIds.add(s.id);if(!Array.isArray(s.items)||s.items.length!==ids.size)fail('Each station needs exactly one item per product');const seen=new Set();s.items.forEach(i=>{keys(i,['productId','current','verified','capacity','target','usage'],'item');if(!ids.has(i.productId)||seen.has(i.productId))fail('Unknown or repeated station product');seen.add(i.productId);integer(i.capacity,'capacity');integer(i.target,'target');if(i.target>i.capacity)fail('Target exceeds capacity');if(i.current!==null){integer(i.current,'current');if(i.current>i.capacity)fail('Current count exceeds capacity');}if(typeof i.verified!=='boolean')fail('verified must be boolean');if(i.current===null&&i.verified)fail('An unknown count cannot be verified');if(i.usage!==undefined&&i.usage!==null){keys(i.usage,['low','high'],'usage');integer(i.usage.low,'usage low');integer(i.usage.high,'usage high');if(i.usage.low>i.usage.high)fail('Usage range is reversed');}});});
 return input;
}
function ready(i){return i.current!==null&&i.verified;}
function item(s,id){return s.items.find(i=>i.productId===id);}
function suggest(input){validate(input);const allocations=[];
 for(const p of input.products){const rows=input.stations.map((s,index)=>{const i=item(s,p.id);return {stationId:s.id,productId:p.id,index,deficit:ready(i)?Math.max(0,i.target-i.current):0};});const need=rows.reduce((n,r)=>n+r.deficit,0),budget=Math.min(p.available,need);let used=0;
 for(const r of rows){r.quantity=need?Math.floor(budget*r.deficit/need):0;r.remainder=need?(budget*r.deficit)%need:0;used+=r.quantity;}
 const order=rows.filter(r=>r.deficit>0).slice().sort((a,b)=>b.remainder-a.remainder||a.index-b.index);for(let n=0;n<budget-used;n++)order[n].quantity++;
 allocations.push(...rows.map(r=>({stationId:r.stationId,productId:r.productId,quantity:r.quantity})));
 }return allocations;
}
function evaluate(input,allocations){validate(input);if(!Array.isArray(allocations))fail('Plan must be an array');const map=new Map(),errors=[];
 for(const a of allocations){keys(a,['stationId','productId','quantity'],'allocation');const s=input.stations.find(s=>s.id===a.stationId);if(!s||!input.products.some(p=>p.id===a.productId))fail('Allocation references unknown station/product');integer(a.quantity,'allocation quantity');const key=JSON.stringify([a.stationId,a.productId]);if(map.has(key))fail('Duplicate allocation');map.set(key,a.quantity);}
 if(map.size!==input.stations.length*input.products.length)fail('Plan must specify every station/product, including zeros');
 const checks=[],rows=[],products=[];
 for(const p of input.products){let allocated=0,knownShortfall=0;
 for(const s of input.stations){const i=item(s,p.id),q=map.get(JSON.stringify([s.id,p.id]));allocated+=q;const eligible=ready(i);if(!eligible){checks.push({stationId:s.id,productId:p.id,reason:i.current===null?'unknown count':'unverified count'});if(q!==0)errors.push(s.name+' / '+p.name+': check the count before planning a refill');}
 if(eligible&&q>i.capacity-i.current)errors.push(s.name+' / '+p.name+': allocation exceeds remaining capacity');
 const after=eligible?i.current+q:null,shortfall=eligible?Math.max(0,i.target-after):null;if(shortfall!==null)knownShortfall+=shortfall;
 const usage=eligible&&i.usage?{minimumDays:i.usage.high===0?null:after/i.usage.high,maximumDays:i.usage.low===0?null:after/i.usage.low,zeroUsePossible:i.usage.low===0}:null;
 rows.push({stationId:s.id,productId:p.id,quantity:q,checkRequired:!eligible,after,shortfall,usage});}
 if(allocated>p.available)errors.push(p.name+': allocated '+allocated+' exceeds available '+p.available);
 products.push({productId:p.id,available:p.available,pendingExcluded:p.pending,allocated,remaining:p.available-allocated,knownShortfall});}
 const valid=errors.length===0;
 // Invalid arithmetic remains diagnostic, never presented as a feasible coverage result.
 if(!valid)for(const r of rows){r.after=null;r.shortfall=null;r.usage=null;}
 return {valid,errors,checks,rows,products:products.map(p=>valid?p:{...p,knownShortfall:null}),completeCounts:checks.length===0,rule:'Proportional to known verified target deficits; largest remainder, ties in station order. Not a fairness or optimality claim.'};
}
function snapshot(input,allocations){const result=evaluate(input,allocations);const lines=['RoundReady — PREVIEW ONLY','Packing/check plan, NOT confirmation of physical restocking.','Synthetic or operator-entered aggregate counts; no individual health information.'];
 if(!result.valid)return lines.concat('INVALID PLAN — do not use for packing.',...result.errors).join('\n');
 lines.push(result.rule,'Pending deliveries are excluded. Unchecked stations require a physical count; no refill is recommended for them.');
 for(const p of input.products){const total=result.products.find(x=>x.productId===p.id);lines.push(p.name+': available '+p.available+', pending excluded '+p.pending+', planned '+total.allocated+', cupboard remainder '+total.remaining+', known target shortfall '+total.knownShortfall);for(const s of input.stations){const r=result.rows.find(x=>x.stationId===s.id&&x.productId===p.id);const original=item(s,p.id);lines.push('  '+s.name+': current '+(original.current===null?'unknown':original.current)+'; checked for current round '+(original.verified?'yes':'no')+'; capacity '+original.capacity+'; target '+original.target);if(original.usage)lines.push('    Operator-assumed usage: '+original.usage.low+'–'+original.usage.high+' units/day.');lines.push('    '+(r.checkRequired?'CHECK COUNT FIRST; no recommendation':'pack '+r.quantity+'; projected count '+r.after+'; target shortfall '+r.shortfall));if(r.usage)lines.push('    Assumed usage only, not a forecast: '+(r.usage.minimumDays===null?'no depletion under zero-use assumption':r.usage.minimumDays.toFixed(2)+' to '+(r.usage.maximumDays===null?'unbounded':r.usage.maximumDays.toFixed(2))+' days'));else if(!r.checkRequired)lines.push('    Demand not estimated.');}}
 lines.push('Shortfalls cover verified counts only, not unchecked stations. Products never substitute. Follow local product-condition and safety procedures.');return lines.join('\n');}
function example(){return {products:[{id:'pads',name:'Packaged pads',available:12,pending:20},{id:'tampons',name:'Packaged tampons',available:7,pending:0}],stations:[{id:'a',name:'Station A',items:[{productId:'pads',current:2,verified:true,capacity:20,target:12,usage:{low:1,high:3}},{productId:'tampons',current:1,verified:true,capacity:10,target:6}]},{id:'b',name:'Station B',items:[{productId:'pads',current:4,verified:true,capacity:20,target:12},{productId:'tampons',current:0,verified:true,capacity:10,target:6}]},{id:'c',name:'Station C',items:[{productId:'pads',current:null,verified:false,capacity:15,target:8},{productId:'tampons',current:2,verified:false,capacity:10,target:6}]}]};}
return Object.freeze({validate,suggest,evaluate,snapshot,example,MAX});
});
