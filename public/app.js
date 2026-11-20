(() => {
'use strict';
const ROOT=new URL('.',document.currentScript.src).href;
let products=window.JUKBARIM_PRODUCTS;const kiosk=window.JUKBARIM_KIOSK===true,app=document.getElementById('app'),dialog=document.getElementById('dialog');
const labels={fruit:'과실 향',floral:'꽃과 허브 향',grain:'곡물의 고소함',wood:'바닐라와 나무 계열 향',light:'가벼운 질감',rich:'묵직한 질감',soft:'부드러운 질감',fresh:'산뜻한 산미',long:'긴 여운',clean:'깔끔한 마무리',dry:'단맛이 적은 스타일',sweet:'달콤한 맛',offdry:'은근한 단맛',fizz:'기포',citrus:'감귤 계열 향',berry:'붉은 과실 향',herbal:'허브 향',nutty:'견과의 고소함',roasted:'볶은 풍미',tannic:'타닌의 결'};
const opt=(title,sub,features=[],extra={})=>({title,sub,features,...extra});
const QUESTION_VERSION='11';
const RETIRED_PRODUCT_IDS=new Set(['C002','C015','C016','C020']);
const TAKEAWAY_RELEASE='20261120-r2',takeaway=window.JUKBARIM_TAKEAWAY===true;
const questions=[
 {label:'골목',title:'낯선 동네에서,\n어느 문을 열어볼까요?',options:[
  opt('작은 온실','풀잎 사이로 빛이 들어오는 곳',['floral','herbal'],{side:0}),
  opt('과수원 끝의 집','열매가 열린 나무 아래',['fruit'],{side:0}),
  opt('이른 아침의 빵집','오븐 앞에 온기가 남은 곳',['grain','roasted'],{side:1}),
  opt('오래된 목공방','나무와 도구가 놓인 곳',['wood'],{side:1})]},
 {label:'한 모금',title:'한 잔을 골라볼게요.\n단맛은 어느 쪽이 좋나요?',options:[
  opt('단맛은 거의 없이','담백하게 향과 맛을 느끼고 싶어요',['dry'],{weight:4,avoid:['sweet'],avoidWeight:5}),
  opt('살짝만 감돌게','달콤함이 앞서지는 않았으면 해요',['offdry'],{weight:3,avoid:['sweet'],avoidWeight:2}),
  opt('달콤함이 느껴지게','첫 모금부터 기분 좋은 단맛',['sweet'],{weight:4,avoid:['dry'],avoidWeight:3}),
  opt('어느 쪽도 괜찮아요','단맛보다 다른 매력을 볼래요')]},
 {label:'바람',title:'잠깐 쉬어 갈 자리,\n어떤 바람이 좋나요?',options:[
  opt('바람 없는 안쪽 자리','온도가 잔잔하게 머무는 곳',[],{avoid:['fresh'],read:'바람이 잔잔한 자리를 골랐어요. 새콤한 인상은 조금 뒤로 두고 다른 풍미부터 살피는 쪽이에요.'}),
  opt('커튼만 살짝 흔들리는 창가','가끔 느껴지는 작은 바람',['fresh'],{weight:.5,read:'아주 약한 바람 정도면 충분했네요. 산미는 주인공보다는 작은 환기처럼 다뤘어요.'}),
  opt('나무 그늘 아래','기분 좋게 지나가는 바람',['fresh'],{weight:1.5,read:'기분 좋게 스치는 바람을 골랐어요. 새콤하고 산뜻한 인상을 맛의 작은 전환점으로 연결했어요.'}),
  opt('바람 부는 바닷가','볼에 닿는 선명한 서늘함',['fresh'],{weight:2.5,read:'볼에 닿는 바람이 분명한 곳을 골랐어요. 산미가 있는 풍미를 조금 더 눈여겨보는 쪽이에요.'})]},
 {label:'공간',title:'하루 머물 방을\n고른다면?',options:[
  opt('얇은 커튼과 작은 의자','가볍게 비워진 방',['light'],{side:0,weight:2.5,avoid:['rich']}),
  opt('넓은 창과 낮은 가구','여백이 넉넉한 방',['light'],{side:0,weight:1.5}),
  opt('두툼한 소파와 러그','편안하게 채워진 방',['rich'],{side:1,weight:1.5}),
  opt('책과 가구가 가득한 방','천천히 살펴볼 것이 많은 방',['rich'],{side:1,weight:2.5,avoid:['light']})]},
 {label:'입안의 감각',title:'술이 입안에 닿을 때,\n어떤 느낌이 좋나요?',options:[
  opt('기포 없이 차분하게','톡 쏘는 느낌은 쉬어갈래요',[],{avoid:['fizz'],avoidWeight:5}),
  opt('톡톡 튀는 청량함','기포가 살아 있으면 좋아요',['fizz'],{weight:4}),
  opt('어느 쪽이든 부드럽게','기포보다는 매끄러운 질감',['soft'],{weight:2.5}),
  opt('질감보다 향과 맛','이 부분은 열어둘래요')]},
 {label:'표면',title:'자꾸 손이 가는\n노트의 표지는?',options:[
  opt('매끄럽게 닳은 천','걸리는 곳 없이 감기는',['soft'],{weight:2.5,read:'걸리는 곳 없이 감기는 표면을 골랐어요. 목넘김이나 질감이 부드럽다고 설명된 술에 조금 더 마음을 줬어요.'}),
  opt('결이 고운 면직물','부드럽지만 표정은 남아 있는',['soft'],{weight:1.5,read:'부드러운 바탕 위에 결은 남겨뒀네요. 매끄러운 느낌 속에서도 향미의 작은 차이를 살펴보는 쪽이에요.'}),
  opt('살짝 거친 종이','손끝에 결이 느껴지는',['tannic'],{weight:1,read:'손끝에 결이 느껴지는 표면을 골랐어요. 와인에서는 타닌이 만드는 질감도 살펴볼 작은 단서로 썼어요.'}),
  opt('단단하게 잡히는 가죽','윤곽이 또렷한 표면',['tannic'],{weight:2,read:'윤곽이 또렷한 표면을 골랐어요. 타닌처럼 입안에 결을 남기는 풍미도 비교해볼 만하겠어요.'})]},
 {label:'마지막 장면',title:'영화가 끝났을 때,\n어떤 마무리가 좋나요?',options:[
  opt('짧고 분명한 마지막 컷','홀가분하게 일어나는',['clean'],{side:0,weight:2.5,avoid:['long']}),
  opt('다음 하루로 이어지는 결말','기분 좋게 털고 나오는',['clean'],{side:0,weight:1.5}),
  opt('한동안 생각나는 한 장면','크레딧까지 앉아 있는',['long'],{side:1,weight:1.5}),
  opt('끝난 뒤 다시 꺼내볼 이야기','며칠 후에도 떠오르는',['long'],{side:1,weight:2.5})]},
 {label:'편한 도수',title:'오늘 고를 술은,\n어느 정도가 편한가요?',options:[
  opt('12도 이하로 가볍게','부담 적은 도수 안에서 고를래요',[],{strength:'gentle',maxABV:12}),
  opt('20도 이하가 편해요','적당한 존재감까지는 좋아요',[],{strength:'moderate',maxABV:20}),
  opt('도수 있어도 괜찮아요','증류주처럼 힘 있는 술도 좋아요',[],{strength:'bold'}),
  opt('도수보다 향과 맛','넓게 비교해볼래요',[],{strength:'open'})]},
 {label:'갈림길',title:'익숙한 길 옆에\n처음 보는 골목이 있다면?',options:[
  opt('오늘은 늘 가던 길로','아는 곳에서 편하게 머물래요',[],{explore:-2}),
  opt('입구만 잠깐 들여다보기','익숙함에 작은 변화를 더해요',[],{explore:-1}),
  opt('한 번 들어가 보기','계획에 없던 장면도 좋아요',[],{explore:1}),
  opt('지도는 잠시 접어두기','어디로 이어질지 궁금해요',[],{explore:2})]},
 {label:'고르는 기준',title:'마음에 드는 물건을 발견하면,\n보통 어떻게 고르나요?',options:[
  opt('부담 없는 쪽부터','큰 고민 없이 살 수 있으면 좋아요',[],{value:'everyday'}),
  opt('자주 쓸 만큼 괜찮은 걸로','적당히 쓰고, 충분히 만족하고 싶어요',[],{value:'balanced'}),
  opt('확실히 마음에 들면 더 써요','좋아하는 데에는 조금 더 쓰는 편이에요',[],{value:'special'}),
  opt('그때의 마음에 따라','미리 선을 정해두지는 않아요',[],{value:'open'})]}

];
// Editorial associations, not measured psychological traits or hard limits.
let list;
let state={mode:'home',step:0,answers:Array(questions.length).fill(-1),adjust:{price:null,abv:null,dry:false},index:0,picks:[],batches:[],batchIndex:0,editing:false},busy=false,idleTimer,idleCountdown,idleDeadline=0,idleFocus=null,answerTimer,toastTimer,exportURL;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('ko-KR');
function profile(answers){
 const p={features:[],weights:{},penalties:{},mood:null,value:'open',discovery:false,avoid:[],explore:0,strength:'open',maxABV:null};
 answers.forEach((a,i)=>{const o=questions[i]?.options[a];if(!o)return;
  for(const f of o.features){if(!p.features.includes(f))p.features.push(f);p.weights[f]=(p.weights[f]||0)+(o.weight??2)/o.features.length;}
  for(const f of o.avoid||[]){if(!p.avoid.includes(f))p.avoid.push(f);p.penalties[f]=(p.penalties[f]||0)+(o.avoidWeight??2);}
  if(o.value)p.value=o.value;if(o.strength)p.strength=o.strength;if(o.maxABV)p.maxABV=o.maxABV;
  if(o.explore!==undefined){p.explore=o.explore;p.discovery=o.explore>0;}
 });
 // Q5 and Q6 describe the same soft texture. Reinforce it slightly, not twice.
 if(p.weights.soft)p.weights.soft=Math.min(p.weights.soft,3);
 return p;
}
const typeNames=Object.fromEntries(Object.entries(window.JUKBARIM_TYPES).map(([code,t])=>[code,t.title]));
function analyze(answers){
 const chosen=i=>questions[i]?.options[answers[i]],pr=profile(answers),filled=answers.filter((a,i)=>!!questions[i]?.options[a]).length;
 // Four editorial axes. The direct alcohol answers refine taste, never claim a psychological diagnosis.
 const definitions=[
  {q:0,label:'마음의 출발점',values:['느낌을 먼저','익숙한 감각부터']},
  {q:3,label:'만족하는 방식',values:['가볍고 분명하게','충분히 알아가며']},
  {q:6,label:'경험을 남기는 법',values:['다음 장면으로','천천히 되새기며']},
  {q:8,label:'새로움과의 거리',values:['편한 기준 안에서','가능성을 열어두고']}
 ];
 const bits=definitions.map(d=>!chosen(d.q)?null:d.q===8?(chosen(8).explore>0?1:0):chosen(d.q).side);
 const axes=definitions.map((d,i)=>({label:d.label,value:bits[i]===null?'아직 열려 있는':d.values[bits[i]],direction:bits[i]===null?0:bits[i]?1:-1,status:bits[i]===null?'unknown':'selected',q:d.q}));
 const code=bits.map(b=>b===null?'?':b).join(''),t=window.JUKBARIM_TYPES[code];
 const fallback={title:'유연한 탐색형',gist:'아직 하나의 모습으로 정하기보다, 마음에 드는 쪽을 천천히 알아가는 중이에요.',core:'어떤 건 바로 고를 수 있지만 어떤 건 쉽게 정하고 싶지 않을 수 있어요. 모든 취향이 늘 선명해야 하는 건 아니에요. 좋아하는 것이 생기는 순간에 조금 더 머무르다 보면 나만의 기준도 자연스럽게 생깁니다.',blind:'다른 사람에게는 분명한 취향도 나에게는 별로 중요하지 않을 수 있어요. 비워둔 부분까지 억지로 채울 필요는 없어요.'};
 const story=t||fallback;
 const people=bits[0]===null?'편한 사람과 함께할 때와 낯선 자리에서의 모습은 다를 수 있어요. 어느 쪽이든 내 속도를 지킬 수 있는 관계가 잘 맞을 거예요.':bits[0]===0?'분위기의 작은 변화를 잘 느끼는 편이에요. 친한 사람 앞에서는 장난도 많지만, 혼자 마음을 정리하는 시간은 따로 필요합니다. 나를 세세하게 설명하지 않아도 편한 사람에게 오래 마음이 가요.':'말보다 꾸준한 행동에서 믿음을 얻는 편이에요. 처음에는 조금 거리를 두어도 편해지면 예상 밖의 솔직함과 유머가 나옵니다. 서로의 시간을 존중해주는 관계에서 가장 자연스러운 모습이 나와요.';
 const choice=bits[1]===null?'좋아하는 것의 크기보다 지금 내 생활에 얼마나 자연스럽게 들어오는지가 중요할 수 있어요.':bits[1]===0?'좋다는 말이 많아도 내가 느끼기에 복잡하거나 피곤하면 손이 잘 가지 않아요. 첫인상이 편하고, 함께하는 시간을 방해하지 않는 것에 마음이 갑니다. 작은 만족을 자주 누리는 방식이 잘 맞아요.':'처음에는 평범해 보여도 알아갈수록 다른 면이 보이는 것에 끌려요. 취향에 들어온 대상에는 시간과 관심을 꽤 쓰는 편입니다. 한 번의 강한 인상보다 다시 만났을 때도 발견할 게 있다는 점이 중요해요.';
 const taste=[];
 if(chosen(1))taste.push(['향이 달콤해도 실제 맛은 담백한 쪽에 더 손이 갈 수 있어요. 단맛이 앞서지 않을 때 향의 작은 차이가 더 재밌게 느껴질 거예요.','은근한 다정함은 좋지만 지나치게 달게 다가오는 건 조금 부담스러울 수 있어요. 맛도 달콤함이 살짝 감돌고 다른 풍미가 함께 보이는 쪽이 잘 맞겠어요.','하루의 긴장을 조금 풀어주는 반가운 맛에 마음이 가요. 첫 모금부터 단맛이 느껴지되 향과 질감에도 표정이 있는 술을 즐겨볼 만해요.','익숙한 한 가지 맛에만 머물기보다 그 술만의 매력을 만나보려는 여지가 있어요. 단맛이 있든 없든 향과 질감이 마음에 드는지가 더 중요하겠어요.'][answers[1]]);
 if(chosen(4))taste.push(['입안에서는 차분하게 이어지는 흐름이 편한 쪽이에요.','작은 기포가 분위기를 환기해주는 순간을 즐기는 쪽이에요.','자극이 앞서기보다 입안에서 부드럽게 이어지는 감각이 편하겠어요.','입안의 질감 하나로 취향을 미리 정해두지는 않는 쪽이에요.'][answers[4]]);
 const readings=[{heading:'당신이라는 사람',text:story.core},{heading:'가까워질수록 보이는 모습',text:people},{heading:'마음에 드는 것을 고르는 법',text:choice},{heading:'한 잔에서 만나고 싶은 느낌',text:taste.join(' ')||'지금은 맛의 범위를 좁히기보다 여러 향과 질감을 비교할 여지가 있어요. 설명을 읽다가 유독 눈길이 가는 표현부터 찾아보세요.'},{heading:'가끔 이런 모습도 있어요',text:story.blind}];
 const contrast=bits[3]===null?'익숙함과 새로움 중 하나만 골라야 하는 건 아니에요. 편한 기준 하나를 두고 나머지는 조금 열어두어도 좋아요.':bits[3]===1?'호기심은 있지만 아무거나 괜찮은 건 아니에요. 낯선 선택 속에서도 익숙하게 좋아할 부분이 하나쯤 있으면 훨씬 마음이 편해집니다. 같은 향을 가진 다른 주종을 만나는 방식이 재미있을 거예요.':'확실히 좋아하는 것을 다시 만나는 데서 만족을 얻는 편이에요. 변화를 싫어한다기보다 내 시간을 쓸 만큼의 이유가 필요한 거죠. 익숙한 향에 질감 하나만 달라져도 충분히 새로운 경험이 될 수 있어요.';
 const bridge=bits[2]===null?'오늘 마음에 드는 한 병이 내일의 기준이 될 수도 있어요. 추천 중 가장 궁금한 설명부터 읽어보세요.':bits[2]===0?'좋아하는 순간을 충분히 즐긴 뒤에는 다음으로 넘어갈 줄 알아요. 한 잔도 오래 분석하기보다 함께하는 시간 속에 자연스럽게 놓일 때 더 즐거울 수 있어요.':'좋았던 경험은 끝난 뒤에도 한 번 더 꺼내보는 편이에요. 첫 향과 마지막 여운이 어떻게 달라지는지 느끼다 보면 한 병 안에서도 여러 번의 재미를 만날 수 있어요.';
 return {title:story.title,code,filled,axes,gist:story.gist,opening:story.gist,readings,contrast,bridge,evidence:questions.flatMap((q,i)=>chosen(i)?[{label:q.label,answer:chosen(i).title}]:[])};
}
function readingHTML(full=false){const r=analyze(state.answers);
 if(!full)return '<section class="reading" aria-labelledby="type-title"><p class="reading-kicker fade">취향</p><h1 id="type-title" class="fade" style="--i:1" tabindex="-1">'+esc(r.title)+'</h1><p class="reading-gist fade" style="--i:2">'+esc(r.gist)+'</p><button class="link fade" style="--i:3" data-action="reading" aria-haspopup="dialog" aria-controls="dialog">자세히 보기</button></section>';
 return '<section class="type-reading" aria-labelledby="reading-title"><p class="eyebrow">당신을 조금 더 읽어보면</p><h2 id="reading-title" class="reading-title">'+esc(r.title)+'의 취향 노트</h2><div class="type-axes">'+r.axes.map(a=>'<div><small>'+esc(a.label)+'</small><strong>'+esc(a.value)+'</strong></div>').join('')+'</div>'+r.readings.map(x=>'<div class="reading-section"><h3>'+esc(x.heading)+'</h3><p>'+esc(x.text)+'</p></div>').join('')+'<div class="reading-section"><h3>익숙함과 새로움 사이</h3><p>'+esc(r.contrast)+'</p></div><div class="reading-section"><h3>좋은 시간을 즐기는 방식</h3><p>'+esc(r.bridge)+'</p></div><p class="reading-note">답변을 바탕으로 가볍게 즐기는 성향 이야기예요. 당신의 모든 모습을 정해두는 결과는 아니에요.</p></section>';
}
function recommendationOverview(){return state.picks.length?'<section class="recommendation-overview" aria-label="추천 술 한눈에 보기">'+state.picks.map((x,i)=>'<div class="overview-item"><span class="overview-number">0'+(i+1)+'</span><div><h3>'+esc(x.product.name)+'</h3><p>'+x.product.tags.slice(0,2).map(esc).join(' · ')+'</p><strong>'+money(x.product.price)+'<small>원</small></strong></div></div>').join('')+'</section>':'';}
function stableHash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);// Avalanche the final bits so adjacent product IDs do not rotate as a group.
 h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);return (h^h>>>16)>>>0;}
