/* China Atlas v2.3: Safe price conversion and multilingual Wikipedia verification */
(()=>{'use strict';
const CATURL='data/wiki-entities-v23.json';const KNOWN={};const CACHEKEY='china-v23-wiki-resolved';
let catalog=[], byId=new Map();
const $=id=>document.getElementById(id);const moneyCode={CNY:'¥',HKD:'HK$',MOP:'MOP ',GBP:'£',UAH:'₴',USD:'US$'};
const DEFAULT={cny:0.1120,hkd:0.0953,mop:0.0925,usd:0.75,gbpuah:61.2374,visa:61.2419};
let rate={...DEFAULT};try{rate={...rate,...JSON.parse(localStorage.getItem('china-v23-fx')||'{}')}}catch(e){}
function save(){try{localStorage.setItem('china-v23-fx',JSON.stringify(rate))}catch(e){}}
function gbp(v,code){return v*(code==='GBP'?1:code==='UAH'?1/rate.gbpuah:rate[code.toLowerCase()]||0)};
function localFor(node){const section=node.closest('section');const row=node.closest('tr,li,article,details,.city-card,.card');
 let t=((row?.textContent||'').slice(0,280)+' '+(section?.id||'')+' '+(section?.querySelector('h2')?.textContent||'')).toLowerCase();
 if(/макао|macau|macao|cotai|taipa/.test(t))return 'MOP';if(/гонконг|hong.?kong|hkg|kowloon|tsim sha tsui|jordan/.test(t))return 'HKD';if(/шеньчжень|shenzhen|guangzhou|гуанчжоу|zhuhai|чжухай|beijing|пекін|china mainland|материк/.test(t))return 'CNY';return ''; }
const nmRE='(?:\\d{1,3}(?:,\\d{3})+(?:[.]\\d{1,6})?|\\d+(?:[.,]\\d{1,6})?)';
// Currency signs and uppercase ISO codes; ranges, + marks, and thousands separators.
const priceRE=new RegExp('(?<![\\w])(?:HK\\$|HKD\\s*|MOP\\s*|CNY\\s*|GBP\\s*|UAH\\s*|USD\\s*|£\\s*|₴\\s*|¥\\s*|￥\\s*|\\$\\s*)'+nmRE+'(?:\\s*[-–—]\\s*'+nmRE+')?\\+?','g');
const pricePartsRE=/^(HK\$|HKD|MOP|CNY|GBP|UAH|USD|£|₴|¥|￥|\$)\s*(.*)$/i;
const suffixRE=/([0-9]+(?:[\s,][0-9]{3})*(?:[.,][0-9]{1,6})?(?:\s*[-–—]\s*[0-9]+(?:[.,][0-9]{1,6})?)?)\s*(грн|UAH|HKD|MOP|CNY|GBP|USD)(?![\p{L}\w])/giu;
function detect(code){const t=code.toUpperCase();return t==='¥'||t==='￥'?'CNY':t==='HK$'?'HKD':t==='£'?'GBP':t==='₴'?'UAH':t==='$'?'USD':t;}
function vals(m){return m.replace(/\s*\+\s*$/,'').split(/\s*[-–—]\s*/).map(v=>Number(v.replace(/\s/g,'').replace(/,(?=\d{3}(?:\D|$))/g,'').replace(',','.'))).filter(Number.isFinite);}
function fmt(v,code){const n=(Math.abs(v)>=1000?Math.round(v).toLocaleString('uk-UA'):v.toLocaleString('uk-UA',{maximumFractionDigits:code==='UAH'?0:2,minimumFractionDigits:code==='GBP'?2:0}));return moneyCode[code]+n;}
function triple(base,code,vs,local){if(!vs.length)return base;const dest=(code==='GBP'||code==='UAH')?local:code;
 const left=(code==='GBP'?vs:vs.map(v=>v)).map(v=>fmt(v,code)).join('-');
 const pounds=vs.map(v=>fmt(gbp(v,code),'GBP')).join('-');
 const uah=vs.map(v=>fmt(gbp(v,code)*rate.gbpuah,'UAH')).join('-');
 const foreign=dest?vs.map(v=>fmt(gbp(v,code)/(rate[dest.toLowerCase()]||1),dest)).join('-'):'місцева валюта невизначена';
 return code==='GBP'?`${left} · ≈${foreign} · ≈${uah}`:code==='UAH'?`${left} · ≈${pounds} · ≈${foreign}`:`${left} · ≈${pounds} · ≈${uah}`;}
function paint(p){const code=p.dataset.code,vs=JSON.parse(p.dataset.values),loc=p.dataset.loc;let text=triple('',code,vs,loc);
 const sep=text.indexOf(' · ');p.querySelector('.v23base').textContent=sep<0?text:text.slice(0,sep);
 p.querySelector('.v23converted').textContent=sep<0?'':text.slice(sep);p.title='АРХІВНА орієнтовна конвертація - не актуальний курс або реальне списання ПриватБанку';}
const SKIP=new Set(['A','SCRIPT','STYLE','CODE','PRE','TEXTAREA','BUTTON','INPUT','SELECT','OPTION','SVG','TITLE']);
function processText(t){if(t.nodeType!==3||!t.textContent||t.textContent.length>2000)return;
 const par=t.parentElement;if(!par||par.closest('[data-v23-noindex],.v23price,.v23box,#v23wikiDialog')||SKIP.has(par.tagName)||par.closest('a,script,style,pre,code,svg'))return;
 const value=t.textContent;priceRE.lastIndex=0;suffixRE.lastIndex=0;let m,matches=[];while((m=priceRE.exec(value))){
 let parsed=pricePartsRE.exec(m[0]);if(!parsed)continue;const code=detect(parsed[1]),vs=vals(parsed[2]);if(!vs.length||vs.some(x=>x>10000000))continue;
 // Existing inline triplets such as ¥35 / £3.92 / ₴240 are obsolete snapshots;
 // re-render the primary currency and suppress duplicated hard-coded companions.
 let end=m.index+m[0].length;const follow=value.slice(end);const pair=/^\s*\/\s*(?:≈\s*)?(?:£|GBP|HK\$|HKD|MOP|CNY|¥|₴|UAH|USD|\$)\s*\d[\d\s.,]*(?:\s*\/\s*(?:≈\s*)?(?:£|GBP|₴|UAH|HKD|CNY|MOP|¥|HK\$)\s*\d[\d\s.,]*)?/i.exec(follow);
 if(pair&&pair[0].match(/[£₴¥$]/g)?.length>=1){end+=pair[0].length;}
 matches.push({start:m.index,end,code,vs,base:m[0]});priceRE.lastIndex=end;
 if(matches.length>=16)break;
 }
 // Suffix notation is common in Ukrainian text: 30 000 грн, 100 CNY.
 while((m=suffixRE.exec(value))){if(matches.some(x=>m.index<x.end&&m.index+m[0].length>x.start))continue;
 const code=m[2].toLowerCase()==='грн'?'UAH':m[2].toUpperCase(),vs=vals(m[1]);if(!vs.length||vs.some(x=>x>10000000))continue;
 matches.push({start:m.index,end:m.index+m[0].length,code,vs,base:m[0]});if(matches.length>=20)break;}
 matches.sort((a,b)=>a.start-b.start);
 if(!matches.length)return;
 const fragment=document.createDocumentFragment();let prev=0;for(const x of matches){if(x.start<prev)continue;
 fragment.append(document.createTextNode(value.slice(prev,x.start)));
 let span=document.createElement('span');span.className='v23price';span.dataset.code=x.code;span.dataset.values=JSON.stringify(x.vs);span.dataset.loc=localFor(par);
 let a=document.createElement('span');a.className='v23base';span.append(a);let b=document.createElement('span');b.className='v23converted';span.append(b);paint(span);fragment.append(span);prev=x.end;window.__v23Prices=(window.__v23Prices||0)+1;}
 fragment.append(document.createTextNode(value.slice(prev)));t.replaceWith(fragment);
}
function applyPrices(root){if(!root||!root.isConnected)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const arr=[];while(w.nextNode()){arr.push(w.currentNode);if(arr.length>15000)break;}arr.forEach(processText);}
function repaint(){document.querySelectorAll('.v23price').forEach(paint);const p=$('v23priceCount'),n=String(document.querySelectorAll('.v23price').length);if(p&&p.textContent!==n)p.textContent=n;}
function updateForm(){for(const [field,key] of Object.entries({v23cny:'cny',v23hkd:'hkd',v23mop:'mop',v23usd:'usd',v23gbpuah:'gbpuah'})){if($(field))$(field).value=rate[key];}}
function wireFx(){updateForm();$('v23bankMode')?.addEventListener('change',e=>{if(e.target.value==='mc')rate.gbpuah=61.2374;else if(e.target.value==='visa')rate.gbpuah=61.2419;else if(e.target.value==='official')rate.gbpuah=61.3497;else return;save();updateForm();repaint();$('v23fxStatus').textContent='Застосовано вибраний довідковий профіль, не гарантію списання.';});$('v23saveFx')?.addEventListener('click',()=>{for(const [field,key] of Object.entries({v23cny:'cny',v23hkd:'hkd',v23mop:'mop',v23usd:'usd',v23gbpuah:'gbpuah'})){const n=Number($(field)?.value);if(!Number.isFinite(n)||n<=0){$('v23fxStatus').textContent='Перевірте курс: усі значення мають бути додатними';return;}rate[key]=n;}save();repaint();$('v23fxStatus').textContent='Курси збережено локально: усі перерахунки оновлено.';});
 $('v23resetFx')?.addEventListener('click',()=>{rate={...DEFAULT};save();updateForm();repaint();$('v23fxStatus').textContent='Повернуто базові довідкові курси.';});
 $('v23liveFx')?.addEventListener('click',async()=>{const status=$('v23fxStatus');status.textContent='Запитуємо ринковий довідковий курс…';try{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),8000);
 const j=await fetch('https://open.er-api.com/v6/latest/GBP',{signal:ctrl.signal});clearTimeout(timer);const d=await j.json();if(!j.ok||!d?.rates?.CNY||!d.rates.HKD||!d.rates.MOP)throw Error('немає всіх валют');
 rate.cny=1/d.rates.CNY;rate.hkd=1/d.rates.HKD;rate.mop=1/d.rates.MOP;if(d.rates.USD)rate.usd=1/d.rates.USD;save();updateForm();repaint();status.textContent='Оновлено орієнтовні ринкові курси. GBP/UAH архівний і незмінений. '+(d.time_last_update_utc||'');
 }catch(e){status.textContent='Онлайн-курси недоступні. Залишені збережені значення: '+e.message;}});
}
// Strict Wikipedia cascade. First identify English Wikipedia article and its
// Wikidata item, then select actual sitelinks UK -> RU -> EN. No guessed links.
function wikiApi(lang,params){let q=new URLSearchParams({action:'query',format:'json',origin:'*',...params});return fetch(`https://${lang}.wikipedia.org/w/api.php?${q}`,{signal:AbortSignal.timeout(7500)}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()});}
async function resolveItem(entry){// Version 2.5: catalogued ukVerified is a title hint, not network proof; validate via a real Wikipedia/Wikidata API response.
 let p=null, lastError=null;const lookups=[['uk',entry.name],['en',entry.enTitle],['ru',entry.name]];
 for(const [lang,title] of lookups){try{const data=await wikiApi(lang,{prop:'pageprops',titles,redirects:'1'});
 p=Object.values(data.query?.pages||{}).find(x=>!x.missing&&x.pageprops?.wikibase_item);if(p)break;}catch(e){lastError=e;break;}}
 if(!p)return lastError?{status:'offline',error:String(lastError)}:{status:'missing',title:entry.enTitle};
 const qid=p.pageprops.wikibase_item;
 try{const u='https://www.wikidata.org/w/api.php?'+new URLSearchParams({action:'wbgetentities',ids:qid,props:'sitelinks',format:'json',origin:'*'});
 const r=await fetch(u,{signal:AbortSignal.timeout(7500)});if(!r.ok)throw Error('HTTP '+r.status);const obj=await r.json();let links=obj.entities?.[qid]?.sitelinks||{};
 for(const lang of ['uk','ru','en']){let t=links[lang+'wiki']?.title;if(t)return {status:'ok',lang,url:`https://${lang}.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g,'_'))}`,title:t,qid};}
 return {status:'missing',qid};}catch(e){return {status:'offline',qid,error:String(e)}}
}
let wikiResolved={};try{wikiResolved=JSON.parse(localStorage.getItem(CACHEKEY)||'{}')||{}}catch(e){}
function storeWiki(){try{localStorage.setItem(CACHEKEY,JSON.stringify(wikiResolved))}catch(e){}}
function wikiDialog(title,message,url,status){let d=$('v23wikiDialog');if(!d)return;
 $('v23wikiName').textContent=title;$('v23wikiInfo').textContent=message;
 const a=$('v23wikiOpen');if(url){a.href=url;a.style.display='inline';a.textContent='Відкрити статтю ↗'}else a.style.display='none';
 d.setAttribute('aria-hidden','false');$('v23WikiClose').focus({preventScroll:true});}
