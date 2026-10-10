(() => {
  'use strict';

  // Ver.6：旧36問は出題データから削除。基礎も37問に厳選。
  const BASIC_QUESTIONS = (window.CPA_FOUNDATION_QUESTIONS || []).map(q=>({...q,difficulty:'基礎'}));
  const ADVANCED_QUESTIONS = [...(window.CPA_ADVANCED_QUESTIONS || []), ...(window.CPA_V6_QUESTIONS || [])];
  const CPA_QUESTIONS = [...ADVANCED_QUESTIONS, ...BASIC_QUESTIONS];
  const ACTIVE_QUESTIONS = ADVANCED_QUESTIONS;
  const QUESTIONS = CPA_QUESTIONS;
  const LIVE_IDS = new Set(QUESTIONS.map(q=>q.id));

  // Ver.4: 計算問題の誤答選択肢は論点別に編集した値を用いる。
  // q.answer（数値・問題ID）は従来どおり保持して学習履歴を引き継ぐ。
  const CALC_DISTRACTORS = {"P1-005":[1800000,1950000,2050000],"P1-006":[4000000,4500000,6000000],"P1-007":[5000000,5300000,5100000],"P1-008":[6500000,6900000,6800000],"P1-009":[400000,240000,300000],"P1-010":[60000,300000,480000],"P1-011":[120000,110000,300000],"P1-013":[3200000,1000000,4200000],"P1-016":[4800,6000,12000],"P1-017":[20000,240000,200000],"P1-018":[1510,1540,1600],"P1-019":[180000,54000,140000],"P1-020":[0,10000,40000],"P1-021":[9000,5000,3000],"P1-022":[49000,53500,0],"P1-023":[50000,25000,15000],"P1-025":[900000,2000000,1000000],"P1-026":[2000,3000,12000],"P1-029":[140000,240000,300000],"P1-030":[52500,87500,70000],"P1-032":[490000,420000,310000],"P1-033":[90000,350000,115500],"P1-034":[60000,90000,150000],"P1-035":[130000,200000,60000],"P2-001":[2000,310000,300000],"P2-002":[116000,112000,5000],"P2-004":[5000000,4800000,490000],"P2-005":[60000,30000,10000],"P2-007":[8000000,5500000,13500000],"P2-009":[1100000,1210000,1331000],"P2-010":[1050000,100000,25000],"P2-014":[300000,1200000,750000],"P2-016":[1200000,1500000,240000],"P2-017":[2000000,8000000,900000],"P2-018":[200000,400000,320000],"P2-019":[140000,200000,30000],"P3-001":[2000000,1400000,300000],"P3-002":[500000,300000,125000],"P3-005":[1200000,1350000,900000],"P3-007":[5000,700000,750000],"P3-008":[100000,1500000,150000000],"P3-010":[2700000,3500000,3700000],"P3-014":[10500000,12000000,13500000],"P3-017":[50,100,500],"P3-018":[240,30,3000],"G1-002":[500000,520000,510000],"G1-003":[210,215,230],"G1-004":[2200,20000,1000],"G1-005":[750000,400000,150000],"G1-006":[420,480,500],"G1-008":[1200,2400,3000],"G1-009":[320000,150000,500000],"G1-010":[36000,140000,660000],"G1-012":[200000,300000,600000],"G1-013":[180000,200000,220000],"G1-014":[80000,150000,180000],"G1-015":[300,180,240],"G1-016":[800,1000,850],"G1-019":[300000,450000,900000],"G1-020":[150,200,125],"G1-022":[12000,20000,215000],"G1-023":[50000,20000,10500],"G2-001":[800,1250,3000],"G2-002":[2400000,3600000,4800000],"G2-003":[70,20,40],"G2-004":[5000000,6000000,3000000],"G2-006":[5000000,6250000,400000],"G2-007":[1200000,1420000,1100000],"G2-008":[50000,200000,1900000],"G2-009":[300000,1300000,2200000],"G2-011":[180000,50000,820000],"G2-013":[200,800,1000],"G2-014":[420000,0,220000],"G2-017":[7200,6000,4800],"G2-018":[15,20,40],"G2-019":[1800000,3000000,450000],"R17-001":[10000,8000,3000],"R17-003":[1000,800,900],"R18-001":[400,700,500],"R18-002":[16000,10000,4000],"R19-002":[30000,120000,0],"R19-003":[800000,500000,1300000],"R22-002":[200000,40000,160000],"R22-003":[80000,120000,100000],"R24-001":[270000,350000,110000],"R24-003":[200000,600000,700000],"R32-001":[1200,800,3200],"R32-002":[2000,800,3200]};
  let activeNumericOptions = null;

  function answerUnit(q){
    if(q.unit)return q.unit;
    const tail=q.q.slice(-42);
    const m=tail.match(/[（(](円\/時間|円\/kg|個相当|円|千円|万円|kg|時間|個|％|%)[)）][？?]?\s*$/);
    if(m)return m[1]==='％'?'%':m[1];
    if(/[％%][？?]?\s*$/.test(tail)||/安全余裕率|ROI|利益率/.test(tail))return '%';
    if(/何時間/.test(tail))return '時間';
    if(/何個|換算量/.test(tail))return '個';
    return '円';
  }
  function formatNumeric(q,value){return `${Number(value).toLocaleString('ja-JP')}${answerUnit(q)}`;}
  function fallbackDistractors(answer,unit){
    // 将来増えた計算問題用。答えを保持し、重複値が出ないようにする。
    const percent=unit==='%';
    const step=percent?5:(answer>=1000000?100000:answer>=100000?10000:answer>=10000?1000:answer>=1000?100:answer>=100?10:1);
    const vals=[];
    for(const mult of [-2,-1,1,2,-3,3,-4,4,5]){
      const candidate=answer+mult*step;
      if(candidate<0 || (percent && candidate>100) || candidate===answer || vals.includes(candidate))continue;
      vals.push(candidate);
      if(vals.length===3)break;
    }
    return vals;
  }
  function numericOptionsFor(q){
    const answer=Number(q.answer);
    const raw=q.distractors || CALC_DISTRACTORS[q.id]||fallbackDistractors(answer,answerUnit(q));
    const wrong=[...new Set(raw.map(Number))].filter(v=>Number.isFinite(v)&&v!==answer);
    if(wrong.length!==3){console.error('計算問題の選択肢を確認してください',q.id);return null;}
    const values=[answer,...wrong];
    // Fisher-Yates: 正答が毎回同じ位置にならないようにする
    for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}
    return {values,correctIndex:values.indexOf(answer)};
  }

  const BOOK_OPTIONS = [
    ['P1','商会 教科書 第Ⅰ部'],['P2','商会 教科書 第Ⅱ部'],['P3','商会 教科書 第Ⅲ部'],
    ['G1','工原 教科書 第Ⅰ部'],['G2','工原 教科書 第Ⅱ部'],
    ['R17','レジュメ #17 標準原価計算②'],['R18','レジュメ #18 標準原価計算③'],
    ['R19','レジュメ #19 直接原価計算'],['R22','レジュメ #22 予算管理②'],
    ['R24','レジュメ #24 意思決定会計'],['R32','レジュメ #32 内部振替価格']
  ];
  function bookId(q){return q.book || (q.id.startsWith('P1-')?'P1':'legacy');}


  const DB_NAME='boki1_commute_db';
  const DB_VERSION=1;
  const STORE='kv';
  const today=()=>{const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`;};
  const addDays=(dateStr,n)=>{const [y,m,d]=dateStr.split('-').map(Number); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()+n); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;};
  const fmtDateTime=(iso)=>{try{return new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(iso));}catch{return '';}};
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const $=id=>document.getElementById(id);

  let db;
  let installPrompt=null;
  let state={favorites:[],qstats:{},history:[],daily:{date:today(),count:0},streak:{days:0,lastStudyDate:null}};
  let session={queue:[],index:0,correct:0,answered:0,mode:'',answeredCurrent:false};

  function openDB(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);};
      req.onsuccess=()=>{db=req.result;resolve(db);};
      req.onerror=()=>reject(req.error);
    });
  }
  function dbGet(key){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  function dbSet(key,val){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');const req=tx.objectStore(STORE).put(val,key);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});}
  async function loadState(){
    const saved=await dbGet('state'); if(saved)state={...state,...saved};
    if(!Array.isArray(state.favorites))state.favorites=[];
    if(!Array.isArray(state.history))state.history=[];
    if(!state.qstats||typeof state.qstats!=='object')state.qstats={};
    // 旧出典未検証36問の記録は出題・集計に含めない（過去データのバックアップには旧項目が残る場合あり）。
    for(const id of Object.keys(state.qstats)){if(/^[CI]\d{2}$/.test(id))delete state.qstats[id];}
    state.favorites=state.favorites.filter(id=>LIVE_IDS.has(id));
    state.history=state.history.filter(entry=>LIVE_IDS.has(entry.id));
    normalizeDaily();
    if(saved)await saveState();
  }
  async function saveState(){state.history=state.history.slice(0,200);if(db) await dbSet('state',state);}

  function normalizeDaily(){
    if(!state.daily||state.daily.date!==today()) state.daily={date:today(),count:0};
    if(!state.streak) state.streak={days:0,lastStudyDate:null};
  }
  function markStudyDay(){
    const t=today();
    if(state.streak.lastStudyDate===t) return;
    const y=addDays(t,-1);
    state.streak.days=state.streak.lastStudyDate===y ? state.streak.days+1 : 1;
    state.streak.lastStudyDate=t;
  }

  function qstat(id){return state.qstats[id]||{attempts:0,correct:0,correctStreak:0,lastResult:null,lastAnswered:null,nextDue:null};}
  function adaptiveScore(q){
    const s=qstat(q.id); let score=0;
    const related=topicAccuracy(q.topic);
    if(related.attempts>=2 && related.rate<70) score+=2;
    if(!s.attempts) score+=7;
    const wrongRate=s.attempts ? 1-(s.correct/s.attempts) : .5;
    score+=wrongRate*6;
    if(s.lastResult===false) score+=5;
    if(s.nextDue && s.nextDue<=today()) score+=4;
    score+=Math.max(0,3-s.correctStreak)*0.6;
    if(q.importance==='A') score+=3;
    else if(q.importance==='B') score+=1.5;
    else if(q.importance==='C') score-=0.5;
    score+=Math.random()*1.5;
    return score;
  }
  function pickAdaptive(pool,count){return [...pool].sort((a,b)=>adaptiveScore(b)-adaptiveScore(a)).slice(0,Math.min(count,pool.length));}
  function topicAccuracy(topic){
    const ids=QUESTIONS.filter(q=>q.topic===topic).map(q=>q.id); let a=0,c=0;
    ids.forEach(id=>{const s=qstat(id);a+=s.attempts;c+=s.correct;});
    return {attempts:a,correct:c,rate:a?Math.round(c/a*100):null};
  }
  function wrongQuestions(){return QUESTIONS.filter(q=>{const s=qstat(q.id);return s.attempts>0 && (s.lastResult===false || (s.correct/s.attempts)<0.7);});}

  function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));if(id==='homeView')renderHome();if(id==='statsView')renderStats();window.scrollTo({top:0,behavior:'smooth'});}

  function filteredQuestions(){
    const b=$('bookSelect').value,topic=$('topicSelect').value,type=$('typeSelect').value,level=$('difficultySelect').value;
    return CPA_QUESTIONS.filter(q=>(b==='all'||bookId(q)===b) && (topic==='all'||q.topic===topic) && (type==='all'||q.type===type) && (level==='all'||(level==='challenge' ? q.difficulty!=='基礎' : q.difficulty===level)));
  }
  function refreshSelectTopics(){
    const b=$('bookSelect').value, selected=$('topicSelect').value;
    const level=$('difficultySelect').value;
    const filtered=CPA_QUESTIONS.filter(q=>(b==='all'||bookId(q)===b) && (level==='all'||(level==='challenge'?q.difficulty!=='基礎':q.difficulty===level)));
    const topics=[...new Set(filtered.map(q=>q.topic))].sort((a,b)=>a.localeCompare(b,'ja'));
    $('topicSelect').replaceChildren(new Option('すべての論点','all'),...topics.map(t=>new Option(`${t}（${filtered.filter(q=>q.topic===t).length}問）`,t)));
    if(topics.includes(selected))$('topicSelect').value=selected;
    refreshSelectionCount();
  }
  function refreshSelectionCount(){
    const n=filteredQuestions().length;
    $('selectionCount').textContent=`条件に合う問題：${n}問`;
    $('runSelectionBtn').disabled=n===0;
    $('runSelectionBtn').textContent=n===0?'該当問題がありません':'選択した条件で学習';
  }
  function buildTopicButtons(){
    const b=$('bookSelect');
    for(const [id,title] of BOOK_OPTIONS){const count=CPA_QUESTIONS.filter(q=>bookId(q)===id).length;b.appendChild(new Option(`${title}（${count}問）`,id));}
    b.querySelector('option[value="all"]').textContent=`すべての教材（${CPA_QUESTIONS.length}問）`;
    refreshSelectTopics();
  }

  function renderHome(){
    normalizeDaily();
    $('streakDays').textContent=state.streak.days||0;
    $('todayText').textContent=`${Math.min(state.daily.count,10)} / 10問`;
    $('todayBar').style.width=`${clamp(state.daily.count*10,0,100)}%`;
    $('wrongCount').textContent=`${wrongQuestions().length}問`;
    $('favoriteCount').textContent=`${state.favorites.length}問`;
    let attempts=0,correct=0;Object.entries(state.qstats).forEach(([id,s])=>{if(!LIVE_IDS.has(id))return;attempts+=s.attempts;correct+=s.correct;});
    $('statAnswered').textContent=attempts;
    $('statRate').textContent=attempts?`${Math.round(correct/attempts*100)}%`:'--';
    $('statWeak').textContent=wrongQuestions().length;
    $('dailyBtn').textContent=state.daily.count>=10?'✓ 今日の10問 完了（追加学習）':'▶ 今日の10問';
  }

  function startQuiz(mode,pool,count,adaptive=true){
    if(!pool.length){alert('対象の問題がまだありません。');return;}
    session={queue:adaptive?pickAdaptive(pool,count):[...pool].sort(()=>Math.random()-.5).slice(0,count),index:0,correct:0,answered:0,mode,answeredCurrent:false};
    $('modeLabel').textContent=mode;showView('quizView');renderQuestion();
  }

  function typeLabel(type){return type==='number'?'計算・4択':type==='journal'?'仕訳':'一問一答';}
  function renderQuestion(){
    const q=session.queue[session.index]; if(!q){finishQuiz();return;}
    session.answeredCurrent=false;
    $('counter').textContent=`${session.index+1} / ${session.queue.length}`;
    $('subjectBadge').textContent=q.subject.includes('商業')?'商会':'工原';
    $('topicBadge').textContent=q.topic;
    $('importanceBadge').textContent=q.importance && q.importance!=='未設定' ? '重要度'+q.importance : '重要度未設定';
    $('importanceBadge').classList.toggle('hidden',!q.source);
    $('typeBadge').textContent=typeLabel(q.type)+(q.difficulty?' · '+q.difficulty:'');
    $('questionText').textContent=q.q;
    calcReset();
    const note=q.type==='number'?'計算して、正しい数値を4つから選んでください。':(q.note||'');
    $('questionNote').textContent=note;$('questionNote').classList.toggle('hidden',!note);
    $('starBtn').textContent=state.favorites.includes(q.id)?'★':'☆';
    $('feedback').classList.add('hidden');$('feedback').innerHTML='';$('nextBtn').classList.add('hidden');$('sourceRef').textContent='';
    const area=$('answerArea');area.innerHTML='';
    activeNumericOptions=q.type==='number'?numericOptionsFor(q):null;
    const labels=q.type==='number' ? (activeNumericOptions?.values || []).map(value=>formatNumeric(q,value)) : q.choices;
    labels.forEach((c,i)=>{
      const b=document.createElement('button');b.type='button';b.className='choice';
      b.textContent=`${String.fromCharCode(65+i)}. ${c}`;
      b.addEventListener('click',()=>answerChoice(i,b));area.appendChild(b);
    });
  }

  async function recordAnswer(q,correct,userAnswer){
    if(session.answeredCurrent) return; session.answeredCurrent=true;
    const s=qstat(q.id);s.attempts++;if(correct){s.correct++;s.correctStreak++;s.lastResult=true;}else{s.correctStreak=0;s.lastResult=false;}s.lastAnswered=new Date().toISOString();
    const intervals=[1,3,7,14,30];s.nextDue=addDays(today(),correct?intervals[Math.min(s.correctStreak-1,intervals.length-1)]:1);state.qstats[q.id]=s;
    markStudyDay();state.daily.count++;
    session.answered++;if(correct)session.correct++;
    state.history.unshift({id:q.id,topic:q.topic,subject:q.subject,correct,at:new Date().toISOString(),userAnswer});
    await saveState();renderHome();
  }

  async function answerChoice(i,button){
    if(session.answeredCurrent)return;
    const q=session.queue[session.index];
    const correctIndex=q.type==='number'?activeNumericOptions.correctIndex:q.answer;
    const correct=i===correctIndex;
    document.querySelectorAll('#answerArea .choice').forEach((b,idx)=>{
      b.disabled=true;if(idx===correctIndex)b.classList.add('correct');
    });
    if(!correct)button.classList.add('wrong');
    const userAnswer=q.type==='number'?activeNumericOptions.values[i]:q.choices[i];
    await recordAnswer(q,correct,userAnswer);
    showFeedback(q,correct,q.type==='number'?`正解：${formatNumeric(q,q.answer)}`:'');
  }
  function showFeedback(q,correct,extra=''){
    const f=$('feedback');f.classList.remove('hidden');f.innerHTML=`<strong class="${correct?'good':'bad'}">${correct?'○ 正解！':'× 不正解'}</strong>${extra?`<div>${extra}</div>`:''}<div>${q.ex}</div><div class="muted" style="margin-top:6px;font-size:12px">次回復習目安：${qstat(q.id).nextDue}</div>`;$('nextBtn').classList.remove('hidden');
    $('sourceRef').textContent=q.source ? `教材の参照先：${q.source} ／ 第${q.chapter || '-'}章 ／ ${q.pdfPage ? 'PDF '+q.pdfPage+'ページ' : (q.page ? '本文 p.'+q.page : '章・論点を参照（ページ番号未指定）')}。教材の論点を参考に独自作問。` : '参照教材を確認してください。';
  }

  function finishQuiz(){
    const rate=session.answered?Math.round(session.correct/session.answered*100):0;
    $('resultScore').textContent=`${session.correct} / ${session.answered}問正解（${rate}%）`;
    $('resultMessage').textContent=rate>=80?'良いペースです。苦手問題は自動で次回の出題優先度が上がります。':rate>=60?'間違えた問題を翌日優先的に復習できるよう設定しました。':'苦手論点を優先出題に反映しました。短時間でも繰り返すのがおすすめです。';
    const sessionTopics=[...new Set(session.queue.map(q=>q.topic))].map(t=>({t,...topicAccuracy(t)})).filter(x=>x.attempts).sort((a,b)=>(a.rate??101)-(b.rate??101)).slice(0,3);
    $('resultWeakTopics').innerHTML=sessionTopics.length?`<b>復習候補</b><br>${sessionTopics.map(x=>`${x.t}：${x.rate}%`).join('<br>')}`:'';showView('resultView');
  }

  function renderStats(){
    let a=0,c=0;Object.entries(state.qstats).forEach(([id,s])=>{if(!LIVE_IDS.has(id))return;a+=s.attempts;c+=s.correct;});$('sAnswered').textContent=a;$('sRate').textContent=a?`${Math.round(c/a*100)}%`:'--';$('sStreak').textContent=`${state.streak.days||0}日`;
    const topics=[...new Set(QUESTIONS.map(q=>q.topic))];const wrap=$('topicStats');wrap.innerHTML='';topics.map(t=>({t,...topicAccuracy(t)})).sort((x,y)=>{if(x.rate===null)return 1;if(y.rate===null)return-1;return x.rate-y.rate;}).forEach(x=>{const d=document.createElement('div');d.className='topic-stat';d.innerHTML=`<div class="topic-stat-head"><span>${x.t}</span><b>${x.rate===null?'未学習':x.rate+'%'}</b></div><div class="mini-bar"><div style="width:${x.rate||0}%"></div></div>`;wrap.appendChild(d);});
    const h=$('recentHistory');h.innerHTML=state.history.length?'': '<p class="muted">まだ学習履歴がありません。</p>';state.history.slice(0,12).forEach(x=>{const d=document.createElement('div');d.className='history-item';d.innerHTML=`${x.correct?'○':'×'} <b>${x.topic}</b> <span class="muted">${fmtDateTime(x.at)}</span>`;h.appendChild(d);});
  }

  $('dailyBtn').addEventListener('click',()=>startQuiz('今日の10問／標準・応用',ACTIVE_QUESTIONS,10,true));
  $('commuteBtn').addEventListener('click',()=>startQuiz('通勤5分／標準・応用',ACTIVE_QUESTIONS,3,true));
  $('wrongBtn').addEventListener('click',()=>startQuiz('間違い復習',wrongQuestions(),10,true));
  $('favoriteBtn').addEventListener('click',()=>startQuiz('お気に入り',QUESTIONS.filter(q=>state.favorites.includes(q.id)),10,false));
  $('weakBtn').addEventListener('click',()=>startQuiz('苦手優先／標準・応用',ACTIVE_QUESTIONS,10,true));
  $('allTopicsBtn').addEventListener('click',()=>startQuiz('標準・応用／全教材',ACTIVE_QUESTIONS,10,false));
  
  $('bookSelect').addEventListener('change',refreshSelectTopics);
  $('difficultySelect').addEventListener('change',refreshSelectTopics);
  $('topicSelect').addEventListener('change',refreshSelectionCount);
  $('typeSelect').addEventListener('change',refreshSelectionCount);
  $('runSelectionBtn').addEventListener('click',()=>{
    const pool=filteredQuestions(); if(!pool.length)return;
    startQuiz('教材・論点別演習',pool,Number($('countSelect').value),true);
  });
  $('exportBtn').addEventListener('click',()=>{
    try{
      const blob=new Blob([JSON.stringify({app:'boki1-commute',version:6,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='boki1-learning-backup-'+today()+'.json';a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      $('backupMessage').textContent='バックアップファイルを保存しました。';
    }catch(e){$('backupMessage').textContent='保存に失敗しました。ブラウザのダウンロード設定を確認してください。';}
  });
  $('importInput').addEventListener('change',async event=>{
    const file=event.target.files&&event.target.files[0];if(!file)return;
    try{
      const data=JSON.parse(await file.text());
      if(data.app!=='boki1-commute'||!data.state||!Array.isArray(data.state.history)||!data.state.qstats || !Array.isArray(data.state.favorites))throw Error('invalid');
      if(!confirm('現在の学習記録をバックアップの内容で置き換えます。よろしいですか？'))return;
      state={...state,...data.state};state.favorites=state.favorites.filter(id=>LIVE_IDS.has(id));state.history=state.history.filter(entry=>LIVE_IDS.has(entry.id));for(const id of Object.keys(state.qstats)){if(/^[CI]\d{2}$/.test(id))delete state.qstats[id];}normalizeDaily();await saveState();renderHome();
      $('backupMessage').textContent='学習記録を復元しました。';
    }catch(e){$('backupMessage').textContent='読込できませんでした。正しいバックアップJSONを選択してください。';}
    finally{event.target.value='';}
  });
  $('statsBtn').addEventListener('click',()=>showView('statsView'));
  $('statsBackBtn').addEventListener('click',()=>showView('homeView'));
  $('backBtn').addEventListener('click',()=>showView('homeView'));
  $('resultHomeBtn').addEventListener('click',()=>showView('homeView'));
  $('nextBtn').addEventListener('click',()=>{session.index++;if(session.index>=session.queue.length)finishQuiz();else renderQuestion();});
  $('starBtn').addEventListener('click',async()=>{const q=session.queue[session.index];const i=state.favorites.indexOf(q.id);if(i>=0)state.favorites.splice(i,1);else state.favorites.push(q.id);$('starBtn').textContent=state.favorites.includes(q.id)?'★':'☆';await saveState();renderHome();});

  // 学習用電卓：文字列を自前の構文解析器で演算し、eval()は使用しない。
  let calcExpression='';
  let calcJustEvaluated=false;
  function calcDisplay(){
    const display=$('calcDisplay');
    display.textContent=calcExpression||'0';
    display.setAttribute('aria-label','電卓の式 '+(calcExpression||'0'));
  }
  function calcReset(){calcExpression='';calcJustEvaluated=false;calcDisplay();}
  function parseCalculation(expr){
    const s=expr.replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-');
    if(s.length>80 || !/^[0-9.+*/()%\-]+$/.test(s))throw Error('invalid');
    let i=0;
    function spaces(){while(s[i]===' ')i++;}
    function factor(){
      spaces();let v;
      if(s[i]==='+'){i++;v=factor();}
      else if(s[i]==='-'){i++;v=-factor();}
      else if(s[i]==='('){i++;v=sum();if(s[i]!==')')throw Error('paren');i++;}
      else {
        const m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
        if(!m)throw Error('number');
        i+=m[0].length;v=Number(m[0]);
      }
      while(s[i]==='%'){v/=100;i++;}
      if(!Number.isFinite(v))throw Error('range');
      return v;
    }
    function product(){let v=factor();while(s[i]==='*'||s[i]==='/'){const op=s[i++],b=factor();if(op==='/'&&b===0)throw Error('zero');v=op==='*'?v*b:v/b;}return v;}
    function sum(){let v=product();while(s[i]==='+'||s[i]==='-'){const op=s[i++],b=product();v=op==='+'?v+b:v-b;}return v;}
    const result=sum();
    if(i!==s.length||!Number.isFinite(result)||Math.abs(result)>1e13)throw Error('range');
    return Math.abs(result)<1e-10 ? 0 : Number(result.toPrecision(12));
  }
  function calcInput(key){
    if(key==='C'){calcReset();return;}
    if(key==='⌫'){calcExpression=calcExpression.slice(0,-1);calcJustEvaluated=false;calcDisplay();return;}
    if(key==='='){
      try{const val=parseCalculation(calcExpression);calcExpression=String(val);calcJustEvaluated=true;calcDisplay();}
      catch{$('calcDisplay').textContent='計算式を確認してください';calcJustEvaluated=false;}
      return;
    }
    if(calcJustEvaluated&&(/[0-9.(]/.test(key)))calcExpression='';
    calcJustEvaluated=false;
    if(calcExpression.length>=72)return;
    if(key==='.'){
      const part=calcExpression.split(/[+−×÷()%]/).at(-1)||'';
      if(part.includes('.'))return;
      if(!part)key='0.';
    }
    if(/[×÷+−]/.test(key)){
      if(!calcExpression&&key!=='−')return;
      if(/[+−×÷]$/.test(calcExpression)){
        if(key!=='−'){calcExpression=calcExpression.slice(0,-1)+key;calcDisplay();return;}
        if(calcExpression.endsWith('−'))return;
      }
    }
    calcExpression+=key;
    calcDisplay();
  }
  $('calculatorToggle').addEventListener('click',()=>{
    const open=$('calculatorPanel').classList.toggle('hidden')===false;
    $('calculatorToggle').setAttribute('aria-expanded',String(open));
    $('calculatorToggle').textContent=open?'🧮 電卓を閉じる':'🧮 電卓を開く';
  });
  $('calculatorPanel').querySelectorAll('button[data-key]').forEach(button=>{
    button.addEventListener('click',()=>calcInput(button.dataset.key));
  });

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installBtn').classList.remove('hidden');});
  $('installBtn').addEventListener('click',async()=>{if(!installPrompt){alert('ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選択してください。');return;}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installBtn').classList.add('hidden');});
  window.addEventListener('appinstalled',()=>{$('installBtn').classList.add('hidden');});

  async function init(){
    try{await openDB();await loadState();}catch(e){console.warn('IndexedDB unavailable',e);}
    buildTopicButtons();renderHome();
    if('serviceWorker' in navigator){try{await navigator.serviceWorker.register('./service-worker.js');}catch(e){console.warn('Service worker registration failed',e);}}
  }
  init();
})();