const family=p=>/와인/.test(p.cat)?'wine':'traditional';
function affinity(p,f){
 if(p.features.includes(f))return 1;
 // Slight sweetness can be approached from dry styles; missing data is not zero sweetness.
 if(f==='offdry'&&(p.sensorySource?.graph?.당도||0)<4){if(p.features.includes('dry'))return .55;if(p.features.includes('sweet'))return .25;}
 return 0;
}
function recommend(answers,adjust={},catalog=products,options={}){
 const pr=profile(answers),capPrice=adjust.minPrice===50000?Infinity:adjust.price||Infinity,capABV=adjust.minABV===30?Infinity:Math.min(adjust.abv||Infinity,pr.maxABV||Infinity),floorABV=adjust.minABV===30?30:0;
 const candidates=catalog.filter(p=>p.available!==false&&Number.isFinite(p.abv)&&Number.isFinite(p.price)&&p.abv>=floorABV&&p.abv<=capABV&&p.price<=capPrice&&(adjust.minPrice!==50000||p.price>50000)&&(!adjust.dry||p.features.includes('dry'))).map(p=>{
  const matches=pr.features.filter(f=>p.features.includes(f));let score=pr.features.reduce((sum,f)=>sum+pr.weights[f]*2*affinity(p,f),0)*Math.min(1,Math.sqrt(6/Math.max(1,p.features.length)));/* 특성 수가 많은 술의 쏠림 완화 2026-11-16 */score-=pr.avoid.filter(f=>p.features.includes(f)).reduce((n,f)=>n+pr.penalties[f],0);
  if(pr.strength==='gentle')score-=Math.min(3,Math.max(0,(p.abv-12)/10));
  if(pr.strength==='moderate')score+=Math.max(0,1.5-Math.abs(p.abv-18)/12);
  if(pr.strength==='bold')score+=Math.min(1.5,Math.max(0,(p.abv-20)/15));
  if(pr.features.includes('light')&&p.features.includes('rich'))score-=2;
  if(pr.features.includes('rich')&&p.features.includes('light'))score-=2;
  if(pr.features.includes('dry')&&p.features.includes('sweet')&&!p.features.includes('dry'))score-=1;
  if(pr.mood&&new RegExp(pr.mood).test(p.mood.join(' ')))score+=.5;
  return {product:p,matches,score};
 });
 const retained=new Set(options.retain||[]),excluded=new Set((options.exclude||[]).filter(id=>!retained.has(id)));
 // Stable per answer set: reloads and the phone result keep the same choices.
 const seed=answers.join(',');
 const rotation=x=>-Math.log(-Math.log((stableHash(x.product.id+'|'+seed)+.5)/4294967296));
 const bestByFamily={};for(const x of candidates){const f=family(x.product);bestByFamily[f]=Math.max(bestByFamily[f]??-Infinity,x.score);}
 const eligible=candidates.filter(x=>!excluded.has(x.product.id)&&(!options.similar||retained.has(x.product.id)||x.score>=bestByFamily[family(x.product)]-4));
 const families=[...new Set(eligible.map(x=>family(x.product)))];
 const picks=[],pricePivot={everyday:20000,balanced:35000,special:50000,open:null}[pr.value];
 const near=list=>{if(!list.length)return [];const best=Math.max(...list.map(x=>x.score));return list.filter(x=>x.score>=best-4);};
 const op=p=>{const r=p.merchandising;const valid=v=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;return r?valid(r.rotation)*.6+valid(r.margin)*.4:0;};
 for(let slot=0;slot<4;slot++){
  let remaining=eligible.filter(x=>!picks.some(y=>y.product.id===x.product.id));if(!remaining.length)break;
  const missing=families.filter(f=>!picks.some(x=>family(x.product)===f));
  const seats=Math.min(4,eligible.length)-picks.length;
  // Keep the wine/traditional mix when it is still within the taste window.
  if(missing.length&&seats<=missing.length){const close=near(remaining).filter(x=>missing.includes(family(x.product)));if(close.length)remaining=close;}
  let pool=near(remaining);const unique=pool.filter(x=>!picks.some(y=>(y.product.base||y.product.name)===(x.product.base||x.product.name)));if(unique.length)pool=unique;
  const rank=x=>{
   if(slot<2){const bonus=!pricePivot?0:pr.value==='everyday'?Math.max(-4,Math.min(4,4*(pricePivot-x.product.price)/pricePivot)):Math.max(0,3-3*Math.abs(x.product.price-pricePivot)/pricePivot);return x.score+bonus-(retained.has(x.product.id)?12:0);}
   // Bounded commercial boost only in slots 3/4, within near-taste candidates.
   const diversity=slot===3&&!picks.some(y=>y.product.cat===x.product.cat)?({[-2]:0,[-1]:1,[0]:1,[1]:2,[2]:3}[pr.explore]):0;
   return x.score+op(x.product)*2+diversity-(retained.has(x.product.id)?12:0);
  };
  // Only comparable candidates may rotate: within 4 taste points AND
  // 4 slot-rank points. Larger advantages always win. Within this shortlist,
  // score-weighted selection (temperature 4) breaks permanent monopolies.
  const ranked=pool.map(x=>({pick:x,rank:rank(x)})),bestRank=Math.max(...ranked.map(x=>x.rank));
  const shortlist=ranked.filter(x=>x.rank>=bestRank-4).map(x=>({...x,choice:x.rank+4*rotation(x.pick)}));
  shortlist.sort((a,b)=>b.choice-a.choice||b.rank-a.rank||a.pick.product.id.localeCompare(b.pick.product.id));
  const role=slot<2?(pr.value==='everyday'?'편하게 골라볼 한 병':slot===0?'먼저 살펴볼 한 병':'함께 비교할 한 병'):slot===2?'향미로 골라본 한 병':'조금 다른 선택';
  const selected=shortlist[0].pick;
  picks.push({...selected,role,carried:retained.has(selected.product.id),slot:slot<2?'value':'discovery'});
 }
 return {picks,candidateCount:eligible.length,mixedAvailable:new Set(candidates.map(x=>family(x.product))).size===2};
}
const lite=window.JUKBARIM_LITE===true||kiosk;
const SCENE_LIGHTS=['#7fa06a','#d0a24a','#5f97b3','#b98a5e','#8ec2d6','#b9977a','#8e76c2','#c26a6a','#6fa89a','#c7b46a'];
const header=()=>takeaway?'<header class="top"><span class="mark">적바림</span><span class="top-note">취향 결과</span></header>':'<header class="top"><button class="mark" data-action="home" aria-label="적바림 처음으로">적바림</button>'+(state.mode===(kiosk?'home':'list')?'':'<button class="top-home" data-action="'+(kiosk?'home':'list')+'">처음으로</button>')+'</header>';
const dock=()=>'';
const lines=t=>String(t).split('\n').map(x=>'<span class="line"><i>'+esc(x)+'</i></span>').join('');
const won=n=>'<span class="won">₩</span>'+money(n);
function bottlePhoto(p,cls){const url=list.photoURL(p,false);return '<div class="'+cls+(url?'':' no-photo')+'" data-initial="'+esc(p.group?p.group.charAt(0):'')+'">'+(url?'<img alt="" src="'+esc(url)+'">':'')+'</div>';}
function hubShelf(){return '<div class="art hub-art fade" style="--i:1" aria-hidden="true"><img class="art-ink" alt="" src="'+ROOT+'assets/art-cat.webp"><img class="art-paper" alt="" src="'+ROOT+'assets/art-cat-paper.webp"></div>';}
function render(focus=true){document.body.dataset.screen=state.mode;document.body.dataset.view=takeaway?'takeaway':'kiosk';
 if(state.mode==='home'){app.innerHTML=header()+'<main class="hub enter"><h1 class="hub-title fade" tabindex="-1">적바림</h1><p class="hub-kicker fade" style="--i:1">우리술과 와인</p>'+hubShelf()+'<nav class="hub-menu" aria-label="메뉴">'
  +'<button class="fade" style="--i:2" data-action="list"><strong>주류 리스트</strong><em>'+list.total()+'종</em></button>'
  +'<button class="fade" style="--i:3" data-action="start"><strong>취향 추천</strong><em>질문 10개</em></button>'
  +'<button class="fade" style="--i:4" data-action="guide" aria-haspopup="dialog"><strong>이용 안내</strong><em>포장 · 매장</em></button></nav></main>';}
 else if(state.mode==='list'){app.innerHTML=header()+'<main class="list" id="list-root"></main>'+dock();list.mount(document.getElementById('list-root'));}
 else if(state.mode==='question'){const q=questions[state.step];app.innerHTML=header()+'<main class="scene enter">'
  +'<div class="progress" role="progressbar" aria-label="질문 진행" aria-valuemin="0" aria-valuemax="10" aria-valuenow="'+state.step+'"><i style="width:'+(state.step+1)/questions.length*100+'%"></i></div>'
  +'<p class="scene-no fade">'+(state.step+1)+' / 10</p>'
  +'<h1 class="scene-title fade" style="--i:1" tabindex="-1">'+esc(q.title).replace(/\n/g,'<br>')+'</h1>'
  +'<div class="choices">'+q.options.map((o,i)=>'<button class="choice fade" style="--i:'+(i+2)+'" data-answer="'+i+'" aria-pressed="'+(state.answers[state.step]===i)+'"><span class="choice-text"><strong>'+esc(o.title)+'</strong><small>'+esc(o.sub)+'</small></span><span class="choice-mark" aria-hidden="true"></span></button>').join('')+'</div>'
  +'<div class="scene-nav"><button class="link" data-action="back">이전</button><button class="link" data-action="skip">건너뛰기</button></div></main>';}
 else renderResults();
 bind();if(focus){window.scrollTo(0,0);app.querySelector('h1')?.focus({preventScroll:true});}trackMode();resetIdle();}