async function navWiki(id,trigger){let entry=byId.get(id);if(!entry)return;
 let direct=wikiResolved[id];if(!direct?.url){wikiDialog(entry.name,'Перевірка статті та пріоритету мов: українська → російська → англійська…',null);direct=await resolveItem(entry);
 if(direct?.url){wikiResolved[id]=direct;storeWiki();}}
 if(direct?.url){trigger.href=direct.url;trigger.target='_blank';trigger.dataset.wikiConfirmed=direct.lang;
 // A user click opened this locally first. Use new tab only as a result of the click;
 // browsers may block post-await popup. Provide visible guaranteed link.
 wikiDialog(entry.name,`Стаття перевірена: ${direct.lang.toUpperCase()} · ${direct.title}`,direct.url);}
 else wikiDialog(entry.name, direct.status==='offline'?'Немає доступу до Wikimedia. Спробуйте пізніше з підключенням. Стаття не вважатиметься перевіреною.':'Точної відповідної статті не підтверджено - переходу на випадкову статтю немає.',null);
}
function wireWiki(){fetch(CATURL).then(r=>r.json()).then(rows=>{catalog=rows;rows.forEach(x=>byId.set(x.id,x));$('v23wikiCount').textContent=String(rows.length);}).catch(e=>{$('v23wikiInfo').textContent='Не вдалося завантажити словник: '+e.message;});
 document.addEventListener('click',e=>{const a=e.target.closest('.v23wiki');if(!a)return;
 if(a.dataset.wikiYear){e.preventDefault();const year=a.dataset.wikiYear;wikiDialog(year,'Річна сторінка Вікіпедії: відкрийте українську, якщо існує.',`https://uk.wikipedia.org/wiki/${year}`);return;}
 if(a.dataset.wikiConfirmed==='uk')return;
 e.preventDefault();navWiki(a.dataset.wikiId,a);
 });$('v23WikiClose')?.addEventListener('click',()=>$('v23wikiDialog').setAttribute('aria-hidden','true'));
 $('v23SelectTerm')?.addEventListener('pointerdown',()=>{const txt=window.getSelection()?.toString().trim();if(txt&&txt.length<=130)$('v23wikiInput').value=txt;});
 $('v23SelectTerm')?.addEventListener('click',()=>{const txt=$('v23wikiInput').value.trim();if(!txt)return;wikiDialog(txt,'Перевіряємо вибраний термін у Вікіпедії…',null);
 resolveItem({name:txt,enTitle:txt}).then(x=>{if(x?.url)wikiDialog(txt,'Підтверджено статтю '+x.lang.toUpperCase()+': '+x.title,x.url);else wikiDialog(txt,'Точну статтю не підтверджено або Wikimedia недоступна. Назва залишиться без вигаданого посилання.',null);});});
}
function initialize(){wireFx();wireWiki();
 let content=document.querySelector('.container')||document.body;applyPrices(document.body);repaint();
 let timer;const mo=new MutationObserver(records=>{if(timer)clearTimeout(timer);timer=setTimeout(()=>{
 const nodes=[];for(const r of records){for(const n of r.addedNodes){if(n.nodeType===3&&n.parentElement&&!n.parentElement.closest('.v23price,.v23box,#v23wikiDialog')){processText(n)}else if(n.nodeType===1&&!n.closest('.v23price,#v23wikiDialog,.v23box'))nodes.push(n);}}
 nodes.forEach(applyPrices);repaint();},80);});
 mo.observe(document.body,{subtree:true,childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);else initialize();
})();
