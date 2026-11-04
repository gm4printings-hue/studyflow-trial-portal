"use strict";
(()=>{
const L=window.StudyLogic, KEY="studyflow-local-demo-v1", main=document.getElementById("main"),
modal=document.getElementById("modal"), modalBody=document.getElementById("modalBody");
let view="dashboard", deckFilter="all", quizFilter="all", cardIndex=0, flipped=false, quiz=[], quizAt=0, quizScore=0, quizAnswer=null;
let timerSeconds=25*60,timerRunning=false,timerInterval=null,toastTimeout=null;
const id=()=>window.crypto?.randomUUID?.()||("id_"+Date.now().toString(36)+Math.random().toString(36).slice(2));
const E=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const today=()=>L.localDate();
const fmt=s=>{try{return new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}catch{return s}};
const prettyDay=s=>{try{return new Date(s+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}catch{return s}};
function example(){
 let d=today();
 const subjects=[
 {id:"bio",name:"Biology",symbol:"🧬",color:"#eaf8f2",examDate:L.addDays(d,10),topics:"Cell structure\nPhotosynthesis\nHuman digestive system\nGenetics"},
 {id:"math",name:"Mathematics",symbol:"∑",color:"#ece9ff",examDate:L.addDays(d,17),topics:"Quadratic equations\nFunctions and graphs\nTrigonometry\nProbability"},
 {id:"hist",name:"World History",symbol:"🌍",color:"#fff2e5",examDate:L.addDays(d,24),topics:"Industrial Revolution\nWorld War I\nPost-war reconstruction"}
 ];
 const tasks=subjects.flatMap(s=>L.schedule(s,d).map(t=>({...t,id:id()})));
 if(tasks[0])tasks[0].done=true;
 const cards=[
 {id:id(),subjectId:"bio",front:"What is photosynthesis?",back:"The process by which plants use light energy to produce sugars from carbon dioxide and water.",source:"Demo"},
 {id:id(),subjectId:"bio",front:"What is the function of mitochondria?",back:"They produce much of the cell's usable energy through cellular respiration.",source:"Demo"},
 {id:id(),subjectId:"bio",front:"What is DNA?",back:"Deoxyribonucleic acid, a molecule that carries genetic information.",source:"Demo"},
 {id:id(),subjectId:"math",front:"What is a quadratic equation?",back:"An equation of the form ax² + bx + c = 0, where a is not zero.",source:"Demo"},
 {id:id(),subjectId:"math",front:"What does probability measure?",back:"How likely an event is to occur, usually expressed between 0 and 1.",source:"Demo"},
 {id:id(),subjectId:"hist",front:"What was the Industrial Revolution?",back:"A period of major technological and economic change marked by mechanized manufacturing.",source:"Demo"}
 ];
 return {version:1,subjects,tasks,cards,materials:[],plan:"Free",usedCredits:0,dailyGoal:90,focusMinutes:0,createdAt:d};
}
function validate(s){return s&&Array.isArray(s.subjects)&&Array.isArray(s.tasks)&&Array.isArray(s.cards)&&Array.isArray(s.materials)&&L.limits[s.plan]!==undefined;}
function fresh(){return {version:1,subjects:[],tasks:[],cards:[],materials:[],plan:"Free",usedCredits:0,dailyGoal:90,focusMinutes:0,createdAt:today()}}
function load(){try{let raw=window.StudyFlowStudentStore.get(KEY);if(raw){let s=JSON.parse(raw);if(validate(s))return s}}catch{}return fresh();}
let state=load();
function save(){try{window.StudyFlowStudentStore.set(KEY,JSON.stringify(state))}catch{notify("Storage full. Export a backup from Settings.","warning")}}
function notify(text){const t=document.getElementById("toast");t.textContent=text;t.classList.add("visible");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove("visible"),3200);}
function subject(id){return state.subjects.find(s=>s.id===id)}
function titleBar(title,description,action="",actionText=""){return '<div class="page-heading"><div><p class="eyebrow">SMART STUDY COMPANION</p><h1>'+E(title)+'</h1><p class="intro">'+E(description)+'</p></div>'+(action?'<button class="btn" data-action="'+action+'">＋ '+E(actionText)+'</button>':"")+'</div>'}
function footer(){return '<div class="footer-note">StudyFlow is a private, offline-first prototype. Study scheduling and note-to-card drafting use local rules, not a paid AI model. Prices and credits are demo previews only; no payments are enabled.</div>'}
function empty(icon,label,description,action,text){return '<div class="empty"><div class="empty-icon">'+icon+'</div><strong>'+E(label)+'</strong><p>'+E(description)+'</p>'+(action?'<button class="btn mini" data-action="'+action+'">'+E(text)+'</button>':"")+'</div>'}
function selectSubjects(selected="all"){return '<option value="all"'+(selected==="all"?" selected":"")+'>All subjects</option>'+state.subjects.map(s=>'<option value="'+E(s.id)+'"'+(s.id===selected?" selected":"")+'>'+E(s.name)+'</option>').join("")}
function taskHtml(t){
 const s=subject(t.subjectId);
 return '<div class="task-row '+(t.done?"done":"")+'"><input aria-label="Mark '+E(t.title)+' complete" class="task-check" type="checkbox" data-action="toggle-task" data-id="'+E(t.id)+'"'+(t.done?" checked":"")+'><div class="task-body"><b>'+E(t.title)+'</b><small>'+E(s?.name||"Uncategorized")+' · '+fmt(t.dueDate)+' · '+Number(t.minutes||25)+' min</small></div><span class="pill '+(t.kind==="Review"?"orange":t.kind==="Practice"?"green":"")+'">'+E(t.kind||"Study")+'</span><button class="text-btn" data-action="delete-task" data-id="'+E(t.id)+'" title="Delete task" aria-label="Delete task">×</button></div>';
}
function progress(){
 const total=state.tasks.length,complete=state.tasks.filter(t=>t.done).length;
 return {total,complete,percent:total?Math.round(complete/total*100):0};
}
function renderDashboard(){
 const p=progress(),remaining=state.tasks.filter(t=>!t.done).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
 const exams=[...state.subjects].sort((a,b)=>a.examDate.localeCompare(b.examDate));
 const dueToday=remaining.filter(t=>t.dueDate<=today()).length;
 const cards=state.cards.length;
 const greeting=new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening";
 const examBlock=exams.length?exams.slice(0,4).map(s=>{
  const days=L.daysBetween(today(),s.examDate);
  return '<div class="exam-item"><div class="exam-icon" style="background:'+E(s.color||"#efecff")+'">'+E(s.symbol||"📖")+'</div><div class="exam-info"><b>'+E(s.name)+'</b><small>'+E(fmt(s.examDate))+' · Exam</small></div><div class="exam-days"><b>'+Math.max(0,days)+'</b><small>'+ (days<0?"past":"days left")+'</small></div></div>';
 }).join(""):empty("◷","No upcoming exams","Add a subject to organize your semester.","add-subject","Add subject");
 return titleBar(greeting+"! 👋","Here's your study space. Keep building momentum.","add-subject","New subject")+
 '<div class="hero"><div style="z-index:1"><p class="eyebrow" style="color:#e9e5ff">YOUR LEARNING JOURNEY</p><h2>Make progress, one study session at a time.</h2><p>Turn big goals into bite-sized tasks. Your next chapter starts here.</p><button class="btn" data-view="planner">Open study planner →</button></div><div class="hero-art">📚</div></div>'+
 '<div class="metrics">'+
 '<div class="metric"><span class="metric-icon">▤</span><span class="metric-label">My subjects</span><div class="metric-value">'+state.subjects.length+'</div><div class="metric-sub">Courses this term</div></div>'+
 '<div class="metric"><span class="metric-icon">✓</span><span class="metric-label">Tasks completed</span><div class="metric-value">'+p.complete+'<span class="muted" style="font-size:16px">/'+p.total+'</span></div><div class="metric-sub">'+p.percent+'% progress</div></div>'+
 '<div class="metric"><span class="metric-icon">◷</span><span class="metric-label">Due today / overdue</span><div class="metric-value">'+dueToday+'</div><div class="metric-sub">Tasks to tackle</div></div>'+
 '<div class="metric"><span class="metric-icon">▣</span><span class="metric-label">Study flashcards</span><div class="metric-value">'+cards+'</div><div class="metric-sub">Ready for practice</div></div>'+
 '</div><div class="columns"><section class="panel"><div class="panel-header"><h2>✦ Your next tasks</h2><button class="text-btn" data-view="planner">View all →</button></div>'+
 (remaining.length?'<div class="task-list">'+remaining.slice(0,5).map(taskHtml).join("")+'</div>':empty("✓","All caught up","Add tasks or auto-plan a course.","add-task","Add task"))+
 '<div style="margin-top:19px"><div class="progress-bar"><div class="progress-fill" style="width:'+p.percent+'%"></div></div><div class="progress-note"><span>Overall completion</span><b>'+p.percent+'%</b></div></div></section>'+
 '<section class="panel"><div class="panel-header"><h2>◷ Upcoming exams</h2><button class="text-btn" data-view="subjects">View subjects →</button></div>'+examBlock+
 '</section></div><div class="subheading"><h2>Quick study tools</h2></div><div class="subject-grid">'+
 '<div class="subject-card"><div class="subject-top"><div class="subject-icon">▣</div><span class="pill">REVIEW</span></div><h3>Flashcards</h3><p>Flip through your own cards and reinforce what you learned.</p><div class="subject-foot"><small>'+cards+' available cards</small><button data-view="flashcards">Study →</button></div></div>'+
 '<div class="subject-card"><div class="subject-top"><div class="subject-icon">◎</div><span class="pill green">PRACTICE</span></div><h3>Quiz practice</h3><p>Answer questions generated from your saved cards.</p><div class="subject-foot"><small>Self-paced</small><button data-view="quiz">Start →</button></div></div>'+
 '<div class="subject-card"><div class="subject-top"><div class="subject-icon">⏱</div><span class="pill orange">FOCUS</span></div><h3>Focus timer</h3><p>One focused 25-minute session, then take a short break.</p><div class="subject-foot"><small>'+state.focusMinutes+' focused minutes</small><button data-view="planner">Focus →</button></div></div>'+
 '</div>'+footer();
}

function renderSubjects(){
 let blocks=state.subjects.map(s=>{
  const day=L.daysBetween(today(),s.examDate);
  const related=state.tasks.filter(t=>t.subjectId===s.id),done=related.filter(t=>t.done).length;
  return '<div class="subject-card"><div class="subject-top"><div class="subject-icon" style="background:'+E(s.color||"#eeeaff")+'">'+E(s.symbol||"📚")+'</div><span class="pill '+(day<=7?"orange":"")+'">'+(day<0?"Past exam":day+" DAYS TO EXAM")+'</span></div><h3>'+E(s.name)+'</h3><p>'+fmt(s.examDate)+' · '+L.topicsOf(s.topics).length+' topics · '+done+'/'+related.length+' tasks done</p><div class="progress-bar"><div class="progress-fill" style="width:'+(related.length?Math.round(done/related.length*100):0)+'%"></div></div><div class="subject-foot" style="margin-top:19px"><button data-action="plan-subject" data-id="'+E(s.id)+'">Build plan →</button><button data-action="edit-subject" data-id="'+E(s.id)+'" title="Edit subject">Edit</button><button data-action="delete-subject" data-id="'+E(s.id)+'" title="Delete subject">Delete</button></div></div>';
 }).join("");
 return titleBar("My subjects","Your courses, exam dates, and the topics you're working through.","add-subject","Add a subject")+
 '<div class="subject-grid">'+blocks+
 '<button class="subject-card" style="align-items:center;justify-content:center;border:2px dashed #dcd6f5;background:#fcfbff;color:var(--primary);text-align:center;gap:12px" data-action="add-subject"><span style="font-size:34px">＋</span><b>Add another subject</b><span class="helper">Keep your study space organized</span></button></div>'+
 '<div class="subheading"><h2>Turn notes into study material</h2></div>'+
 '<div class="panel"><div class="columns" style="align-items:center"><div><h3>Have a syllabus, PDF or notes?</h3><p class="muted" style="font-size:12px">Import text from a PDF or paste notes. We can draft basic flashcards locally from clear definitions. You review and edit the results.</p></div><div style="display:flex;justify-content:end"><button class="btn" data-action="import-notes">↥ Import study notes</button></div></div></div>'+footer();
}
function renderPlanner(){
 const pending=[...state.tasks].sort((a,b)=>a.dueDate.localeCompare(b.dueDate)), grouped={};
 for(const t of pending){(grouped[t.dueDate]??=[]).push(t);}
 let days=Object.keys(grouped).sort().slice(0,20),p=progress();
 let timeline=days.map(date=>{
  let dayDate=new Date(date+"T12:00:00");
  return '<div class="timeline-day"><div class="timeline-date"><strong>'+dayDate.getDate()+'</strong><span>'+dayDate.toLocaleDateString("en-US",{month:"short"})+'</span><span>'+dayDate.toLocaleDateString("en-US",{weekday:"short"})+'</span></div>'+
  '<div class="timeline-box"><h3>'+E(prettyDay(date))+(date===today()?" · Today":"")+'</h3>'+grouped[date].map(taskHtml).join("")+'</div></div>';
 }).join("");
 return titleBar("Your study planner","An achievable plan built around your exams and daily progress.","add-task","New task")+
 '<div class="split-actions" style="margin-bottom:21px"><button class="btn soft" data-action="plan-all">✦ Auto-build from subject topics</button><button class="btn ghost" data-action="import-notes">↥ Upload PDF or notes</button></div>'+
 '<div class="pace"><section class="panel"><div class="panel-header"><h2>Study overview</h2><span class="pill green">'+p.percent+'% done</span></div>'+
 '<div class="progress-bar"><div class="progress-fill" style="width:'+p.percent+'%"></div></div><div class="progress-note"><span>'+p.complete+' completed</span><span>'+Math.max(0,p.total-p.complete)+' remaining</span></div>'+
 '<div class="callout neutral" style="margin-top:22px">✦ The study plan is generated locally from your topic list and exam date. You can edit subjects and tasks at any time.</div></section>'+
 '<section class="panel timer-panel"><div class="panel-header"><h2>Focus timer</h2><span class="pill orange">25 MIN</span></div><div class="timer-display" id="timerText">'+timeDisplay()+'</div><div class="split-actions" style="justify-content:center"><button class="btn" data-action="timer-toggle">'+(timerRunning?"Pause":"Start focus")+'</button><button class="btn ghost" data-action="timer-reset">Reset</button></div><p>Timer runs only while this page is open. Completed sessions add 25 focused minutes.</p></section></div>'+
 '<div class="subheading"><h2>Your timeline</h2><span class="muted" style="font-size:12px">'+p.total+' tasks</span></div>'+
 (timeline||empty("▦","No study tasks yet","Add a subject and generate a plan to get started.","add-subject","Add subject"))+footer();
}
function currentDeck(){return state.cards.filter(c=>deckFilter==="all"||c.subjectId===deckFilter);}
function renderFlashcards(){
 let deck=currentDeck();if(cardIndex>=deck.length)cardIndex=0;
 const c=deck[cardIndex];
 return titleBar("Flashcards","Learn actively with short questions and quick recall.","add-card","Create card")+
 '<div class="panel" style="margin-bottom:20px"><div class="panel-header"><h2>Practice deck</h2><div class="field" style="min-width:170px"><select id="deckFilter" aria-label="Choose a subject">'+selectSubjects(deckFilter)+'</select></div></div>'+
 (c?'<button type="button" class="card-study" data-action="flip-card"><span class="card-side">'+(flipped?"ANSWER":"QUESTION")+'</span><p class="card-text">'+E(flipped?c.back:c.front)+'</p><span class="card-hint">Tap to flip ↻</span></button>'+
 '<div class="card-navigation"><button data-action="prev-card" aria-label="Previous card">←</button><span class="muted" style="font-size:12px">'+(cardIndex+1)+' / '+deck.length+'</span><button data-action="next-card" aria-label="Next card">→</button></div>':
 empty("▣","No flashcards yet","Add cards manually or draft them from uploaded notes.","add-card","Create a card"))+'</div>'+
 '<div class="subheading"><h2>Saved cards</h2><div class="split-actions"><button class="text-btn" data-action="import-notes">Draft from notes →</button><button class="text-btn" data-view="quiz">Practice quiz →</button></div></div>'+
 '<section class="panel">'+(deck.length?'<div class="flash-list">'+deck.slice(0,30).map(c=>'<div class="flash-list-row"><div><b>'+E(c.front)+'</b><small>'+E(subject(c.subjectId)?.name||"General")+' · '+E(c.source||"Manual")+'</small></div><button class="text-btn" data-action="delete-card" data-id="'+E(c.id)+'">Remove</button></div>').join("")+'</div>':empty("＋","Build your deck","Flashcards will appear here.","add-card","Add card"))+'</section>'+footer();
}
function renderQuiz(){
 const cardCount=state.cards.filter(c=>quizFilter==="all"||c.subjectId===quizFilter).length;
 const top=titleBar("Practice quiz","Test your recall with questions drawn from your flashcards.","add-card","New flashcard");
 const chooser='<div class="panel" style="margin-bottom:18px"><div class="panel-header"><h2>Quiz subject</h2><span class="pill">LOCAL PRACTICE</span></div><div class="split-actions" style="align-items:center"><div class="field" style="flex:1;min-width:175px"><select id="quizFilter" aria-label="Choose quiz subject">'+selectSubjects(quizFilter)+'</select></div><button class="btn" data-action="start-quiz"'+(cardCount===0?' disabled':'')+'>↻ Start / restart</button></div><p class="helper">Questions use your saved card answers. No paid AI calls or credits.</p></div>';
 if(!quiz.length){
  return top+chooser+(cardCount?'<section class="panel" style="text-align:center;padding:50px"><div style="font-size:45px">🎯</div><h2 style="margin:12px 0">Ready to test yourself?</h2><p class="muted">You have '+cardCount+' card'+(cardCount===1?"":"s")+' ready to practice.</p><button class="btn" data-action="start-quiz">Start practice →</button></section>':empty("◎","No questions yet","Add flashcards to start practicing.","add-card","Create a card"))+footer();
 }
 if(quizAt>=quiz.length){
  return top+chooser+'<section class="panel" style="text-align:center;padding:50px"><div style="font-size:51px">🏆</div><h2 style="font-size:26px;margin:10px 0">Quiz complete!</h2><div style="font-size:45px;font-weight:830;color:var(--primary)">'+quizScore+' / '+quiz.length+'</div><p class="muted">Every attempt helps you learn. Review your cards and try again.</p><button class="btn" data-action="start-quiz">Try again ↻</button></section>'+footer();
 }
 const q=quiz[quizAt], options=q.options.map((choice,i)=>{
  const chosen=quizAnswer===i;
  let klass=quizAnswer===null?"":choice===q.correct?" correct":chosen?" incorrect":"";
  return '<button class="answer'+klass+'" data-action="answer" data-index="'+i+'"'+(quizAnswer!==null?' disabled':'')+'>'+String.fromCharCode(65+i)+'. '+E(choice)+'</button>';
 }).join("");
 return top+chooser+'<section class="panel" style="max-width:760px;margin:auto;padding:29px"><div class="panel-header"><h2>Question '+(quizAt+1)+' of '+quiz.length+'</h2><span class="pill">'+quizScore+' correct</span></div><div class="quiz-progress">'+quiz.map((_,i)=>'<i class="'+(i<quizAt?"done":i===quizAt?"active":"")+'"></i>').join("")+'</div><h2 style="font-size:20px;margin-bottom:24px;line-height:1.45">'+E(q.front)+'</h2><div class="stacked" style="gap:1px">'+options+'</div>'+
 (quizAnswer!==null?'<div class="callout '+(q.options[quizAnswer]===q.correct?"success":"neutral")+'" style="margin-top:16px">'+(q.options[quizAnswer]===q.correct?"✓ Correct!":"Review the correct answer: "+E(q.correct))+'</div><div style="text-align:right;margin-top:19px"><button class="btn" data-action="next-question">'+(quizAt===quiz.length-1?"See results":"Next question →")+'</button></div>':"")+'</section>'+footer();
}
function renderSettings(){
 const left=L.creditsLeft(state.plan,state.usedCredits),total=L.limits[state.plan];
 const plans=[["Basic","$3.99","20-hour starting allocation · preview"],["Standard","$5.99","40-hour starting allocation · preview"],["Premium","$9.99","80-hour starting allocation · preview"]];
 return titleBar("Settings & plans","Customize your study habits and preview credit tiers.")+
 '<div class="panel" style="margin-bottom:20px"><div class="panel-header"><h2>Study preferences</h2></div><div class="form-grid"><div class="field"><label for="dailyGoal">Daily study target (minutes)</label><input type="number" id="dailyGoal" min="15" max="360" value="'+Number(state.dailyGoal||90)+'"></div><div class="field"><label>Today</label><div class="callout neutral">'+E(prettyDay(today()))+'</div></div></div><div class="split-actions" style="margin-top:16px"><button class="btn mini" data-action="save-goal">Save preferences</button></div></div>'+
 '<div class="subheading"><h2>Subscription preview</h2><span class="pill orange">DEMO ONLY — NO BILLING</span></div>'+
 '<div class="plan-cards">'+plans.map(([name,price,desc])=>'<div class="plan-card"><h3>'+name+'</h3><div class="price">'+price+'<small> / month</small></div><p>'+desc+'</p><span class="pill orange">NOT ACTIVE</span></div>').join("")+'</div>'+
 '<div class="callout neutral" style="margin:17px 0">These are proposed package prices and starting allocations, not live subscriptions. No account, checkout, or paid AI API is connected. The local demo credits shown below are NOT the proposed StudyFlow paid allowances.</div>'+
 '<section class="panel" style="margin:21px 0"><div class="panel-header"><h2>Demo drafting credits</h2><span class="pill">'+left+' / '+total+' remaining</span></div><div class="progress-bar"><div class="progress-fill" style="width:'+Math.round(left/total*100)+'%"></div></div><p class="helper">Each local note-to-flashcard draft uses 1 demo credit. Your schedule, flashcard study, and quizzes are always free in this prototype.</p><button class="btn ghost mini" data-action="reset-credits">Reset demo credits</button></section>'+
 '<section class="panel"><div class="panel-header"><h2>Your data & privacy</h2><span class="pill green">LOCAL BROWSER STORAGE</span></div><p class="muted" style="font-size:12px">Study data is stored in this browser on this computer. No account, cloud sync, real checkout, or external AI calls are involved. Export your work before clearing browser storage.</p><div class="split-actions"><button class="btn ghost mini" data-action="export-data">↓ Export backup</button><button class="btn ghost mini" data-action="import-data">↑ Import backup</button><button class="btn ghost mini" data-action="start-fresh">✧ Start fresh</button><button class="btn ghost mini" data-action="reset-demo">↻ Reset demo</button></div><input type="file" id="backupFile" accept=".json,application/json" hidden></section>'+footer();
}
function timeDisplay(){return String(Math.floor(timerSeconds/60)).padStart(2,"0")+":"+String(timerSeconds%60).padStart(2,"0")}
function updateTimer(){const el=document.getElementById("timerText");if(el)el.textContent=timeDisplay();document.dispatchEvent(new Event("studyflow:demo-updated"));}
function render(){
 const titles={dashboard:"Overview",subjects:"My subjects",planner:"Study planner",flashcards:"Flashcards",quiz:"Practice quiz",settings:"Settings & plans"};
 document.querySelectorAll("[data-view]").forEach(el=>{
  if(el.classList.contains("nav-link"))el.classList.toggle("selected",el.dataset.view===view);
 });
 document.getElementById("crumbTitle").textContent=titles[view];
 document.getElementById("topPlan").textContent="Local demo · "+L.creditsLeft(state.plan,state.usedCredits)+" draft credits";
 const views={dashboard:renderDashboard,subjects:renderSubjects,planner:renderPlanner,flashcards:renderFlashcards,quiz:renderQuiz,settings:renderSettings};
 main.innerHTML=views[view]();
 document.getElementById("sidebar").classList.remove("open");
 document.dispatchEvent(new Event("studyflow:demo-updated"));
}
function navigate(name){if(!["dashboard","subjects","planner","flashcards","quiz","settings"].includes(name))return;view=name;render();window.scrollTo({top:0,behavior:"instant"});}

function openForm(title,fields,onSubmit,submitText="Save"){
 modalBody.innerHTML='<div class="modal-head"><h2>'+E(title)+'</h2><button type="button" data-action="close-modal" aria-label="Close">×</button></div><form id="editForm"><div class="form-grid">'+fields+'</div><div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn">'+E(submitText)+'</button></div></form>';
 modal.showModal();
 const form=document.getElementById("editForm");
 form.addEventListener("submit",async ev=>{
  ev.preventDefault();
  const button=form.querySelector('button[type="submit"]');button.disabled=true;
  try{const okay=await onSubmit(form,new FormData(form));if(okay!==false){modal.close();save();render();}}
  catch(err){notify(String(err.message||err));}
  finally{button.disabled=false;}
 });
}
const choices=(selected)=>state.subjects.map(s=>'<option value="'+E(s.id)+'"'+(s.id===selected?' selected':'')+'>'+E(s.name)+'</option>').join("");
const field=(label,name,value="",opts={})=>'<div class="field '+(opts.full?"full":"")+'"><label for="f_'+E(name)+'">'+E(label)+'</label>'+
 (opts.type==="textarea"?'<textarea id="f_'+E(name)+'" name="'+E(name)+'" placeholder="'+E(opts.placeholder||"")+'">'+E(value)+'</textarea>':
 opts.type==="select"?'<select id="f_'+E(name)+'" name="'+E(name)+'">'+opts.options+'</select>':
 '<input id="f_'+E(name)+'" name="'+E(name)+'" type="'+E(opts.type||"text")+'" value="'+E(value)+'"'+(opts.required?" required":"")+(opts.min?' min="'+E(opts.min)+'"':"")+' placeholder="'+E(opts.placeholder||"")+'">')+'</div>';
function editSubject(existing=null){
 const colors=["#eaf8f2","#ece9ff","#fff2e5","#fce9f2","#eaf5ff"],sym=existing?.symbol||"📚";
 let html=field("Subject name","name",existing?.name||"",{required:true,placeholder:"e.g. Chemistry"})+
 field("Exam date","examDate",existing?.examDate||L.addDays(today(),14),{type:"date",required:true})+
 field("Icon / emoji","symbol",sym,{placeholder:"📚"})+
 field("Color","color",existing?.color||colors[0],{type:"select",options:colors.map(c=>'<option value="'+c+'"'+(existing?.color===c?' selected':"")+'>'+({[colors[0]]:"Mint",[colors[1]]:"Lavender",[colors[2]]:"Peach",[colors[3]]:"Rose",[colors[4]]:"Sky"}[c])+'</option>').join("")})+
 field("Syllabus topics (one per line)","topics",existing?.topics||"",{type:"textarea",full:true,placeholder:"Topic one\nTopic two\nTopic three"});
 openForm(existing?"Edit subject":"Add a new subject",html,(form,f)=>{
  const name=String(f.get("name")||"").trim().slice(0,65);
  const examDate=String(f.get("examDate")||"");
  if(!name||!/^\d{4}-\d{2}-\d{2}$/.test(examDate))throw Error("Enter a subject and valid exam date");
  const data={name,examDate,symbol:String(f.get("symbol")||"📚").slice(0,4),color:String(f.get("color")||colors[0]),topics:String(f.get("topics")||"").slice(0,12000)};
  if(existing){Object.assign(existing,data);notify("Subject updated. Choose Build plan to add new topics.");}
  else{const s={id:id(),...data};state.subjects.push(s);state.tasks.push(...L.schedule(s).map(t=>({...t,id:id()})));notify("Subject added and study plan created.");}
  return true;
 },existing?"Save changes":"Create subject & plan");
}
function addTask(){
 if(!state.subjects.length)return editSubject();
 const html=field("Subject","subjectId","",{type:"select",options:choices(state.subjects[0].id)})+
 field("Due date","dueDate",today(),{type:"date",required:true})+
 field("Task","title","",{full:true,required:true,placeholder:"e.g. Review chapter 4"})+
 field("Estimated minutes","minutes","25",{type:"number",min:"5"})+
 field("Type","kind","",{type:"select",options:'<option>Learn</option><option>Review</option><option>Practice</option>'});
 openForm("Add study task",html,(form,f)=>{
  const title=String(f.get("title")||"").trim().slice(0,180);
  if(!title)throw Error("Task name required");
  state.tasks.push({id:id(),subjectId:String(f.get("subjectId")),title,dueDate:String(f.get("dueDate")||today()),
   minutes:Math.max(5,Math.min(180,Number(f.get("minutes"))||25)),kind:String(f.get("kind")||"Learn"),done:false});
  notify("Task added.");return true;
 });
}
function addCard(){
 if(!state.subjects.length)return editSubject();
 const html=field("Subject","subjectId","",{type:"select",options:choices(state.subjects[0].id)})+
 field("Question / front","front","",{type:"textarea",full:true,placeholder:"What is...?"})+
 field("Answer / back","back","",{type:"textarea",full:true,placeholder:"The answer..."});
 openForm("Create a flashcard",html,(form,f)=>{
  const front=String(f.get("front")||"").trim().slice(0,350),back=String(f.get("back")||"").trim().slice(0,1100);
  if(!front||!back)throw Error("Enter both question and answer");
  state.cards.push({id:id(),subjectId:String(f.get("subjectId")),front,back,source:"Manual"});
  notify("Flashcard saved.");return true;
 });
}
function buildPlan(which=null){
 let sources=which?state.subjects.filter(s=>s.id===which):state.subjects;
 if(!sources.length)return notify("Add a subject first");
 let count=0;
 for(const s of sources){
  for(const task of L.schedule(s)){
   if(state.tasks.some(x=>x.subjectId===task.subjectId&&x.title===task.title))continue;
   state.tasks.push({...task,id:id()});count++;
  }
 }
 save();render();notify(count?count+" new study tasks added.":"Plan is already up to date.");
}
function importNotes(){
 if(!state.subjects.length)return editSubject();
 const credit=L.creditsLeft(state.plan,state.usedCredits);
 const html=field("Subject","subjectId","",{type:"select",options:choices(state.subjects[0].id)})+
 '<div class="field full"><label for="notesFile">Upload PDF or TXT (optional)</label><input type="file" id="notesFile" accept=".pdf,.txt,application/pdf,text/plain"><span class="helper">PDF up to 8 MB, text-based PDFs only. File processed locally on your computer.</span></div>'+
 field("Or paste notes here","notes","",{type:"textarea",full:true,placeholder:"Photosynthesis: Plants convert light energy into chemical energy.\nMitochondria are organelles that produce energy."})+
 '<div class="field full"><div class="callout neutral">Offline drafting only: looks for definitions (e.g. “Term: explanation” or “Term is…”). Flashcards need your review. 1 demo credit; you have '+credit+' remaining. No real AI request.</div></div>';
 openForm("Import notes & draft flashcards",html,async(form,f)=>{
  if(L.creditsLeft(state.plan,state.usedCredits)<=0)throw Error("Demo credit limit reached. Change preview plan in Settings.");
  let text=String(f.get("notes")||"").trim(),filename="Pasted notes";
  const file=form.querySelector("#notesFile").files[0];
  if(file){
   filename=file.name;
   if(file.size>8*1024*1024)throw Error("Maximum file size: 8 MB");
   if(/\.pdf$/i.test(file.name)){
    const {getDocument,GlobalWorkerOptions}=await import("./pdf.mjs");
    GlobalWorkerOptions.workerSrc=new URL("./pdf.worker.mjs",location.href).href;
    const pdf=await getDocument({data:new Uint8Array(await file.arrayBuffer()),useSystemFonts:true}).promise;
    if(pdf.numPages>35)throw Error("Only the first 35 pages are supported in this demo.");
    const chunks=[];
    for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){
     const page=await pdf.getPage(pageNo);
     const data=await page.getTextContent();
     chunks.push(data.items.map(item=>item.str||"").join(" "));
    }
    const extracted=chunks.join("\n").trim();
    await pdf.destroy();
    if(!extracted||extracted.length<10)throw Error("No selectable text found. Image-only PDFs are not supported.");
    text+="\n"+extracted.slice(0,85000);
   }else if(/\.txt$/i.test(file.name)){text+="\n"+await file.text()}
   else throw Error("PDF and TXT only");
  }
  if(!text.trim())throw Error("Paste notes or choose a PDF/TXT file");
  const subjectId=String(f.get("subjectId"));
  const drafts=L.draftCards(text,subjectId,12);
  if(!drafts.length)throw Error("No clear definitions detected. Try lines like 'Photosynthesis: ...'. No credit used.");
  state.cards.push(...drafts.map(card=>({...card,id:id()})));
  state.materials.push({id:id(),subjectId,filename,preview:text.slice(0,900),createdAt:new Date().toISOString(),cardsDrafted:drafts.length});
  state.materials=state.materials.slice(-60);
  state.usedCredits++;
  cardIndex=0;flipped=false;deckFilter=subjectId;view="flashcards";
  notify(drafts.length+" draft cards created. Review answers for accuracy.");
  return true;
 },"Draft study cards");
}

document.addEventListener("click",ev=>{
 const nav=ev.target.closest("[data-view]");
 if(nav){navigate(nav.dataset.view);return;}
 const b=ev.target.closest("[data-action]");if(!b)return;
 const action=b.dataset.action;
 if(action==="close-modal"){modal.close();return;}
 if(action==="add-subject"){editSubject();return;}
 if(action==="edit-subject"){let s=subject(b.dataset.id);if(s)editSubject(s);return;}
 if(action==="delete-subject"){
  const s=subject(b.dataset.id);if(!s)return;
  if(!confirm("Delete "+s.name+" and all its tasks, flashcards and saved material? Export a backup first if needed."))return;
  state.subjects=state.subjects.filter(x=>x.id!==s.id);
  state.tasks=state.tasks.filter(x=>x.subjectId!==s.id);
  state.cards=state.cards.filter(x=>x.subjectId!==s.id);
  state.materials=state.materials.filter(x=>x.subjectId!==s.id);
  if(deckFilter===s.id)deckFilter="all";
  if(quizFilter===s.id)quizFilter="all";
  save();render();notify(s.name+" removed.");return;
 }
 if(action==="plan-subject"){buildPlan(b.dataset.id);navigate("planner");return;}
 if(action==="add-task"){addTask();return;}
 if(action==="add-card"){addCard();return;}
 if(action==="import-notes"){importNotes();return;}
 if(action==="plan-all"){buildPlan();return;}
 if(action==="delete-task"){state.tasks=state.tasks.filter(x=>x.id!==b.dataset.id);save();render();notify("Task removed.");return;}
 if(action==="delete-card"){state.cards=state.cards.filter(x=>x.id!==b.dataset.id);save();render();notify("Flashcard removed.");return;}
 if(action==="flip-card"){flipped=!flipped;render();return;}
 if(action==="prev-card"){let n=currentDeck().length;cardIndex=n?(cardIndex-1+n)%n:0;flipped=false;render();return;}
 if(action==="next-card"){let n=currentDeck().length;cardIndex=n?(cardIndex+1)%n:0;flipped=false;render();return;}
 if(action==="start-quiz"){const all=state.cards.filter(c=>quizFilter==="all"||c.subjectId===quizFilter);quiz=L.quizQuestions(all,10);quizAt=0;quizScore=0;quizAnswer=null;render();return;}
 if(action==="answer"){
  if(quizAnswer!==null||!quiz[quizAt])return;
  quizAnswer=Number(b.dataset.index);
  if(quiz[quizAt].options[quizAnswer]===quiz[quizAt].correct)quizScore++;
  render();return;
 }
 if(action==="next-question"){quizAt++;quizAnswer=null;render();return;}
 if(action==="save-goal"){let goal=Number(document.getElementById("dailyGoal").value);if(!Number.isFinite(goal)||goal<15||goal>360){notify("Choose 15–360 minutes.");return;}state.dailyGoal=Math.round(goal);save();render();notify("Daily target saved.");return;}
 if(action==="change-plan"){state.plan=b.dataset.plan;state.usedCredits=Math.min(state.usedCredits,L.limits[state.plan]);save();render();notify("Switched demo preview to "+state.plan+". No payment made.");return;}
 if(action==="reset-credits"){state.usedCredits=0;save();render();notify("Demo credits reset.");return;}
 if(action==="export-data"){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");link.href=url;link.download="studyflow-backup-"+today()+".json";link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);notify("Backup exported.");return;
 }
 if(action==="import-data"){document.getElementById("backupFile")?.click();return;}
 if(action==="start-fresh"){
  if(!confirm("Start with a blank workspace? This deletes the demo subjects, cards and tasks. Export a backup first if needed."))return;
  state={...example(),subjects:[],tasks:[],cards:[],materials:[],usedCredits:0,focusMinutes:0};
  save();deckFilter="all";quizFilter="all";cardIndex=0;quiz=[];navigate("dashboard");notify("Blank workspace ready.");return;
 }
 if(action==="reset-demo"){
  if(!confirm("Reset to sample data? This replaces everything in this browser. Export a backup first if needed."))return;
  state=example();save();deckFilter="all";quizFilter="all";cardIndex=0;quiz=[];render();notify("Demo reset.");return;
 }
 if(action==="timer-toggle"){
  timerRunning=!timerRunning;
  if(timerRunning){
   let due=Date.now()+timerSeconds*1000;
   clearInterval(timerInterval);
   timerInterval=setInterval(()=>{
    if(!timerRunning)return;
    timerSeconds=Math.max(0,Math.ceil((due-Date.now())/1000));updateTimer();
    if(timerSeconds===0){clearInterval(timerInterval);timerRunning=false;timerSeconds=25*60;state.focusMinutes=(state.focusMinutes||0)+25;save();render();notify("Focus session complete! Time for a short break.");}
   },300);
  }else clearInterval(timerInterval);
  render();return;
 }
 if(action==="timer-reset"){timerRunning=false;clearInterval(timerInterval);timerSeconds=25*60;render();return;}
});
document.addEventListener("change",async ev=>{
 const input=ev.target;
 if(input.dataset.action==="toggle-task"){
  const t=state.tasks.find(x=>x.id===input.dataset.id);
  if(t){t.done=input.checked;save();render();}
 }
 if(input.id==="deckFilter"){deckFilter=input.value;cardIndex=0;flipped=false;render();}
 if(input.id==="quizFilter"){quizFilter=input.value;quiz=[];quizAt=0;quizAnswer=null;render();}
 if(input.id==="backupFile"){
  const file=input.files?.[0];if(!file)return;
  if(file.size>2*1024*1024){notify("Backup must be under 2 MB.");return;}
  try{
   const obj=JSON.parse(await file.text());
   if(!validate(obj))throw Error("Not a valid StudyFlow backup.");
   if(!confirm("Import this backup? It will replace the current local workspace."))return;
   state=obj;save();deckFilter="all";quizFilter="all";quiz=[];view="dashboard";render();notify("Study workspace restored.");
  }catch(e){notify(String(e.message||"Could not import backup."));}
 }
});
modal.addEventListener("click",ev=>{if(ev.target===modal)modal.close();});
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
window.StudyFlowDemoStatus=()=>({remaining:L.creditsLeft(state.plan,state.usedCredits),total:L.limits[state.plan]||10,focusMinutes:state.focusMinutes||0,timerSeconds,timerRunning});
save();render();
})();