function resultActions(){return takeaway?'<div class="result-actions"><button class="btn" data-action="save">이미지로 저장</button></div>':'<div class="result-actions"><button class="btn" data-action="'+(kiosk?'share':'keep')+'">'+(kiosk?'내 폰으로 가져가기':'결과 저장')+'</button><button class="btn btn-line" data-action="'+(kiosk?'home':'list')+'">'+(kiosk?'처음으로':'주류 리스트')+'</button></div>';}
function renderResults(){app.innerHTML=header()+'<main class="result enter">'+readingHTML()+(takeaway?resultActions():'')+mixNotice()
 +'<section class="picks-head" aria-labelledby="recommendation-title"><h2 class="result-title" id="recommendation-title">추천</h2>'+'</section>'
 +(state.picks.length?'<div class="picks recommendation-list">'+state.picks.map((pick,i)=>{const p=pick.product;return '<article class="pick product fade" data-detail="'+i+'" style="--i:'+(i+2)+'" aria-labelledby="product-'+i+'">'+bottlePhoto(p,'pick-photo')+'<div class="pick-body"><p class="pick-role">'+esc(p.cat)+' · '+esc(p.abv)+'%'+(p.vol?' · '+esc(p.vol)+'ml':'')+'</p><h3 id="product-'+i+'">'+esc(p.name)+'</h3><p class="pick-price">'+won(p.price)+'</p><p class="pick-note">'+esc(p.short||p.note)+'</p>'+(pick.matches.length?'<p class="pick-why">'+pick.matches.slice(0,2).map(f=>labels[f]).join(' · ')+'</p>':'')+'<button class="pick-more" type="button">자세히 보기</button></div></article>';}).join('')+'</div>'
  +'<div class="again" role="group" aria-label="추천 다시 받기"><button data-action="more">다른 추천 보기</button><button data-action="adjust">조건 정하기</button></div>'+batchNavigation()+resultActions()+'<p class="hint">카운터에 술 이름을 알려주시면 찾아드립니다. 가격과 재고는 매장에서 확인해 주세요.</p>'
  :'<div class="result-empty"><p>조건에 맞는 술을 찾지 못했습니다.</p><button class="btn btn-line" data-action="adjust">조건 정하기</button><button class="btn btn-line" data-action="review">선택 바꾸기</button></div>')
 +'<footer class="result-foot">'+(takeaway||!state.picks.length?'<button class="link" data-action="home">처음으로</button>':'<button class="link" data-action="review">내 선택 보기</button>')+'<span>적바림</span></footer></main>';}
