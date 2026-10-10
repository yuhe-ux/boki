(() => {
  'use strict';

  const QUESTIONS = [
    {id:'C01',subject:'商業簿記・会計学',topic:'連結会計',type:'mcq',q:'親会社から子会社への商品売買で、期末在庫に未実現利益が含まれている。連結上の基本処理は？',choices:['売上高だけ消去する','棚卸資産を減額し、売上原価を調整する','利益剰余金だけ減額する','処理しない'],answer:1,ex:'企業集団内部で実現していない利益は連結上消去します。期末棚卸資産から未実現利益を控除し、売上原価を調整します。'},
    {id:'C02',subject:'商業簿記・会計学',topic:'連結会計',type:'mcq',q:'親会社の子会社株式と相殺消去する中心的な項目は？',choices:['子会社の売上高','子会社の資本金等のうち親会社持分','子会社の現金','親会社の借入金'],answer:1,ex:'資本連結では、親会社の子会社株式と子会社の純資産のうち親会社持分を相殺します。'},
    {id:'C03',subject:'商業簿記・会計学',topic:'連結会計',type:'number',q:'子会社への売上高が1,200万円、売上原価率が80%。期末にその商品の25%が子会社に残っている。未実現利益はいくら？',answer:600000,tolerance:0,note:'円単位で入力',ex:'内部利益率は20%。期末在庫の内部売価は1,200万円×25%=300万円。未実現利益=300万円×20%=60万円。'},
    {id:'C04',subject:'商業簿記・会計学',topic:'持分法',type:'mcq',q:'持分法適用会社から配当金を受け取った場合、原則として投資勘定は？',choices:['増加する','減少する','変動しない','全額を売上高にする'],answer:1,ex:'持分法では投資先の利益をすでに投資勘定へ反映しているため、配当は投資の回収として投資勘定を減額します。'},
    {id:'C05',subject:'商業簿記・会計学',topic:'企業結合',type:'mcq',q:'取得による企業結合の取得関連費用は、原則どう処理する？',choices:['のれんに含める','発生時の費用とする','資本剰余金とする','5年で償却する'],answer:1,ex:'取得関連費用は取得原価に含めず、原則として発生した事業年度の費用とします。'},
    {id:'C06',subject:'商業簿記・会計学',topic:'企業結合',type:'number',q:'取得原価5,000万円、取得時の識別可能純資産の時価4,200万円（全て取得）である。のれんはいくら？',answer:8000000,tolerance:0,note:'円単位で入力',ex:'のれん=取得原価5,000万円−識別可能純資産4,200万円=800万円。'},
    {id:'C07',subject:'商業簿記・会計学',topic:'税効果会計',type:'mcq',q:'繰延税金資産の計上で特に重要な判断は？',choices:['現金化できること','将来の税負担軽減効果の回収可能性','売上高が増えていること','借入金がないこと'],answer:1,ex:'将来減算一時差異等に対する税負担軽減効果について、回収可能性がある範囲で繰延税金資産を計上します。'},
    {id:'C08',subject:'商業簿記・会計学',topic:'税効果会計',type:'number',q:'将来減算一時差異が300万円、法定実効税率30%。回収可能性に問題がない場合の繰延税金資産はいくら？',answer:900000,tolerance:0,note:'円単位で入力',ex:'300万円×30%=90万円です。'},
    {id:'C09',subject:'商業簿記・会計学',topic:'金融商品',type:'mcq',q:'自己株式は貸借対照表上、原則どこに表示する？',choices:['流動資産','固定資産','純資産の部の控除項目','流動負債'],answer:2,ex:'自己株式は資産ではなく、純資産の部の株主資本から控除する形式で表示します。'},
    {id:'C10',subject:'商業簿記・会計学',topic:'金融商品',type:'mcq',q:'その他有価証券の評価差額は、原則どこに表示する？',choices:['営業利益','特別利益','純資産の部','流動負債'],answer:2,ex:'その他有価証券評価差額金として、税効果調整後の額を純資産の部へ計上するのが基本です。'},
    {id:'C11',subject:'商業簿記・会計学',topic:'収益認識',type:'mcq',q:'変動対価を取引価格に含める際の基本的な制約は？',choices:['常に最大額を計上','後に著しい減額が生じない可能性が高い範囲に限定','全額を負債計上','変動対価は無視'],answer:1,ex:'変動対価は、後に収益の著しい減額が生じない可能性が高い部分に限って取引価格へ含めます。'},
    {id:'C12',subject:'商業簿記・会計学',topic:'収益認識',type:'mcq',q:'履行義務を一定の期間にわたり充足する場合、収益は原則どう認識する？',choices:['契約締結時に全額','進捗度に応じて','入金時だけ','最終引渡時だけ'],answer:1,ex:'一定期間にわたり履行義務を充足する場合は、その進捗度に応じて収益を認識します。'},
    {id:'C13',subject:'商業簿記・会計学',topic:'固定資産',type:'number',q:'取得原価1,000万円、残存価額0、耐用年数5年。定額法による年間減価償却費はいくら？',answer:2000000,tolerance:0,note:'円単位で入力',ex:'1,000万円÷5年=200万円。'},
    {id:'C14',subject:'商業簿記・会計学',topic:'固定資産',type:'mcq',q:'減損損失の認識判定で帳簿価額と比較するものは？',choices:['売上高','割引前将来キャッシュ・フロー総額','時価だけ','税引後利益'],answer:1,ex:'減損の兆候がある資産について、帳簿価額と割引前将来キャッシュ・フロー総額を比較して認識判定を行います。'},
    {id:'C15',subject:'商業簿記・会計学',topic:'純資産',type:'journal',q:'自己株式100万円を現金で取得した。正しい仕訳は？',choices:['（借）自己株式 100万円／（貸）現金 100万円','（借）現金 100万円／（貸）自己株式 100万円','（借）有価証券 100万円／（貸）現金 100万円','（借）資本金 100万円／（貸）現金 100万円'],answer:0,ex:'自己株式取得時は自己株式（純資産の控除項目）を借方計上し、支払った現金を貸方計上します。'},
    {id:'C16',subject:'商業簿記・会計学',topic:'外貨換算',type:'mcq',q:'決算時の外貨建金銭債権債務は、原則どの為替相場で換算する？',choices:['取得時相場','決算時相場','平均相場のみ','任意の相場'],answer:1,ex:'外貨建金銭債権債務は原則として決算時の為替相場で換算します。'},
    {id:'C17',subject:'商業簿記・会計学',topic:'退職給付',type:'mcq',q:'退職給付債務の計算で将来の退職給付見込額を現在価値へ割り引く際に使うものは？',choices:['税率','割引率','配当率','売上総利益率'],answer:1,ex:'将来の退職給付見込額を割引率で現在価値へ割り引き、退職給付債務を測定します。'},
    {id:'C18',subject:'商業簿記・会計学',topic:'リース',type:'journal',q:'ファイナンス・リース取引でリース資産を計上する際の基本形として適切なのは？',choices:['（借）リース資産／（貸）リース債務','（借）賃借料／（貸）リース資産','（借）現金／（貸）リース債務','仕訳なし'],answer:0,ex:'ファイナンス・リースでは、原則として売買取引に準じ、リース資産とリース債務を計上します。'},

    {id:'I01',subject:'工業簿記・原価計算',topic:'CVP分析',type:'number',q:'売上高1,000万円、変動費率60%。限界利益はいくら？',answer:4000000,tolerance:0,note:'円単位で入力',ex:'限界利益率=40%。1,000万円×40%=400万円。'},
    {id:'I02',subject:'工業簿記・原価計算',topic:'CVP分析',type:'number',q:'固定費300万円、限界利益率40%。損益分岐点売上高はいくら？',answer:7500000,tolerance:0,note:'円単位で入力',ex:'損益分岐点売上高=固定費÷限界利益率=300万円÷0.4=750万円。'},
    {id:'I03',subject:'工業簿記・原価計算',topic:'CVP分析',type:'number',q:'実際売上高1,000万円、損益分岐点売上高750万円。安全余裕率は何%？',answer:25,tolerance:0.01,note:'数値のみ入力（例：25）',ex:'安全余裕率=(1,000−750)÷1,000×100=25%。'},
    {id:'I04',subject:'工業簿記・原価計算',topic:'標準原価計算',type:'number',q:'標準価格500円、実際価格520円、実際数量100個。材料価格差異はいくらの不利差異？',answer:2000,tolerance:0,note:'金額のみ入力',ex:'(520−500)×100=2,000円の不利差異。'},
    {id:'I05',subject:'工業簿記・原価計算',topic:'標準原価計算',type:'mcq',q:'材料数量差異の計算で、実際数量と比較する数量は？',choices:['標準単価','実際操業度','実際生産量に許容される標準数量','予算売上高'],answer:2,ex:'材料数量差異は、実際生産量に対する標準消費数量と実際消費数量との差を標準価格で評価します。'},
    {id:'I06',subject:'工業簿記・原価計算',topic:'直接原価計算',type:'mcq',q:'直接原価計算で固定製造間接費はどう扱う？',choices:['製品原価に含める','期間原価として処理する','仕掛品だけに配賦する','棚卸資産に全額繰延べる'],answer:1,ex:'直接原価計算では変動製造原価のみを製品原価とし、固定製造間接費は期間原価とします。'},
    {id:'I07',subject:'工業簿記・原価計算',topic:'直接原価計算',type:'mcq',q:'全部原価計算と直接原価計算で利益差が生じる主因は？',choices:['材料単価の違い','固定製造間接費を棚卸資産へ繰り延べるかどうか','売価の違い','法人税率の違い'],answer:1,ex:'全部原価計算では固定製造間接費の一部が棚卸資産に含まれますが、直接原価計算では期間原価となるためです。'},
    {id:'I08',subject:'工業簿記・原価計算',topic:'ABC',type:'mcq',q:'ABCで活動原価を製品へ配賦するために使う基準は？',choices:['安全余裕率','コスト・ドライバー','限界利益率','標準操業度'],answer:1,ex:'活動コストの発生原因を表すコスト・ドライバーを用いて製品などへ配賦します。'},
    {id:'I09',subject:'工業簿記・原価計算',topic:'意思決定会計',type:'mcq',q:'すでに発生して回収不能で、今後の意思決定では変化しない原価は？',choices:['機会原価','差額原価','埋没原価','回避可能原価'],answer:2,ex:'過去に発生済みで意思決定によって変わらない原価は埋没原価で、原則として意思決定には無関連です。'},
    {id:'I10',subject:'工業簿記・原価計算',topic:'意思決定会計',type:'number',q:'製品を追加受注すると収益が80万円増え、追加変動費が50万円増える。固定費は変わらない。差額利益はいくら？',answer:300000,tolerance:0,note:'円単位で入力',ex:'差額収益80万円−差額原価50万円=30万円。'},
    {id:'I11',subject:'工業簿記・原価計算',topic:'設備投資',type:'mcq',q:'正味現在価値法で独立投資案を採択する基本条件は？',choices:['NPVが0以上','NPVが必ず100以上','回収期間が1年以内','会計利益率が0%'],answer:0,ex:'NPVが0以上なら、要求収益率を上回る価値を生むため採択対象となります。'},
    {id:'I12',subject:'工業簿記・原価計算',topic:'設備投資',type:'number',q:'1年後に110万円を受け取る。割引率10%のとき現在価値はいくら？',answer:1000000,tolerance:1,note:'円単位で入力',ex:'110万円÷1.10=100万円。'},
    {id:'I13',subject:'工業簿記・原価計算',topic:'事業部制',type:'number',q:'事業部利益500万円、投下資本2,000万円。ROIは何%？',answer:25,tolerance:0.01,note:'数値のみ入力（例：25）',ex:'ROI=500万円÷2,000万円×100=25%。'},
    {id:'I14',subject:'工業簿記・原価計算',topic:'事業部制',type:'number',q:'事業部利益500万円、投下資本2,000万円、要求利益率20%。残余利益はいくら？',answer:1000000,tolerance:0,note:'円単位で入力',ex:'500万円−2,000万円×20%=100万円。'},
    {id:'I15',subject:'工業簿記・原価計算',topic:'予算管理',type:'mcq',q:'固定予算と比べた弾力性予算の特徴として適切なのは？',choices:['実際操業度に応じて予算額を調整できる','予算を一切変更しない','固定費だけをゼロにする','標準原価を使わない'],answer:0,ex:'弾力性予算は実際操業度に対応した予算額へ修正でき、業績評価に有用です。'},
    {id:'I16',subject:'工業簿記・原価計算',topic:'総合原価計算',type:'number',q:'月初仕掛品0、当月投入1,000個、完成800個、月末200個。材料は始点投入、加工進捗50%。月末仕掛品の加工換算量は？',answer:100,tolerance:0,note:'個数を入力',ex:'200個×加工進捗50%=100個。'},
    {id:'I17',subject:'工業簿記・原価計算',topic:'個別原価計算',type:'mcq',q:'個別原価計算で製造間接費を各製造指図書に配賦する際、通常用いるものは？',choices:['予定配賦率','実際売価','法人税率','限界利益率'],answer:0,ex:'製造間接費は予定配賦率を用いて各製造指図書へ配賦するのが基本です。'},
    {id:'I18',subject:'工業簿記・原価計算',topic:'原価差異',type:'journal',q:'製造間接費差異が不利差異10万円で、売上原価へ賦課する場合の基本的な方向は？',choices:['（借）売上原価／（貸）製造間接費差異','（借）製造間接費差異／（貸）売上原価','（借）現金／（貸）売上原価','仕訳なし'],answer:0,ex:'不利差異を売上原価へ賦課する場合、売上原価を増加させる方向で処理します。'}
  ];

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
  async function loadState(){const saved=await dbGet('state');if(saved) state={...state,...saved};normalizeDaily();}
  async function saveState(){state.history=state.history.slice(0,200);await dbSet('state',state);}

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
    if(!s.attempts) score+=7;
    const wrongRate=s.attempts ? 1-(s.correct/s.attempts) : .5;
    score+=wrongRate*6;
    if(s.lastResult===false) score+=5;
    if(s.nextDue && s.nextDue<=today()) score+=4;
    score+=Math.max(0,3-s.correctStreak)*0.6;
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

  function buildTopicButtons(){
    const wrap=$('topicButtons'); wrap.innerHTML='';
    const topics=[...new Set(QUESTIONS.map(q=>q.topic))];
    topics.forEach(topic=>{
      const b=document.createElement('button');b.type='button';b.className='topic-btn';
      const subject=QUESTIONS.find(q=>q.topic===topic).subject;
      const n=QUESTIONS.filter(q=>q.topic===topic).length;
      b.innerHTML=`<b>${topic}</b><small>${subject.includes('商業')?'商会':'工原'} ・ ${n}問</small>`;
      b.addEventListener('click',()=>startQuiz(topic,QUESTIONS.filter(q=>q.topic===topic),Math.min(10,n),false));wrap.appendChild(b);
    });
  }

  function renderHome(){
    normalizeDaily();
    $('streakDays').textContent=state.streak.days||0;
    $('todayText').textContent=`${Math.min(state.daily.count,10)} / 10問`;
    $('todayBar').style.width=`${clamp(state.daily.count*10,0,100)}%`;
    $('wrongCount').textContent=`${wrongQuestions().length}問`;
    $('favoriteCount').textContent=`${state.favorites.length}問`;
    let attempts=0,correct=0;Object.values(state.qstats).forEach(s=>{attempts+=s.attempts;correct+=s.correct;});
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

  function typeLabel(type){return type==='number'?'計算':type==='journal'?'仕訳':'一問一答';}
  function renderQuestion(){
    const q=session.queue[session.index]; if(!q){finishQuiz();return;}
    session.answeredCurrent=false;
    $('counter').textContent=`${session.index+1} / ${session.queue.length}`;
    $('subjectBadge').textContent=q.subject.includes('商業')?'商会':'工原';
    $('topicBadge').textContent=q.topic;
    $('typeBadge').textContent=typeLabel(q.type);
    $('questionText').textContent=q.q;
    $('questionNote').textContent=q.note||'';$('questionNote').classList.toggle('hidden',!q.note);
    $('starBtn').textContent=state.favorites.includes(q.id)?'★':'☆';
    $('feedback').classList.add('hidden');$('feedback').innerHTML='';$('nextBtn').classList.add('hidden');
    const area=$('answerArea');area.innerHTML='';
    if(q.type==='number'){
      const form=document.createElement('form');form.className='number-form';
      const input=document.createElement('input');input.inputMode='decimal';input.autocomplete='off';input.placeholder='答えを入力';input.setAttribute('aria-label','計算結果');
      const submit=document.createElement('button');submit.type='submit';submit.className='primary';submit.textContent='判定';
      form.append(input,submit);form.addEventListener('submit',e=>{e.preventDefault();const raw=input.value.trim().replace(/[，,円％%\s]/g,'');const val=Number(raw);if(!Number.isFinite(val)){input.focus();return;}answerNumber(val,input,submit);});area.appendChild(form);setTimeout(()=>input.focus(),50);
    }else{
      q.choices.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='choice';b.textContent=`${String.fromCharCode(65+i)}. ${c}`;b.addEventListener('click',()=>answerChoice(i,b));area.appendChild(b);});
    }
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
    const q=session.queue[session.index]; const correct=i===q.answer;
    document.querySelectorAll('#answerArea .choice').forEach((b,idx)=>{b.disabled=true;if(idx===q.answer)b.classList.add('correct');});if(!correct)button.classList.add('wrong');
    await recordAnswer(q,correct,q.choices[i]);showFeedback(q,correct);
  }
  async function answerNumber(val,input,submit){
    const q=session.queue[session.index]; const correct=Math.abs(val-q.answer)<= (q.tolerance||0);input.disabled=true;submit.disabled=true;input.style.borderColor=correct?'#176b46':'#9b2c2c';
    await recordAnswer(q,correct,val);showFeedback(q,correct,`正解：${q.answer.toLocaleString('ja-JP')}`);
  }
  function showFeedback(q,correct,extra=''){
    const f=$('feedback');f.classList.remove('hidden');f.innerHTML=`<strong class="${correct?'good':'bad'}">${correct?'○ 正解！':'× 不正解'}</strong>${extra?`<div>${extra}</div>`:''}<div>${q.ex}</div><div class="muted" style="margin-top:6px;font-size:12px">次回復習目安：${qstat(q.id).nextDue}</div>`;$('nextBtn').classList.remove('hidden');
  }

  function finishQuiz(){
    const rate=session.answered?Math.round(session.correct/session.answered*100):0;
    $('resultScore').textContent=`${session.correct} / ${session.answered}問正解（${rate}%）`;
    $('resultMessage').textContent=rate>=80?'良いペースです。苦手問題は自動で次回の出題優先度が上がります。':rate>=60?'間違えた問題を翌日優先的に復習できるよう設定しました。':'苦手論点を優先出題に反映しました。短時間でも繰り返すのがおすすめです。';
    const sessionTopics=[...new Set(session.queue.map(q=>q.topic))].map(t=>({t,...topicAccuracy(t)})).filter(x=>x.attempts).sort((a,b)=>(a.rate??101)-(b.rate??101)).slice(0,3);
    $('resultWeakTopics').innerHTML=sessionTopics.length?`<b>復習候補</b><br>${sessionTopics.map(x=>`${x.t}：${x.rate}%`).join('<br>')}`:'';showView('resultView');
  }

  function renderStats(){
    let a=0,c=0;Object.values(state.qstats).forEach(s=>{a+=s.attempts;c+=s.correct;});$('sAnswered').textContent=a;$('sRate').textContent=a?`${Math.round(c/a*100)}%`:'--';$('sStreak').textContent=`${state.streak.days||0}日`;
    const topics=[...new Set(QUESTIONS.map(q=>q.topic))];const wrap=$('topicStats');wrap.innerHTML='';topics.map(t=>({t,...topicAccuracy(t)})).sort((x,y)=>{if(x.rate===null)return 1;if(y.rate===null)return-1;return x.rate-y.rate;}).forEach(x=>{const d=document.createElement('div');d.className='topic-stat';d.innerHTML=`<div class="topic-stat-head"><span>${x.t}</span><b>${x.rate===null?'未学習':x.rate+'%'}</b></div><div class="mini-bar"><div style="width:${x.rate||0}%"></div></div>`;wrap.appendChild(d);});
    const h=$('recentHistory');h.innerHTML=state.history.length?'': '<p class="muted">まだ学習履歴がありません。</p>';state.history.slice(0,12).forEach(x=>{const d=document.createElement('div');d.className='history-item';d.innerHTML=`${x.correct?'○':'×'} <b>${x.topic}</b> <span class="muted">${fmtDateTime(x.at)}</span>`;h.appendChild(d);});
  }

  $('dailyBtn').addEventListener('click',()=>startQuiz('今日の10問',QUESTIONS,10,true));
  $('commuteBtn').addEventListener('click',()=>startQuiz('通勤5分',QUESTIONS,5,true));
  $('wrongBtn').addEventListener('click',()=>startQuiz('間違い復習',wrongQuestions(),10,true));
  $('favoriteBtn').addEventListener('click',()=>startQuiz('お気に入り',QUESTIONS.filter(q=>state.favorites.includes(q.id)),10,false));
  $('weakBtn').addEventListener('click',()=>startQuiz('苦手優先',QUESTIONS,10,true));
  $('allTopicsBtn').addEventListener('click',()=>startQuiz('全論点ランダム',QUESTIONS,10,false));
  $('statsBtn').addEventListener('click',()=>showView('statsView'));
  $('statsBackBtn').addEventListener('click',()=>showView('homeView'));
  $('backBtn').addEventListener('click',()=>showView('homeView'));
  $('resultHomeBtn').addEventListener('click',()=>showView('homeView'));
  $('nextBtn').addEventListener('click',()=>{session.index++;if(session.index>=session.queue.length)finishQuiz();else renderQuestion();});
  $('starBtn').addEventListener('click',async()=>{const q=session.queue[session.index];const i=state.favorites.indexOf(q.id);if(i>=0)state.favorites.splice(i,1);else state.favorites.push(q.id);$('starBtn').textContent=state.favorites.includes(q.id)?'★':'☆';await saveState();renderHome();});

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
