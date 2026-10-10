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
  let state={favorites:[],qstats:{},history:[],daily:{date:today(),count:0},streak:{days:0,lastStudyDate:null},settings:{examDate:'2026-11-15',allowedBooks:BOOK_OPTIONS.map(x=>x[0]),calcMemory:0,calcHistory:[]}};
  let session={queue:[],index:0,correct:0,answered:0,mode:'',answeredCurrent:false,hintsUsed:0};

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
    normalizeSettings();
    // 旧出典未検証36問の記録は出題・集計に含めない（過去データのバックアップには旧項目が残る場合あり）。
    for(const id of Object.keys(state.qstats)){if(/^[CI]\d{2}$/.test(id))delete state.qstats[id];}
    state.favorites=state.favorites.filter(id=>LIVE_IDS.has(id));
    state.history=state.history.filter(entry=>LIVE_IDS.has(entry.id));
    normalizeDaily();
    if(saved)await saveState();
  }
  async function saveState(){state.history=state.history.slice(0,200);if(db) await dbSet('state',state);}
  function normalizeSettings(){
    if(!state.settings||typeof state.settings!=='object')state.settings={};
    const s=state.settings;
    if(typeof s.examDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s.examDate))s.examDate='2026-11-15';
    if(!Array.isArray(s.allowedBooks))s.allowedBooks=BOOK_OPTIONS.map(b=>b[0]);
    s.allowedBooks=[...new Set(s.allowedBooks.filter(id=>BOOK_OPTIONS.some(b=>b[0]===id)))];
    if(!Number.isFinite(s.calcMemory))s.calcMemory=0;
    if(!Array.isArray(s.calcHistory))s.calcHistory=[];
    s.calcHistory=s.calcHistory.filter(x=>x&&typeof x.expr==='string'&&Number.isFinite(x.value)).slice(0,20);
  }
  function allowed(q){return state.settings.allowedBooks.includes(bookId(q));}
  function allowedChallenges(){return ACTIVE_QUESTIONS.filter(allowed);}
  function examDaysRemaining(){
    const exam=state.settings.examDate.split('-').map(Number);
    const curr=today().split('-').map(Number);
    return Math.round((Date.UTC(exam[0],exam[1]-1,exam[2])-Date.UTC(curr[0],curr[1]-1,curr[2]))/86400000);
  }
  function examLabel(dateStr){
    const [y,m,d]=dateStr.split('-').map(Number);
    const day=new Date(Date.UTC(y,m-1,d)).toLocaleDateString('ja-JP',{weekday:'short',timeZone:'UTC'});
    return `${y}年${m}月${d}日（${day}）`;
  }


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
    if(s.needsReview||s.lastConfidence==='uncertain')score+=6;
    if(s.lastHintsUsed>0)score+=2;
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
  function wrongQuestions(){return QUESTIONS.filter(q=>{const s=qstat(q.id);return s.attempts>0 && (s.lastResult===false || s.needsReview || (s.correct/s.attempts)<0.7);});}

  function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));if(id==='homeView')renderHome();if(id==='statsView')renderStats();window.scrollTo({top:0,behavior:'smooth'});}

  function filteredQuestions(){
    const b=$('bookSelect').value,topic=$('topicSelect').value,type=$('typeSelect').value,level=$('difficultySelect').value;
    return CPA_QUESTIONS.filter(q=>allowed(q)&&(b==='all'||bookId(q)===b) && (topic==='all'||q.topic===topic) && (type==='all'||q.type===type) && (level==='all'||(level==='challenge' ? q.difficulty!=='基礎' : q.difficulty===level)));
  }
  function refreshSelectTopics(){
    const b=$('bookSelect').value, selected=$('topicSelect').value;
    const level=$('difficultySelect').value;
    const filtered=CPA_QUESTIONS.filter(q=>allowed(q)&&(b==='all'||bookId(q)===b) && (level==='all'||(level==='challenge'?q.difficulty!=='基礎':q.difficulty===level)));
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
    renderExamCoach();
    renderMistakeSummary();
    if(document.activeElement!==$('examDateInput'))$('examDateInput').value=state.settings.examDate;
  }


  function renderExamCoach(){
    const left=examDaysRemaining();
    $('examDateLabel').textContent=examLabel(state.settings.examDate);
    $('examDays').textContent=left>0?`あと ${left} 日`:left===0?'本日が試験日です':`試験日から ${Math.abs(left)} 日経過`;
    const all=QUESTIONS.filter(allowed);
    const eligible=allowedChallenges();
    const worked=[...new Set((eligible.length?eligible:all).map(q=>q.topic))].map(t=>({topic:t,...topicAccuracy(t)}));
    const weak=worked.filter(x=>x.attempts>0&&x.rate!==null&&x.rate<80).sort((a,b)=>a.rate-b.rate||b.attempts-a.attempts);
    const unstudied=worked.filter(x=>x.attempts===0);
    let advice,detail,mode,pool;
    if(!all.length){
      advice='学習範囲が未選択です。下の「学習済みの教材を設定」で教材を選んでください。';
      detail='出題できる教材がありません。';mode='';pool=[];
    }else if(left<0){
      advice='試験が終了しています。次回の受験予定日を設定してください。';
      detail='引き続き、苦手論点の復習や次の試験に向けた学習ができます。';mode='苦手優先';pool=allowedChallenges();
    }else if(weak.length && (left<=30||wrongQuestions().length>=3)){
      const t=weak[0];
      advice=`「${t.topic}」の復習を最優先にしましょう。`;
      detail=`この論点の正答率は${t.rate}%（${t.attempts}回回答）。${left<=7?'新しい論点より間違えた理由の確認を優先。':'応用問題で弱点を確認するのがおすすめです。'}`;
      mode=`学習ナビ：${t.topic}`;pool=all.filter(q=>q.topic===t.topic&&q.difficulty!=='基礎');
      if(!pool.length)pool=all.filter(q=>q.topic===t.topic);
    }else if(left<=7){
      advice='直前期です。重要度Aの応用問題とミスの再確認に集中しましょう。';
      detail='時間を計りながら問題を解き、計算の手順と正答根拠を確認しましょう。';
      mode='直前期の総復習';pool=allowedChallenges().filter(q=>q.importance==='A');
      if(!pool.length)pool=allowedChallenges();
    }else if(unstudied.length){
      advice=`未着手の「${unstudied[0].topic}」にも取り組みましょう。`;
      detail='演習を進めると正答率に応じた学習アドバイスに切り替わります。';
      mode='未着手論点の練習';pool=eligible.filter(q=>q.topic===unstudied[0].topic);
      if(!pool.length)pool=all.filter(q=>q.topic===unstudied[0].topic);
    }else{
      advice='今のペースで標準・応用問題を継続しましょう。';
      detail='迷って正解した問題は「理解度チェック」で記録しておくと復習しやすくなります。';
      mode='今日のおすすめ演習';pool=allowedChallenges();
    }
    window.__bokiCoachPool=pool;window.__bokiCoachMode=mode;
    $('coachAdvice').textContent=advice;
    $('coachDetail').textContent=detail;
    $('coachStartBtn').disabled=!pool.length;
  }
  function renderScopeChecklist(){
    const wrap=$('scopeChecklist');wrap.replaceChildren();
    for(const [id,title] of BOOK_OPTIONS){
      const label=document.createElement('label');label.className='scope-item';
      const cb=document.createElement('input');cb.type='checkbox';cb.checked=state.settings.allowedBooks.includes(id);cb.setAttribute('aria-label',title);
      const titleNode=document.createElement('span');titleNode.textContent=title;
      label.append(cb,titleNode);
      cb.addEventListener('change',async()=>{
        if(cb.checked){if(!state.settings.allowedBooks.includes(id))state.settings.allowedBooks.push(id);}
        else state.settings.allowedBooks=state.settings.allowedBooks.filter(b=>b!==id);
        await saveState();
        $('scopeMessage').textContent=`出題対象：${state.settings.allowedBooks.length} / ${BOOK_OPTIONS.length}教材`;
        refreshSelectTopics();renderHome();
      });
      wrap.appendChild(label);
    }
    $('scopeMessage').textContent=`出題対象：${state.settings.allowedBooks.length} / ${BOOK_OPTIONS.length}教材`;
  }
  function renderMistakeSummary(){
    const counts={'知識不足':0,'計算ミス':0,'問題文の読み違い':0,'その他':0};
    Object.entries(state.qstats).forEach(([id,s])=>{
      if(!LIVE_IDS.has(id)||!s.mistakeCauses)return;
      for(const key of Object.keys(counts))counts[key]+=Number(s.mistakeCauses[key]||0);
    });
    const el=$('mistakeSummary');el.replaceChildren();
    let sum=0;
    for(const [key,count] of Object.entries(counts)){
      sum+=count;const line=document.createElement('div');const k=document.createElement('span');k.textContent=key;const value=document.createElement('strong');value.textContent=count+'回';line.append(k,value);el.appendChild(line);
    }
    if(sum===0){const line=document.createElement('p');line.textContent='問題を間違えたときに原因を記録すると、ここに集計されます。';el.appendChild(line);}
  }

  function startQuiz(mode,pool,count,adaptive=true){
    if(!pool.length){alert('対象の問題がまだありません。');return;}
    session={queue:adaptive?pickAdaptive(pool,count):[...pool].sort(()=>Math.random()-.5).slice(0,count),index:0,correct:0,answered:0,mode,answeredCurrent:false,hintsUsed:0,reflection:''};
    $('modeLabel').textContent=mode;showView('quizView');renderQuestion();
  }

  function typeLabel(type){return type==='number'?'計算・4択':type==='journal'?'仕訳':'一問一答';}
  function renderQuestion(){
    const q=session.queue[session.index]; if(!q){finishQuiz();return;}
    session.answeredCurrent=false;
    session.hintsUsed=0;session.reflection='';
    $('hintBtn').disabled=false;$('hintBtn').textContent='💡 ヒントを見る（1/2）';
    $('hintText').classList.add('hidden');$('hintText').textContent='';
    $('reflectionPanel').classList.add('hidden');$('reflectionResult').textContent='';
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
    const s=qstat(q.id);s.attempts++;if(correct){s.correct++;s.correctStreak++;s.lastResult=true;s.needsReview=false;}else{s.correctStreak=0;s.lastResult=false;s.needsReview=true;}s.lastAnswered=new Date().toISOString();s.lastHintsUsed=session.hintsUsed||0;
    const intervals=[1,3,7,14,30];s.nextDue=addDays(today(),correct?intervals[Math.min(s.correctStreak-1,intervals.length-1)]:1);state.qstats[q.id]=s;
    markStudyDay();state.daily.count++;
    session.answered++;if(correct)session.correct++;
    const answeredAt=new Date().toISOString();session.lastAnswerAt=answeredAt;
    state.history.unshift({id:q.id,topic:q.topic,subject:q.subject,correct,at:answeredAt,userAnswer});
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
    $('hintBtn').disabled=true;
    showFeedback(q,correct,q.type==='number'?`正解：${formatNumeric(q,q.answer)}`:'');
    showReflection(q,correct);
  }
  function showFeedback(q,correct,extra=''){
    const f=$('feedback');f.classList.remove('hidden');f.innerHTML=`<strong class="${correct?'good':'bad'}">${correct?'○ 正解！':'× 不正解'}</strong>${extra?`<div>${extra}</div>`:''}<div>${q.ex}</div><div class="muted" style="margin-top:6px;font-size:12px">次回復習目安：${qstat(q.id).nextDue}</div>`;$('nextBtn').classList.remove('hidden');
    $('sourceRef').textContent=q.source ? `教材の参照先：${q.source} ／ 第${q.chapter || '-'}章 ／ ${q.pdfPage ? 'PDF '+q.pdfPage+'ページ' : (q.page ? '本文 p.'+q.page : '章・論点を参照（ページ番号未指定）')}。教材の論点を参考に独自作問。` : '参照教材を確認してください。';
  }


  const HINTS=[
    [/連結|未実現|のれん|非支配/,['親会社と子会社を一つの企業集団として考え、内部取引・持分割合を整理します。','連結修正の前後で利益・資産の増減をそれぞれ算定してから、非支配株主持分への帰属を判断します。']],
    [/標準原価|配合|歩留|価格差異|数量差異/,['実際単価・標準単価・標準消費量・実際消費量を分けて整理します。','価格差異と数量差異、必要なら数量差異を配合差異と歩留差異に分解します。']],
    [/CVP|損益分岐|限界利益|安全余裕/,['売上高・変動費・固定費から限界利益を求め、目標利益との関係を整理します。','限界利益＝売上高－変動費。損益分岐点売上高＝固定費÷限界利益率です。']],
    [/減価償却|固定資産|売却|償却/,['取得原価、過年度償却累計額、変更後の見積りを時系列に分けます。','売却損益は売却価額－売却時帳簿価額。償却変更があれば、変更後の残額と残存期間から再計算します。']],
    [/差額|意思決定|追加加工|特別注文|自製|購入/,['意思決定によって変化する収益と原価だけに着目します。','差額利益＝差額収益－差額原価。回避可能費用・機会原価・余剰生産能力の影響を見落とさないようにします。']],
    [/税効果|繰延税/,['会計上と税務上の差異の「期首」「期末」を分けて整理します。','一時差異×適用税率で期末残高を求め、期首残高との差額から当期の調整額を判断します。']],
    [/予算|操業度|能率/,['予算・標準・実際の各数値を混同しないよう表を作ります。','数量・単価・操業度など、差異ごとに比較する基準値が変わる点に注目します。']],
    [/総合原価|仕掛品|完成品換算/,['期首・当月投入・完成・期末の数量関係を先に確認します。','材料費と加工費で進捗度の適用が異なるかを確認してから、完成品換算量を求めます。']]
  ];
  function hintFor(q,level){
    const found=HINTS.find(x=>x[0].test(q.topic+' '+q.q));
    if(found)return found[1][level-1];
    return level===1?'求められている最終金額を確認し、必要な情報と不要な情報に分けて整理しましょう。':'途中計算で「期首・期末」「数量・単価」「変動・固定」の取り違えがないか確かめてください。';
  }
  $('hintBtn').addEventListener('click',()=>{
    if(session.answeredCurrent||session.hintsUsed>=2)return;
    const q=session.queue[session.index];if(!q)return;
    session.hintsUsed++;
    $('hintText').textContent=`ヒント${session.hintsUsed}：${hintFor(q,session.hintsUsed)}`;
    $('hintText').classList.remove('hidden');
    $('hintBtn').textContent=session.hintsUsed===1?'💡 次のヒントを見る（2/2）':'ヒントはすべて表示しました';
    $('hintBtn').disabled=session.hintsUsed>=2;
  });
  function showReflection(q,correct){
    const panel=$('reflectionPanel');panel.classList.remove('hidden');
    $('reflectionTitle').textContent=correct?'✅ 正解の理解度を記録':'🔎 間違えた原因を記録';
    $('reflectionDescription').textContent=correct?'正解でも迷った場合は、翌日の復習候補に追加されます。':'間違いの原因を選ぶとホーム画面に集計されます。';
    const choices=correct?['理解して正解','迷って正解']:['知識不足','計算ミス','問題文の読み違い','その他'];
    const buttons=$('reflectionActions');buttons.replaceChildren();
    choices.forEach((v,i)=>{
      const b=document.createElement('button');b.type='button';b.textContent=v;
      b.addEventListener('click',async()=>{
        const s=qstat(q.id);const previous=session.reflection;
        if(previous===v)return;
        if(correct){
          const uncertain=v==='迷って正解';s.lastConfidence=uncertain?'uncertain':'sure';s.needsReview=uncertain;
          if(uncertain){s.nextDue=addDays(today(),1);s.uncertainCount=(s.uncertainCount||0)+(previous==='迷って正解'?0:1);}
          else if(previous==='迷って正解'&&s.uncertainCount>0)s.uncertainCount--;
          if(!uncertain){const intervals=[1,3,7,14,30];s.nextDue=addDays(today(),intervals[Math.min(s.correctStreak-1,4)]);}
        }else{
          s.mistakeCauses=s.mistakeCauses||{};
          if(previous&&s.mistakeCauses[previous]>0)s.mistakeCauses[previous]--;
          s.mistakeCauses[v]=(s.mistakeCauses[v]||0)+1;
          s.lastMistake=v;
        }
        session.reflection=v;state.qstats[q.id]=s;
        const entry=state.history.find(x=>x.id===q.id&&x.at===session.lastAnswerAt);
        if(entry)entry.reflection=v;
        await saveState();
        buttons.querySelectorAll('button').forEach(button=>button.classList.toggle('selected',button.textContent===v));
        $('reflectionResult').textContent=correct?(v==='迷って正解'?'翌日の復習に追加しました。':'理解して正解として記録しました。'):`「${v}」として記録しました。`;
        renderHome();
      });
      buttons.appendChild(b);
    });
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

  $('dailyBtn').addEventListener('click',()=>startQuiz('今日の10問／標準・応用',allowedChallenges(),10,true));
  $('commuteBtn').addEventListener('click',()=>startQuiz('通勤5分／標準・応用',allowedChallenges(),3,true));
  $('wrongBtn').addEventListener('click',()=>startQuiz('間違い復習',wrongQuestions(),10,true));
  $('favoriteBtn').addEventListener('click',()=>startQuiz('お気に入り',QUESTIONS.filter(q=>state.favorites.includes(q.id)),10,false));
  $('weakBtn').addEventListener('click',()=>startQuiz('苦手優先／標準・応用',allowedChallenges(),10,true));
  $('allTopicsBtn').addEventListener('click',()=>startQuiz('標準・応用／全教材',allowedChallenges(),10,false));
  
  $('coachStartBtn').addEventListener('click',()=>startQuiz(window.__bokiCoachMode||'今日のおすすめ',window.__bokiCoachPool||[],5,true));
  $('examDateInput').addEventListener('change',async()=>{
    const v=$('examDateInput').value;
    const valid=/^\d{4}-\d{2}-\d{2}$/.test(v)&&v>='2026-01-01'&&v<='2099-12-31';
    if(!valid){$('examDateMessage').textContent='有効な日付を選んでください。';return;}
    state.settings.examDate=v;await saveState();renderHome();
    $('examDateMessage').textContent='試験日を保存しました。';
  });
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
      const blob=new Blob([JSON.stringify({app:'boki1-commute',version:8,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});
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
      state={...state,...data.state};normalizeSettings();renderScopeChecklist();state.favorites=state.favorites.filter(id=>LIVE_IDS.has(id));state.history=state.history.filter(entry=>LIVE_IDS.has(entry.id));for(const id of Object.keys(state.qstats)){if(/^[CI]\d{2}$/.test(id))delete state.qstats[id];}normalizeDaily();await saveState();renderHome();
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
  function calcSavedMemory(){return Number(state.settings.calcMemory||0);}
  function renderCalcMemory(){
    $('calcMemoryStatus').textContent='M: '+Number(calcSavedMemory().toPrecision(11)).toLocaleString('ja-JP',{maximumFractionDigits:9});
  }
  function renderCalcHistory(){
    const area=$('calcHistoryList');area.replaceChildren();
    const entries=state.settings.calcHistory||[];
    if(!entries.length){const p=document.createElement('p');p.className='muted';p.textContent='まだ計算履歴はありません。';area.appendChild(p);return;}
    entries.slice(0,10).forEach(({expr,value})=>{
      const b=document.createElement('button');b.type='button';b.title='結果を電卓に入力';
      const expression=document.createElement('span');expression.textContent=formatCalcExpression(expr);
      const result=document.createElement('strong');result.textContent=formatCalcExpression(String(value));
      b.append(expression,result);b.addEventListener('click',()=>{calcExpression=String(value);calcJustEvaluated=true;calcDisplay();});area.appendChild(b);
    });
  }
  async function updateCalcMemory(key){
    if(key==='MC'){state.settings.calcMemory=0;await saveState();renderCalcMemory();return;}
    if(key==='MR'){
      const value=String(calcSavedMemory());
      calcExpression=/[+−×÷(]$/.test(calcExpression)?calcExpression+(Number(value)<0?'('+value+')':value):value;
      calcJustEvaluated=false;calcDisplay();return;
    }
    try{
      const value=parseCalculation(calcExpression);
      const next=calcSavedMemory()+(key==='M+'?value:-value);
      if(!Number.isFinite(next)||Math.abs(next)>1e13)throw Error('range');
      state.settings.calcMemory=Number(next.toPrecision(12));
      await saveState();renderCalcMemory();
    }catch{$('calcDisplay').textContent='先に式を計算してください';}
  }

  // 表示だけを3桁区切りにする。計算・1文字削除では元の式（カンマなし）を使う。
  // 小数入力中の 1200. や 1200.00 も見た目だけ 1,200. / 1,200.00 として保持。
  function formatCalcExpression(expr){
    return (expr||'0').replace(/\d+(?:\.\d*)?|\.\d+/g, token=>{
      const dot=token.indexOf('.');
      const integer=dot===-1?token:token.slice(0,dot);
      const fraction=dot===-1?'':token.slice(dot);
      return integer.replace(/\B(?=(\d{3})+(?!\d))/g,',')+fraction;
    });
  }
  function calcDisplay(){
    const display=$('calcDisplay');
    const formatted=formatCalcExpression(calcExpression);
    display.textContent=formatted;
    display.setAttribute('aria-label','電卓の式 '+formatted);
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
      try{
        const expressionBefore=calcExpression;
        const val=parseCalculation(calcExpression);
        calcExpression=String(val);calcJustEvaluated=true;calcDisplay();
        state.settings.calcHistory.unshift({expr:expressionBefore,value:val});
        state.settings.calcHistory=state.settings.calcHistory.slice(0,20);
        renderCalcHistory();saveState().catch(()=>{});
      }
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
  $('calculatorPanel').querySelectorAll('button[data-memory]').forEach(b=>b.addEventListener('click',()=>updateCalcMemory(b.dataset.memory)));
  $('calculatorPanel').querySelectorAll('button[data-key]').forEach(button=>{
    button.addEventListener('click',()=>calcInput(button.dataset.key));
  });

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installBtn').classList.remove('hidden');});
  $('installBtn').addEventListener('click',async()=>{if(!installPrompt){alert('ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選択してください。');return;}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installBtn').classList.add('hidden');});
  window.addEventListener('appinstalled',()=>{$('installBtn').classList.add('hidden');});

  async function init(){
    try{await openDB();await loadState();}catch(e){console.warn('IndexedDB unavailable',e);}
    normalizeSettings();buildTopicButtons();renderScopeChecklist();renderCalcMemory();renderCalcHistory();renderHome();
    if('serviceWorker' in navigator){try{await navigator.serviceWorker.register('./service-worker.js');}catch(e){console.warn('Service worker registration failed',e);}}
  }
  init();
})();