function mixNotice(){return state.picks.length&&new Set(state.picks.map(x=>family(x.product))).size<2?'<p class="hint">지금 조건에서는 전통주와 와인을 함께 고르기 어려워요. 조건을 조정하면 두 종류를 함께 볼 수 있어요.</p>':'';}
function categoryArt(p){
 const c=p.cat;let index=5;
 if(/탁주/.test(c))index=0;
 else if(/약주|청주|맑은 쌀술/.test(c))index=1;
 else if(/증류|소주|^진$/.test(c))index=2;
 else if(/레드 와인/.test(c))index=3;
 else if(/화이트|스파클링 와인/.test(c))index=4;
 return '<div class="category-art art-'+index+'" role="img" aria-label="'+esc(c)+' 주종 일러스트"><span class="art-caption">'+esc(c)+'</span></div>';
}
app.addEventListener('error',e=>{const t=e.target;if(t.tagName==='IMG'&&t.parentNode&&!t.closest('#list-root')){t.parentNode.classList.add('no-photo');t.remove();}},true);
function bind(){app.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));app.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));app.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>{state.index=+b.dataset.detail;detail();});}
function answer(n){if(busy)return;busy=true;state.answers[state.step]=n;app.querySelectorAll('[data-answer]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.answer===n?'true':'false'));const sc=app.querySelector('.scene');if(sc)sc.classList.add('leaving');clearTimeout(answerTimer);answerTimer=setTimeout(()=>{busy=false;if(state.editing||state.step===questions.length-1){state.editing=false;showResults();}else{state.step++;render();}},lite?200:420);}
function showResults(){state.picks=recommend(state.answers,state.adjust).picks;state.seen=state.picks.map(x=>x.product.id);state.batches=[state.picks];state.batchIndex=0;state.index=0;state.mode='result';render();}
function nextSet(answers,adjust,current,seen){
 const fresh=recommend(answers,adjust,products,{exclude:seen,similar:true});
 if(!fresh.picks.length)return null;
 const mixed=new Set(fresh.picks.map(x=>family(x.product))).size===2;
 const result=fresh.picks.length===4&&(!fresh.mixedAvailable||mixed)?fresh:recommend(answers,adjust,products,{exclude:seen,retain:current.map(x=>x.product.id),similar:true});
 return result.picks.some(x=>!seen.includes(x.product.id))?result.picks:null;
}
function batchNavigation(){return state.batches.length>1?'<nav class="batch-navigation" aria-label="이전 추천 목록"><button class="outline-button" data-action="previous-set" '+(state.batchIndex===0?'disabled':'')+'>← 이전 추천</button><span>'+String(state.batchIndex+1)+' / '+state.batches.length+'</span><button class="outline-button" data-action="next-set" '+(state.batchIndex===state.batches.length-1?'disabled':'')+'>다음 추천 →</button></nav>':'';}
function browseSet(offset){const index=state.batchIndex+offset;if(index<0||index>=state.batches.length)return;state.batchIndex=index;state.picks=state.batches[index];render(false);app.querySelector('.result-title')?.scrollIntoView({block:'start'});}
function moreRecommendations(){
 const seen=state.seen||state.picks.map(x=>x.product.id),next=nextSet(state.answers,state.adjust,state.picks,seen);
 if(!next){toast('비슷한 결의 선택을 모두 살펴봤어요. 조건을 바꾸면 더 만날 수 있어요.');return;}
 const added=next.filter(x=>!seen.includes(x.product.id)).length;
 state.picks=next;state.seen=[...new Set([...seen,...next.map(x=>x.product.id)])];state.batches.push(next);state.batchIndex=state.batches.length-1;state.index=0;render(false);
 app.querySelector('.result-title')?.scrollIntoView({behavior:(window.JUKBARIM_LITE||matchMedia('(prefers-reduced-motion: reduce)').matches)?'auto':'smooth',block:'start'});
 toast('비슷한 취향의 새로운 '+added+'병을 찾았어요.');
}
function showList(){if(takeaway){location.assign(ROOT);return;}clearTimeout(answerTimer);busy=false;if(dialog.open)dialog.close();state.mode='list';render();}
function home(){if(takeaway){location.assign(new URL('../../',location.href).href);return;}list.reset();clearIdle();clearTimeout(answerTimer);busy=false;state={mode:'home',step:0,answers:Array(questions.length).fill(-1),adjust:{price:null,abv:null,dry:false},index:0,picks:[],batches:[],batchIndex:0,editing:false};dialog.close();const u=new URL(location.href);u.searchParams.delete('v');u.searchParams.delete('p');u.searchParams.delete('a');u.searchParams.delete('f');u.searchParams.delete('answers');u.searchParams.delete('filters');history.replaceState(null,'',u);render();}
function action(a){if(busy)return;if(a==='home')return home();if(a==='list')return showList();if(a==='keep'){location.assign(resultURL());return;}if(a==='guide')return showGuide();if(a==='more')return moreRecommendations();if(a==='previous-set')return browseSet(-1);if(a==='next-set')return browseSet(1);if(a==='start'){state.mode='question';state.step=0;render();return;}
 if(a==='back'){if(state.editing){state.editing=false;showResults();}else if(state.step){state.step--;render();}else home();}if(a==='skip')answer(-1);if(a==='reading')showReading();if(a==='review')review();if(a==='adjust')adjust();if(a==='detail')detail();if(a==='share')share();if(a==='save')save();}
let sheetOverflow=null,lastMode=null;
const phone=!kiosk&&!takeaway&&!!(window.history&&history.pushState);
function trackMode(){if(phone&&lastMode==='list'&&state.mode!=='list')history.pushState({jbMode:1},'');lastMode=state.mode;}
let ownBack=false;
if(phone)window.addEventListener('popstate',()=>{if(ownBack){ownBack=false;return;}if(dialog.open){dialog.close();return;}if(state.mode!=='list')showList();});
function modal(content,sheet=false,title='내 취향 자세히 보기',extraClass=''){
 dialog.className=sheet?'reading-sheet'+(extraClass?' '+extraClass:''):'';
 dialog.setAttribute('aria-label',sheet?title:'상세 보기');
 dialog.innerHTML=sheet?'<div class="sheet-toolbar"><span>'+esc(title)+'</span><button class="close" aria-label="'+esc(title)+' 닫기">닫기 ×</button></div><div class="sheet-content">'+content+'</div>':'<button class="close" aria-label="닫기">×</button>'+content;
 dialog.querySelector('.close').onclick=()=>dialog.close();
 if(sheet&&sheetOverflow===null){sheetOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';}
 if(!dialog.open){dialog.showModal();if(phone)history.pushState({jbDialog:1},'');}
 if(sheet){const contentEl=dialog.querySelector('.sheet-content');contentEl.scrollTop=0;contentEl.addEventListener('scroll',resetIdle,{passive:true});}
 resetIdle();
}
function showGuide(){
 modal(`<div class="guide-body">
  <div class="guide-intro"><h2>이용 안내</h2><p>적바림은 <strong>150여 종의 우리술과 와인</strong>이 있는<br>바틀샵이자 시음 공간입니다.<br>술을 사서 가져가시거나 매장에서 드실 수 있고,<br>좋아하는 안주를 가져오셔도 좋습니다.</p></div>
  <section class="guide-step"><span class="guide-number" aria-hidden="true">01</span><div><h3>포장 구매</h3><p>마음에 드는 술을 고른 뒤<br>카운터에서 구매하고 가져가실 수 있습니다.</p></div></section>
  <section class="guide-step"><span class="guide-number" aria-hidden="true">02</span><div class="guide-step-content"><h3>매장 이용</h3><p>먼저 자리를 잡고, 마실 술과<br>마음에 드는 술잔을 골라 주세요.</p>
   <section class="guide-charge" aria-labelledby="charge-title">
    <div class="guide-fee-row"><div><p class="guide-fee-context">매장 이용 시</p><h4 id="charge-title">글라스 차지</h4></div><p class="guide-fee-amount"><span class="guide-fee-unit">1인</span><strong>5,000</strong><span class="guide-fee-won">원</span></p></div>
    <p class="guide-fee-includes">식기와 매장 이용료가 포함되어 있습니다.</p>
   </section>
   <div class="guide-glass-swap"><h4>잔 교체 안내</h4><p>이용 중 잔 교체가 가능합니다.<br><strong>사용 중인 잔과 새로 고른 잔</strong>을 함께 카운터로 가져와 주세요.</p></div>
  </div></section>
  <section class="guide-food"><h3>외부 음식 반입 가능</h3><p>안주는 자유롭게 가져오셔도 좋습니다.<br>다만, <strong>냄새가 강한 음식과 국물 요리</strong>는 피해 주세요.</p></section>
 </div>`,true,'매장 이용 안내','store-guide');
}
function showReading(){modal(readingHTML(true),true);}
dialog.addEventListener('close',()=>{if(phone&&history.state&&history.state.jbDialog){ownBack=true;history.back();}if(sheetOverflow!==null){document.documentElement.style.overflow=sheetOverflow;sheetOverflow=null;}resetIdle();});
dialog.addEventListener('click',e=>{if(e.target!==dialog||!dialog.classList.contains('reading-sheet'))return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();});
function review(){modal('<h2>내 선택</h2><div>'+questions.map((q,i)=>'<button class="option" data-edit="'+i+'"><span class="number">'+String(i+1).padStart(2,'0')+'</span><span class="option-text"><small>'+q.label+'</small><strong>'+esc(q.options[state.answers[i]]?.title||'건너뛴 질문')+'</strong></span><span>↗</span></button>').join('')+'</div>');dialog.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{state.step=+b.dataset.edit;state.editing=true;state.mode='question';dialog.close();render();});}
function adjust(){modal('<h2>조건 정하기</h2><p>정한 조건은 모든 추천에 적용됩니다.</p><label for="price">한 병의 가격</label><select id="price">'+[[0,'제한 없음'],[20000,'2만 원 이하'],[30000,'3만 원 이하'],[50000,'5만 원 이하'],[-50000,'5만 원 초과']].map(([v,t])=>'<option value="'+v+'" '+((state.adjust.minPrice===50000?-50000:state.adjust.price||0)===v?'selected':'')+'>'+t+'</option>').join('')+'</select><label for="abv">도수</label>'+(profile(state.answers).maxABV?'<p class="limit-context">답변에서 고른 '+profile(state.answers).maxABV+'도 이하를 기본으로 적용합니다. ‘30도 이상’을 고르면 이전 도수 답변 대신 이 범위로 추천합니다.</p>':'')+'<select id="abv">'+[[0,'제한 없음'],[12,'12도 이하'],[20,'20도 이하'],[30,'30도 이하'],[-30,'30도 이상']].map(([v,t])=>'<option value="'+v+'" '+((state.adjust.minABV===30?-30:state.adjust.abv||0)===v?'selected':'')+'>'+t+'</option>').join('')+'</select><label for="dry"><input id="dry" type="checkbox" '+(state.adjust.dry?'checked':'')+'> 달지 않다고 설명된 술만</label><button class="primary" id="apply">적용</button>');document.getElementById('apply').onclick=()=>{state.adjust={price:+document.getElementById('price').value>0?+document.getElementById('price').value:null,minPrice:+document.getElementById('price').value===-50000?50000:null,abv:+document.getElementById('abv').value>0?+document.getElementById('abv').value:null,minABV:+document.getElementById('abv').value===-30?30:null,dry:document.getElementById('dry').checked};dialog.close();showResults();};}
function detail(){list.openDetail(state.picks[state.index].product.id);}
function legacyDetail(){const {product:p,matches}=state.picks[state.index];modal('<h2>'+esc(p.name)+'</h2><p>'+(matches.length?'선택한 장면을 '+matches.map(x=>labels[x]).join(', ')+' 쪽으로 해석해 골랐어요. 이 술의 실제 향미 설명도 함께 살펴보세요.':'가격·도수 등 선택한 조건에 맞는 술입니다. 향미가 맞는지는 아래 설명을 함께 살펴보세요.')+'</p><h3>향과 맛</h3><p style="white-space:pre-line">'+esc(p.note)+'</p>'+(p.mood.length?'<h3>분위기로 표현하면</h3><p>'+p.mood.map(esc).join(' · ')+'</p><p><small>향미를 바탕으로 붙인 감성 표현입니다.</small></p>':'')+'<h3>제품 자료</h3><ul>'+p.sources.filter(u=>/^https:\/\//.test(u)).map((u,i)=>'<li><a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(new URL(u).hostname)+' · 자료 '+(i+1)+'</a></li>').join('')+'</ul><p><small>제조사·판매처의 제품 설명을 정리했습니다. 향미 표현은 공인 측정값이 아니며, 온도와 개인에 따라 다르게 느낄 수 있습니다.</small></p>');}
function resultURL(){
 if(takeaway)return location.href;
 const u=new URL('r/'+TAKEAWAY_RELEASE+'/',ROOT);u.search='';
 const payload=new URLSearchParams();
 payload.set('v',QUESTION_VERSION);payload.set('p',state.picks.map(x=>x.product.id).join(','));
 payload.set('a',state.answers.map(a=>a<0?'x':a).join(''));
 payload.set('f',[state.adjust.price||0,state.adjust.abv||0,state.adjust.dry?1:0,state.adjust.minABV||0,state.adjust.minPrice||0].join(','));
 u.hash=payload.toString();return u.href;
}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
let qrLoading=null;
function loadQRCode(){
 if(typeof window.qrcode==='function')return Promise.resolve();
 if(qrLoading)return qrLoading;
 qrLoading=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=new URL('assets/qrcode.js',ROOT).href;script.async=true;
  function fail(){script.remove();qrLoading=null;reject(new Error('QR load failed'));}
  script.onload=()=>typeof window.qrcode==='function'?resolve():fail();
  script.onerror=fail;document.head.appendChild(script);
 });
 return qrLoading;
}
async function share(){
 try{
  if(!/^https?:$/.test(new URL(location.href).protocol)){toast('서비스를 웹 주소로 연 뒤 이용해 주세요.');return;}
  await loadQRCode();
  if(state.mode!=='result')return;
  const qr=qrcode(0,'M');qr.addData(resultURL(),'Byte');qr.make();
  modal('<div class="qr-panel"><p class="eyebrow">내 폰으로 가져가기</p><h2>이 결과, 저장해 두세요.</h2><div class="result-qr">'+qr.createSvgTag({cellSize:6,margin:24,scalable:true,alt:'휴대폰에서 내 취향 결과 열기'})+'</div><p>휴대폰 카메라로 QR을 찍어 주세요.<br>추천 술과 취향 분석을 이미지로 받을 수 있어요.</p><small>매장 화면이 처음으로 돌아가도<br>휴대폰에 열린 결과는 그대로 남아요.</small></div>');
 }catch{toast('QR을 만들지 못했어요. 잠시 뒤 다시 눌러 주세요.');}
}
async function save(){
 if(!takeaway){share();return;}
 try{
  toast('전체 결과를 이미지로 만들고 있어요.');
  const blob=await window.JukbarimCard.create({reading:analyze(state.answers),products:state.picks.map(x=>x.product)});
  if(exportURL)URL.revokeObjectURL(exportURL);exportURL=URL.createObjectURL(blob);
  modal('<h2>이미지가 준비됐어요.</h2><a class="primary save-link" href="'+exportURL+'" download="jukbarim-taste.png">이미지 다운로드</a><button class="outline-button phone-share" id="share-image">휴대폰 공유 메뉴 열기</button><p class="save-hint">사진 앱에 넣으려면 공유 메뉴에서 이미지 저장을 선택하거나, 아래 이미지를 길게 눌러 저장해 주세요.</p><img class="card-preview" src="'+exportURL+'" alt="내 취향 분석 전체와 추천 술 '+state.picks.length+'종">');
  const file=new File([blob],'jukbarim-taste.png',{type:'image/png'}),button=document.getElementById('share-image');
  button.hidden=!navigator.canShare?.({files:[file]});
  button.onclick=async()=>{try{await navigator.share({files:[file],title:'적바림 취향 노트'});}catch(e){if(e.name!=='AbortError')toast('이미지 다운로드 버튼이나 길게 누르기를 이용해 주세요.');}};
 }catch{toast('이미지를 만들지 못했어요. 잠시 뒤 다시 눌러 주세요.');}
}
const idleDialog=document.getElementById('idle-dialog');
function clearIdle(){clearTimeout(idleTimer);clearInterval(idleCountdown);idleDeadline=0;if(idleDialog.open)idleDialog.close();}
function resumeSession(){clearIdle();resetIdle();if(idleFocus?.isConnected)idleFocus.focus({preventScroll:true});}
function updateCountdown(){
 const seconds=Math.max(0,Math.ceil((idleDeadline-Date.now())/1000));
 if(!seconds){home();return;}
 if(seconds<=15){
  if(!idleDialog.open){idleFocus=document.activeElement;idleDialog.showModal();document.getElementById('idle-continue').focus();}
  document.getElementById('idle-seconds').textContent=String(seconds);
 }
}
function warnIdle(){if(state.mode==='home'&&!dialog.open)return;updateCountdown();if(idleDeadline)idleCountdown=setInterval(updateCountdown,250);}
function resetIdle(){if(takeaway||!kiosk){clearIdle();return;}if(idleDialog.open)return;clearTimeout(idleTimer);clearInterval(idleCountdown);idleDeadline=0;if(state.mode!=='home'||dialog.open){idleDeadline=Date.now()+90000;idleTimer=setTimeout(warnIdle,75000);}}
document.getElementById('idle-continue').onclick=resumeSession;
document.getElementById('idle-home').onclick=home;
idleDialog.addEventListener('cancel',e=>{e.preventDefault();resumeSession();});
// Capture scrolls in the reading sheet too. Scrolling counts as actively reading.
['pointerdown','keydown','scroll'].forEach(e=>document.addEventListener(e,resetIdle,{passive:true,capture:true}));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&idleDeadline)updateCountdown();});

list=window.JukbarimList({app,dialog,esc,money,lite:lite,modal:(...a)=>modal(...a),showList:()=>showList()});
window.JukbarimCatalog.onChange(next=>{products=next;if(takeaway){if(state.mode!=='result'){try{if(!sessionStorage.getItem('jb-reloaded')){sessionStorage.setItem('jb-reloaded','1');location.reload();}}catch(e){}}return;}if(state.mode==='list')list.refresh();else if(state.mode==='home'&&!dialog.open)render(false);});
const params=new URLSearchParams(location.hash?location.hash.slice(1):location.search),a=params.get('a');if(params.get('v')===QUESTION_VERSION&&a&&/^[0-3x]{10}$/.test(a)){state.answers=[...a].map(x=>x==='x'?-1:+x);const f=(params.get('f')||'').split(',').map(Number);state.adjust={price:[20000,30000,50000].includes(f[0])?f[0]:null,abv:[12,20,30].includes(f[1])?f[1]:null,dry:f[2]===1,minABV:f[3]===30?30:null,minPrice:f[4]===50000?50000:null};state.mode='result';state.picks=recommend(state.answers,state.adjust).picks;}
if(state.mode==='result'){
 const ids=(params.get('p')||'').split(',');
 const valid=products.filter(p=>ids.includes(p.id)&&(takeaway||(p.available!==false&&p.price<=(state.adjust.minPrice===50000?Infinity:state.adjust.price||Infinity)&&(state.adjust.minPrice!==50000||p.price>50000)&&p.abv>=(state.adjust.minABV||0)&&p.abv<=(state.adjust.minABV===30?Infinity:Math.min(state.adjust.abv||Infinity,profile(state.answers).maxABV||Infinity))&&(!state.adjust.dry||p.features.includes('dry')))));
 const exact=ids.length>=1&&ids.length<=4&&new Set(ids).size===ids.length&&valid.length===ids.length;
 if(exact){state.picks=ids.map((id,i)=>{const product=valid.find(p=>p.id===id);return {product,matches:profile(state.answers).features.filter(f=>product.features.includes(f)),role:i===0?'먼저 살펴볼 한 병':'함께 비교할 한 병',slot:i<2?'value':'discovery'};});}
 else {
  const retiredLink=ids.length>=1&&ids.length<=4&&new Set(ids).size===ids.length&&ids.some(id=>RETIRED_PRODUCT_IDS.has(id))&&ids.every(id=>RETIRED_PRODUCT_IDS.has(id)||products.some(p=>p.id===id));
  if(retiredLink)state.catalogUpdated=true;
  else if(takeaway){state.mode='home';state.picks=[];}
 }
 state.seen=state.picks.map(x=>x.product.id);state.batches=[state.picks];state.batchIndex=0;
}
window.Jukbarim={questions,profile,analyze,recommend,getState:()=>structuredClone(state)};
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'set_taste_answers',title:'취향 답변 적용',description:'10개 질문의 답변으로 추천 결과를 표시합니다. -1은 건너뛰기, 0~3은 선택지 순서입니다.',inputSchema:{type:'object',properties:{answers:{type:'array',items:{type:'integer',minimum:-1,maximum:3},minItems:10,maxItems:10}},required:['answers'],additionalProperties:false},execute(input){if(!Array.isArray(input.answers)||input.answers.length!==10||input.answers.some(x=>!Number.isInteger(x)||x< -1||x>3))throw Error('답변 10개를 확인해 주세요.');clearTimeout(answerTimer);busy=false;state.answers=[...input.answers];state.adjust={price:null,abv:null,dry:false};dialog.close();showResults();return{recommendations:state.picks.map(x=>({id:x.product.id,name:x.product.name}))};}})).catch(()=>{});}catch{}}
if(!takeaway&&!kiosk&&state.mode==='home')state.mode='list';
if(takeaway&&state.mode!=='result'){document.body.dataset.view='takeaway';app.innerHTML='<main class="empty"><h1>결과를 열 수 없어요.</h1><p>매장 화면의 QR을 다시 찍어 주세요.</p><a href="../../">처음 화면으로</a></main>';}else render(false);
if(state.catalogUpdated)toast('판매 목록이 변경되어 추천 결과를 갱신했어요.');
if(a&&params.get('v')!==QUESTION_VERSION)toast('질문이 새로워졌어요. 다시 선택해 주세요.');
})();
