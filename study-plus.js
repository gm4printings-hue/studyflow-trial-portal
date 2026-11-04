"use strict";
(function(){
const KEY="studyflow-plus-v1", ORIGINAL="studyflow-local-demo-v1";
const $=x=>document.querySelector(x), html=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>crypto?.randomUUID?.()||String(Date.now())+"_"+Math.random().toString(36).slice(2);
const nowDate=()=>{let d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const addDate=(s,n)=>{let d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const daysLeft=s=>Math.round((new Date(s+"T12:00:00")-new Date(nowDate()+"T12:00:00"))/86400000);
const weekStart=()=>{let d=new Date(nowDate()+"T12:00:00"),diff=(d.getDay()+6)%7;d.setDate(d.getDate()-diff);return d.toISOString().slice(0,10)};
const weekday=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const messages={
 en:{bookLanguage:"Printed page language",lesson:"Explain my lesson",week:"Weekly schedule",exams:"Exam calendar",heading:"Lesson explanation",hint:"Upload clear photos or a PDF, or enter textbook and page numbers. Page numbers alone cannot reveal a book's contents.",subject:"Subject",book:"Book title",grade:"Grade / class",pages:"Page number(s)",source:"Lesson text (paste here or extract from photos/PDF)",photos:"Photos / camera",gallery:"Gallery / Files",camera:"Take Photo",pdf:"PDF document",extract:"Read uploaded pages",explain:"Create study explanation",mode:"Explanation format",lang:"Language",written:"Written",voice:"Voice",both:"Both",voicePlay:"Read aloud",pause:"Pause",resume:"Resume",stop:"Stop",rate:"Voice speed",result:"Your study explanation",noText:"Upload and read the pages or paste the lesson text first. Book title and page numbers alone are not enough.",ocrPending:"Reading your files... large photos can take a moment.",ocrBad:"Could not read this picture. Try a clearer image or paste the text.",pdfBad:"Could not read selectable PDF text. For scanned pages try photos or copy/paste.",localGuide:"Study guide generated from the supplied page text. This is an extractive local preview, not an AI tutor. Check against the textbook.",summary:"Main ideas from the lesson",terms:"Key words",practice:"Practice questions",intro:"About the lesson",bookMissing:"The book/page reference is saved, but the lesson itself must be supplied to explain it accurately.",weekly:"Weekly class timetable",weeklyInfo:"Add each class by weekday and period. The checklist resets each new week.",day:"Day",class:"Class / subject",period:"Period",time:"Time (optional)",addClass:"Add class",today:"Today",checklist:"Books, homework & tasks",item:"What do you need to remember?",addItem:"Add to checklist",remove:"Remove",done:"Done",empty:"Nothing scheduled yet.",examTitle:"Exams & revision",examInfo:"Add exam dates and receive a revision checklist 2 or 3 days beforehand.",examSubject:"Exam subject",examDate:"Exam date",topics:"Lessons / topics to review",days:"Reminder days before",addExam:"Add exam",review:"Revision plan",day3:"Read and organize the lesson topics",day2:"Review the important ideas and make flashcards",day1:"Practice questions and revisit difficult points",enable:"Enable browser notifications",calendar:"Add to phone calendar (.ics)",notifyInfo:"Browser alerts only work while this page is open. Import the calendar event for reminders when closed.",permission:"Notifications need your browser permission and HTTPS.",noExams:"No exams planned.",settings:"StudyFlow language",share:"Data is saved only in this browser. Photos/PDFs are read on the device and not saved to the server.",bookHelp:"For a named book without a supplied page, do not guess its contents.",readDone:"Text extracted. Review and correct mistakes before continuing.",ocrUnavail:"Photo reading service unavailable. You can still paste the lesson text.",permissionGranted:"Notifications enabled while page is open.",permissionDenied:"Notifications denied; phone-calendar reminders are available.",uploadLimit:"Please use files under 12 MB each.",atLeast:"Add a name and date.",edit:"Edit",save:"Save",cancel:"Cancel",lessonSaved:"Lesson saved for this browser.",textRequired:"No readable text was found. Please add text or a clear image.",export:"Export schedule & exams",lessonShort:"The text may be too short for a useful summary."},
 fr:{bookLanguage:"Langue des pages imprimées",lesson:"Expliquer ma leçon",week:"Emploi du temps",exams:"Calendrier des examens",heading:"Explication de la leçon",hint:"Ajoutez des photos ou un PDF, ou indiquez le livre et les pages. Les numéros seuls ne donnent pas accès au texte du livre.",subject:"Matière",book:"Nom du livre",grade:"Classe / niveau",pages:"Page(s)",source:"Texte de la leçon (coller ou extraire)",photos:"Photos / caméra",gallery:"Galerie / Fichiers",camera:"Prendre une photo",pdf:"Document PDF",extract:"Lire les pages jointes",explain:"Créer une explication",mode:"Format de l'explication",lang:"Langue",written:"Texte",voice:"Audio",both:"Texte + audio",voicePlay:"Écouter",pause:"Pause",resume:"Reprendre",stop:"Arrêter",rate:"Vitesse",result:"Votre explication",noText:"Ajoutez une photo, un PDF ou collez le texte. Le titre et les pages ne suffisent pas.",ocrPending:"Lecture des pages...",ocrBad:"Photo illisible. Essayez une image nette ou collez le texte.",pdfBad:"Impossible d'extraire le texte PDF. Essayez une photo.",localGuide:"Résumé local extrait du texte fourni, sans tuteur IA. Vérifiez dans le manuel.",summary:"Idées principales",terms:"Mots-clés",practice:"Questions d'entraînement",intro:"À propos de la leçon",bookMissing:"Le livre et les pages sont notés, mais il faut fournir le texte pour une explication fiable.",weekly:"Emploi du temps hebdomadaire",weeklyInfo:"Ajoutez les cours par jour et par heure. La liste recommence chaque semaine.",day:"Jour",class:"Cours / matière",period:"Heure de cours",time:"Horaire (facultatif)",addClass:"Ajouter un cours",today:"Aujourd'hui",checklist:"Livres, devoirs et tâches",item:"À ne pas oublier",addItem:"Ajouter une tâche",remove:"Supprimer",done:"Fait",empty:"Aucun cours prévu.",examTitle:"Examens et révisions",examInfo:"Préparez vos examens 2 ou 3 jours à l'avance.",examSubject:"Matière",examDate:"Date d'examen",topics:"Leçons à réviser",days:"Rappel avant (jours)",addExam:"Ajouter un examen",review:"Plan de révision",day3:"Relire et organiser les leçons",day2:"Réviser les idées et créer des fiches",day1:"Faire des exercices et revoir les difficultés",enable:"Activer les notifications",calendar:"Ajouter au calendrier (.ics)",notifyInfo:"Les alertes du navigateur exigent que la page reste ouverte. Le calendrier du téléphone peut rappeler même fermé.",permission:"Autorisation et HTTPS nécessaires.",noExams:"Aucun examen prévu.",settings:"Langue de StudyFlow",share:"Données enregistrées dans ce navigateur. Les fichiers restent sur cet appareil.",bookHelp:"Ne pas inventer le contenu du livre.",readDone:"Texte extrait. Vérifiez-le.",ocrUnavail:"Lecture photo indisponible. Collez votre texte.",permissionGranted:"Alertes activées pendant l'ouverture.",permissionDenied:"Alertes refusées. Utilisez le calendrier.",uploadLimit:"Fichiers limités à 12 Mo.",atLeast:"Nom et date requis.",edit:"Modifier",save:"Enregistrer",cancel:"Annuler",lessonSaved:"Leçon sauvegardée.",textRequired:"Aucun texte lisible.",export:"Exporter planning & examens",lessonShort:"Le texte est court."},
 ar:{bookLanguage:"لغة صفحات الكتاب",lesson:"اشرح درسي",week:"الجدول الأسبوعي",exams:"مواعيد الامتحانات",heading:"شرح الدرس",hint:"حمّل صوراً واضحة أو PDF، أو اكتب اسم الكتاب والصفحات. لا يمكن معرفة محتوى الصفحة من رقمها فقط.",subject:"المادة",book:"اسم الكتاب",grade:"الصف",pages:"رقم الصفحة أو الصفحات",source:"نص الدرس (ألصقه أو استخرجه)",photos:"صور / كاميرا",gallery:"المعرض / الملفات",camera:"التقاط صورة",pdf:"ملف PDF",extract:"قراءة الصفحات",explain:"إنشاء شرح للدرس",mode:"طريقة الشرح",lang:"اللغة",written:"كتابة",voice:"صوت",both:"صوت وكتابة",voicePlay:"الاستماع",pause:"إيقاف مؤقت",resume:"متابعة",stop:"إيقاف",rate:"سرعة الصوت",result:"شرح الدرس",noText:"أضف صوراً أو PDF أو نص الدرس. اسم الكتاب ورقم الصفحة وحدهما لا يكفيان.",ocrPending:"جاري قراءة الصفحات...",ocrBad:"تعذر قراءة الصورة. جرّب صورة أوضح.",pdfBad:"تعذر استخراج نص PDF. جرّب الصور.",localGuide:"هذه نقاط مقتبسة من النص المتوفر وليست شرحاً من نموذج ذكاء اصطناعي. تحقق من الكتاب.",summary:"الأفكار الرئيسية",terms:"الكلمات المفتاحية",practice:"أسئلة للمراجعة",intro:"عن الدرس",bookMissing:"تم حفظ معلومات الكتاب لكن الشرح يتطلب محتوى الصفحة.",weekly:"الجدول المدرسي",weeklyInfo:"أضف الحصص حسب اليوم. تبدأ قائمة المهام من جديد كل أسبوع.",day:"اليوم",class:"الحصة / المادة",period:"رقم الحصة",time:"الوقت (اختياري)",addClass:"إضافة حصة",today:"اليوم",checklist:"الكتب والواجبات",item:"ماذا يجب ألا تنسى؟",addItem:"إضافة إلى القائمة",remove:"حذف",done:"تم",empty:"لا يوجد حصص بعد.",examTitle:"الامتحانات والمراجعة",examInfo:"ابدأ المراجعة قبل الامتحان بيومين أو ثلاثة.",examSubject:"مادة الامتحان",examDate:"تاريخ الامتحان",topics:"الدروس المطلوبة",days:"التذكير قبل (أيام)",addExam:"إضافة امتحان",review:"خطة المراجعة",day3:"اقرأ الدروس ورتب الأفكار",day2:"راجع الأفكار المهمة",day1:"تمرن على الأسئلة",enable:"تفعيل التنبيهات",calendar:"إضافة للتقويم (.ics)",notifyInfo:"تنبيهات المتصفح تعمل فقط أثناء فتح الصفحة. استخدم تقويم الهاتف للتنبيه عند الإغلاق.",permission:"التنبيهات تتطلب الإذن و HTTPS.",noExams:"لا يوجد امتحانات.",settings:"لغة StudyFlow",share:"البيانات محفوظة في هذا المتصفح. الصور لا تخزن على الخادم.",bookHelp:"لا تخمن محتوى الكتاب.",readDone:"تم استخراج النص. يرجى مراجعته.",ocrUnavail:"قراءة الصور غير متوفرة. ألصق النص.",permissionGranted:"تم تفعيل التنبيهات خلال فتح الصفحة.",permissionDenied:"تم رفض التنبيهات، استخدم التقويم.",uploadLimit:"الحد 12 ميغابايت لكل ملف.",atLeast:"الاسم والتاريخ مطلوبان.",edit:"تعديل",save:"حفظ",cancel:"إلغاء",lessonSaved:"حفظ الدرس.",textRequired:"لا يوجد نص واضح.",export:"تصدير الجدول",lessonShort:"النص قصير."},
 azi:{bookLanguage:"Language el saf7a",lesson:"Chare7 el dares",week:"Programme el osbou3",exams:"Mawa3id el exams",heading:"Chare7 el dares",hint:"Sawwer saf7a mn el book aw upload PDF. Esem el book w page numbers la7alon ma bykafou la n3ref el content.",subject:"El madde",book:"Esem el book",grade:"El saf / grade",pages:"Page number(s)",source:"Text el dares (paste aw extract)",photos:"Sowar / camera",gallery:"Gallery / Files",camera:"Sawwer",pdf:"PDF file",extract:"E2ra el pages",explain:"3mol chare7",mode:"Kif badak el chare7?",lang:"El language",written:"Kitebe",voice:"Sot",both:"Sot + kitebe",voicePlay:"Esma3",pause:"Pause",resume:"Kammil",stop:"Stop",rate:"Sore3et el sot",result:"Chare7 el dares",noText:"Upload soura/PDF aw 7ot text el dares. Book name w page number mesh kefye.",ocrPending:"3am ne2ra el pages...",ocrBad:"El soura ma n2aret mni7. Jarrib soura awda7.",pdfBad:"PDF ma 3emel extract lal text. Jarrib soura.",localGuide:"Hayda summary mn el text yalli enta 3tayto, mesh AI tutor ba3ed. Raje3o ma3 el book.",summary:"El fekar el asasiye",terms:"Kelimét mohemme",practice:"As2ila lal moraja3a",intro:"3an el dares",bookMissing:"7afazna esem el book wel pages, bas lezim el content la chare7 mazbout.",weekly:"Programme el madrase",weeklyInfo:"3abbi subjects kel nhar, w el checklist btrja3 fresh kel osbou3.",day:"Nhar",class:"Madde / subject",period:"7essa",time:"El wa2et (optional)",addClass:"Zid 7essa",today:"El yom",checklist:"Books, homework w tasks",item:"Chou ma lezim tensa?",addItem:"Zid 3al checklist",remove:"Chil",done:"Kholset",empty:"Ma fi classes ba3ed.",examTitle:"Exams w moraja3a",examInfo:"7ot date el exam 7ta tebda2 moraja3a 2 aw 3 days abel.",examSubject:"Madde el exam",examDate:"Date el exam",topics:"Drous lal moraja3a",days:"Reminder abel (days)",addExam:"Zid exam",review:"Plan lal moraja3a",day3:"E2ra el drous w rattib el topics",day2:"Raje3 el afkar w 3mol flashcards",day1:"7ell as2ila w raje3 el sa3eb",enable:"Fa3el notifications",calendar:"Zid 3al mobile calendar (.ics)",notifyInfo:"Browser notifications btchta8el bas lamma el app maftou7a. Mobile calendar bye2dar yzakkerak 7atta iza m2affal.",permission:"Notifications badon browser permission w HTTPS.",noExams:"Ma fi exams ba3ed.",settings:"Language taba3 StudyFlow",share:"Data saved 3a nafes el browser. El sowar w PDFs ma 3am yen7afazo 3al server.",bookHelp:"Ma mnkhtare3 content mn book name.",readDone:"El text n2ara. Raje3o w sa77e7 mistakes.",ocrUnavail:"Photo reading mesh available. Fik ta3mil paste lal text.",permissionGranted:"Notifications enabled lamma el page maftou7a.",permissionDenied:"Notifications blocked. Sta3mil calendar.",uploadLimit:"File max 12 MB.",atLeast:"7ot name w date.",edit:"Edit",save:"Save",cancel:"Cancel",lessonSaved:"El dares n7afaz.",textRequired:"Ma fi text ma2rou2.",export:"Export schedule & exams",lessonShort:"El text 2asir."}
};
let data;
try{data=JSON.parse(window.StudyFlowStudentStore.get(KEY))}catch{}
if(!data||typeof data!=="object")data={lang:"en",classes:[],items:[],exams:[],lesson:null};
data.lang=messages[data.lang]?data.lang:"en";
for(const k of ["classes","items","exams"])if(!Array.isArray(data[k]))data[k]=[];
let selectedSubject="",active=null,lastVoice="",reading=false,ocrWorker=null,notified=new Set();
const t=(key)=>messages[data.lang][key]||messages.en[key]||key;
function save(){try{window.StudyFlowStudentStore.set(KEY,JSON.stringify(data))}catch{alert("Browser storage full. Please export/clear older data.")}}
function legacySubjects(){try{return JSON.parse(window.StudyFlowStudentStore.get(ORIGINAL))?.subjects||[]}catch{return []}}
function notice(msg){let box=$("#toast");box.textContent=msg;box.classList.add("visible");setTimeout(()=>box.classList.remove("visible"),3900)}
function box(title,body){return '<section class="plus-panel"><h2>'+html(title)+'</h2>'+body+'</section>'}
function field(label,name,val="",type="text",req=false){return '<label class="plus-field">'+html(label)+'<input name="'+html(name)+'" type="'+type+'" value="'+html(val)+'" '+(req?"required":"")+'></label>'}
function subjectSelect(selected=""){
 let subjects=legacySubjects();return '<select name="subject" id="plusSubject">'+subjects.map(s=>'<option value="'+html(s.name)+'" '+(s.name===selected?"selected":"")+'>'+html(s.name)+'</option>').join("")+'<option value="Other">Other</option></select>';
}
function localPage(){
 const p=$("#main");p.setAttribute("dir",data.lang==="ar"?"rtl":"ltr");return p;
}
function datesFormatted(x){return x?new Date(x+"T12:00:00").toLocaleDateString(data.lang==="fr"?"fr-FR":data.lang==="ar"?"ar-LB":"en-GB",{weekday:"short",month:"short",day:"numeric"}):""}
function renderLesson(){
 const lesson={...(data.lesson||{}),subject:selectedSubject||(data.lesson?.subject||"")};
 return '<div class="page-heading"><div><p class="eyebrow">STUDYFLOW</p><h1>'+t("heading")+'</h1><p class="intro">'+t("hint")+'</p></div></div>'+
 box(t("lesson"),'<form id="plusLessonForm" class="plus-form"><div class="plus-grid"><label class="plus-field">'+t("subject")+subjectSelect(lesson.subject||"")+'</label>'+
 field(t("book"),"book",lesson.book||"")+field(t("grade"),"grade",lesson.grade||"")+field(t("pages"),"pages",lesson.pages||"")+
 '<label class="plus-field">'+t("mode")+'<select name="mode"><option value="written">Chat</option><option value="voice">'+t("voice")+'</option><option value="both">'+t("both")+'</option></select></label></div>'+
 '<label class="plus-field plus-ocr-language">'+t("bookLanguage")+'<select id="plusOcrLang" name="ocrLang"><option value="eng">English</option><option value="fra">Français</option><option value="ara">Arabic</option></select></label><div class="plus-upload-grid"><label class="plus-drop">🖼️ '+t("gallery")+'<input type="file" id="plusPhotos" accept="image/*" multiple><small>JPG, PNG, WEBP</small></label>'+
 '<label class="plus-drop">📷 '+t("camera")+'<input type="file" id="plusCamera" accept="image/*" capture="environment"><small>Take a new picture</small></label>'+
 '<label class="plus-drop plus-pdf-option">📄 '+t("pdf")+'<input type="file" id="plusPDF" accept=".pdf,application/pdf"><small>Text PDF or scanned PDF</small></label></div>'+
 '<p id="plusFileList" class="helper"></p>'+
 '<button type="button" class="btn ghost" id="plusExtract">'+t("extract")+'</button>'+
 '<label class="plus-field plus-full">'+t("source")+'<textarea name="text" id="plusText" rows="9" placeholder="'+html(t("source"))+'">'+html(lesson.text||"")+'</textarea></label>'+
 '<div class="plus-actions"><button class="btn" type="submit">'+t("explain")+'</button></div></form>'+
 '<p class="helper">'+t("share")+'</p>')+
 (lesson.result?renderExplanation(lesson):'');
}
function extractGuide(text,subject,book,pages){
 let clean=String(text||"").replace(/\s+/g," ").trim().slice(0,24000);
 let sentences=clean.match(/[^.!?؟؛\n]+[.!?؟؛]?/g)||[clean];
 sentences=sentences.map(x=>x.trim()).filter(x=>x.length>24&&x.length<450);
 const terms=clean.split(/\s+/).map(x=>x.replace(/[.,!?:;()[\]{}]/g,"").toLowerCase()).filter(w=>w.length>=5&&w.length<28);
 const stops=new Set(["about","which","their","there","these","would","could","because","where","between","after","before","through","using","every","other","means","those","these","while","have","from","with","this","that","comme","pour","dans","avec","cette","sont","vous","elles","quelque","mais","dans"]);
 const freq={};for(const term of terms)if(!stops.has(term))freq[term]=(freq[term]||0)+1;
 const keys=Object.keys(freq).sort((a,b)=>freq[b]-freq[a]).slice(0,7);
 const scored=sentences.map((s,i)=>({s,i,score:(s.toLowerCase().split(/\s+/).filter(x=>keys.includes(x.replace(/[.,;:!?]/g,""))).length/Math.max(1,s.split(" ").length))+Math.max(0,.07-i*.002)})).sort((a,b)=>b.score-a.score).slice(0,5).sort((a,b)=>a.i-b.i);
 const summary=scored.map(x=>x.s).filter(Boolean);
 const questions=summary.slice(0,3).map((s,i)=>data.lang==="fr"?"Expliquez avec vos mots cette idée : "+s.slice(0,95)+"…":data.lang==="ar"?"اشرح الفكرة التالية بأسلوبك: "+s.slice(0,85)+"…":data.lang==="azi"?"Fasser hal fekra bi kelmetak: "+s.slice(0,95)+"…":"Explain this idea in your own words: "+s.slice(0,95)+"…");
 return {summary,keys,questions,sourceChars:clean.length};
}
function renderExplanation(lesson){
 const x=lesson.result;lastVoice=(x.summary||[]).join(". ");
 return box(t("result"),'<div class="callout neutral">'+t("localGuide")+'</div>'+
 '<p class="helper">'+html((lesson.subject||"")+" · "+(lesson.book||"")+" "+(lesson.pages||""))+'</p>'+
 '<div class="plus-actions"><button class="btn mini" id="plusSpeak">▶ '+t("voicePlay")+'</button><button class="btn ghost mini" id="plusPause">'+t("pause")+'</button><button class="btn ghost mini" id="plusStop">'+t("stop")+'</button><label class="plus-speed">'+t("rate")+' <select id="plusRate"><option value=".8">0.8×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option></select></label></div>'+
 '<h3>'+t("summary")+'</h3>'+(x.summary?.length?'<ol>'+x.summary.map(a=>'<li>'+html(a)+'</li>').join("")+'</ol>':'<p>'+t("lessonShort")+'</p>')+
 '<h3>'+t("terms")+'</h3><p>'+html((x.keys||[]).join(" · "))+'</p><h3>'+t("practice")+'</h3><ol>'+x.questions.map(q=>'<li>'+html(q)+'</li>').join("")+'</ol>');
}
function renderWeek(){
 const todayDay=(new Date().getDay()+6)%7;
 return '<div class="page-heading"><div><p class="eyebrow">STUDYFLOW</p><h1>'+t("weekly")+'</h1><p class="intro">'+t("weeklyInfo")+'</p></div></div>'+
 box(t("addClass"),'<form id="plusClassForm" class="plus-form plus-grid"><label class="plus-field">'+t("day")+'<select name="day">'+weekday.map((d,i)=>'<option value="'+i+'" '+(i===todayDay?"selected":"")+'>'+html(dayName(i))+'</option>').join("")+'</select></label>'+
 field(t("class"),"name","", "text",true)+field(t("period"),"period","1","number",true)+field(t("time"),"time","","time")+
 '<button class="btn" type="submit">'+t("addClass")+'</button></form>')+
 '<div class="plus-week-grid">'+weekday.map((d,i)=>box(dayName(i)+(i===todayDay?' · '+t("today"):""),(data.classes.filter(x=>Number(x.day)===i).sort((a,b)=>Number(a.period)-Number(b.period)).map(c=>'<div class="plus-line"><span><strong>'+html(c.period)+'. '+html(c.name)+'</strong> <small>'+html(c.time||"")+'</small></span><button class="plus-delete" data-plus-action="class-del" data-id="'+html(c.id)+'" title="'+t("remove")+'">×</button></div>').join("")||'<p class="helper">'+t("empty")+'</p>')+
 '<form data-day="'+i+'" class="plusTaskForm plus-task-add"><input required maxlength="160" name="label" placeholder="'+html(t("item"))+'"><button class="btn mini" type="submit">＋</button></form>'+
 '<div class="plus-checklist">'+data.items.filter(x=>Number(x.day)===i).map(item=>'<div class="plus-line"><label class="plus-check"><input type="checkbox" data-plus-check="'+html(item.id)+'" '+(item.doneWeek===weekStart()?"checked":"")+'><span class="'+(item.doneWeek===weekStart()?"plus-done":"")+'">'+html(item.label)+'</span></label><button class="plus-delete" data-plus-action="item-del" data-id="'+html(item.id)+'" title="'+t("remove")+'">×</button></div>').join("")+'</div>')).join("")+'</div>'+footerNote();
}
function dayName(i){const short={fr:["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"],ar:["الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت","الأحد"],azi:["Tnen","Tleta","Arb3a","Khamis","Jom3a","Sabt","A7ad"]};return (short[data.lang]||weekday)[i]}
function footerNote(){return '<p class="helper">'+t("share")+'</p>'}
function revision(ex){
 const names=[t("day3"),t("day2"),t("day1")];
 const reviewDays=Number(ex.lead)===2?[2,1]:[3,2,1];
 return '<div class="plus-revision"><h3>'+t("review")+'</h3>'+
 reviewDays.map((n,i)=>'<div class="plus-line"><span><b>'+html(datesFormatted(addDate(ex.date,-n)))+'</b> · '+(n===3?t("day3"):n===2?t("day2"):t("day1"))+(i===0&&ex.topics?' — '+html(ex.topics):'')+'</span></div>').join("")+'</div>';
}
function renderExams(){
 return '<div class="page-heading"><div><p class="eyebrow">STUDYFLOW</p><h1>'+t("examTitle")+'</h1><p class="intro">'+t("examInfo")+'</p></div></div>'+
 box(t("addExam"),'<form id="plusExamForm" class="plus-form plus-grid">'+field(t("examSubject"),"subject","", "text",true)+field(t("examDate"),"date",addDate(nowDate(),14),"date",true)+
 '<label class="plus-field">'+t("days")+'<select name="lead"><option value="3">3</option><option value="2">2</option></select></label>'+
 field(t("topics"),"topics","")+'<button class="btn" type="submit">'+t("addExam")+'</button></form>'+
 '<div class="plus-actions"><button id="plusPermission" class="btn soft">'+t("enable")+'</button></div><p class="helper">'+t("notifyInfo")+'</p>')+
 (data.exams.length?'<div class="plus-exams">'+[...data.exams].sort((a,b)=>a.date.localeCompare(b.date)).map(e=>box('📅 '+html(e.subject)+' · '+datesFormatted(e.date),
 '<p class="helper">'+html(e.topics||"")+' · '+(daysLeft(e.date)>=0?daysLeft(e.date)+" days left":"Past exam")+'</p>'+
 '<div class="plus-actions"><button class="btn mini ghost" data-plus-action="ics" data-id="'+html(e.id)+'">'+t("calendar")+'</button><button class="plus-delete" data-plus-action="exam-del" data-id="'+html(e.id)+'">'+t("remove")+'</button></div>'+revision(e))).join("")+'</div>':
 box(t("noExams"),'<p class="helper">'+t("examInfo")+'</p>'))+footerNote();
}
function render(){
 const p=localPage();p.innerHTML=active==="lesson"?renderLesson():active==="week"?renderWeek():renderExams();
 $("#crumbTitle").textContent=active==="lesson"?t("lesson"):active==="week"?t("week"):t("exams");
 document.querySelectorAll(".nav-link").forEach(el=>el.classList.toggle("selected",el.dataset.plusView===active));
 if(active==="lesson"&&data.lesson&&$("#plusLessonForm"))$("#plusLessonForm").elements.mode.value=data.lesson.mode||"both";
 if(active==="lesson"&&$("#plusOcrLang"))$("#plusOcrLang").value=data.lang==="ar"?"ara":data.lang==="fr"?"fra":"eng";
}
function openPlus(v){active=v;window.speechSynthesis?.cancel();render();$("#sidebar")?.classList.remove("open");window.scrollTo({top:0})}
function voice(){
 if(!lastVoice)return;
 if(!("speechSynthesis" in window)){notice("Text-to-speech unavailable on this device");return}
 speechSynthesis.cancel();
 const ut=new SpeechSynthesisUtterance(lastVoice);
 ut.lang={en:"en-US",fr:"fr-FR",ar:"ar-LB",azi:"en-US"}[data.lang];
 ut.rate=Number($("#plusRate")?.value||1);
 ut.onend=()=>{reading=false};reading=true;speechSynthesis.speak(ut);
 if(data.lang==="azi")notice("Arabizi pronunciation varies by device. Written explanation remains available.");
}
function currentFiles(){const a=[...($("#plusPhotos")?.files||[])];const c=[...($("#plusCamera")?.files||[])];const p=[...($("#plusPDF")?.files||[])];return [...a,...c,...p]}
async function ocrPhoto(file){
 if(!window.Tesseract) {
  await new Promise((resolve,reject)=>{let s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";s.onload=resolve;s.onerror=()=>reject(Error(t("ocrUnavail")));document.head.appendChild(s)});
 }
 const lang=$("#plusOcrLang")?.value||"eng";
 if(!ocrWorker||ocrWorker._lang!==lang){
  if(ocrWorker)await ocrWorker.terminate();
  ocrWorker=await Tesseract.createWorker(lang,1,{logger:m=>{const status=$("#plusFileList");if(status&&m.status==="recognizing text")status.textContent=t("ocrPending")+" "+Math.round(m.progress*100)+"%"}});
  ocrWorker._lang=lang;
 }
 let im=await createImageBitmap(file),w=Math.min(1800,im.width),h=Math.round(im.height*w/im.width);
 let cvs=document.createElement("canvas");cvs.width=w;cvs.height=h;cvs.getContext("2d").drawImage(im,0,0,w,h);im.close?.();
 const r=await ocrWorker.recognize(cvs);return String(r.data.text||"").trim();
}
async function pdfText(file){
 let lib=await import("./pdf.mjs");lib.GlobalWorkerOptions.workerSrc="./pdf.worker.mjs";
 let doc=await lib.getDocument({data:await file.arrayBuffer()}).promise,parts=[];
 for(let i=1;i<=Math.min(15,doc.numPages);i++){
  let pg=await doc.getPage(i),tc=await pg.getTextContent();
  let text=tc.items.map(x=>x.str||"").join(" ").trim();
  if(text.length>25){parts.push(text);continue}
  const scale=Math.min(2,1500/pg.getViewport({scale:1}).width);
  let vp=pg.getViewport({scale}),canvas=document.createElement("canvas");canvas.width=vp.width;canvas.height=vp.height;
  await pg.render({canvasContext:canvas.getContext("2d"),viewport:vp}).promise;
  const blob=await new Promise(r=>canvas.toBlob(r,"image/png"));
  if(blob)parts.push(await ocrPhoto(new File([blob],"page"+i+".png",{type:"image/png"})));
 }
 await doc.destroy();return parts.join("\n\n").slice(0,50000);
}
async function doRead(){
 const files=currentFiles();if(!files.length){notice(t("noText"));return}
 if(files.length>12||files.some(f=>f.size>12*1024*1024)){notice(t("uploadLimit"));return}
 let b=$("#plusExtract"),originForm=$("#plusLessonForm");if(!b)return;b.disabled=true;
 let parts=[],fails=0;$("#plusFileList").textContent=t("ocrPending");
 try{
  for(const f of files){
   try{let part=f.type==="application/pdf"||/\.pdf$/i.test(f.name)?await pdfText(f):await ocrPhoto(f);if(part)parts.push(part);else fails++}catch(e){fails++;console.warn("Cannot read file",f.name,String(e))}
  }
  if(parts.length){
    const extracted=parts.join("\n\n");
    const field=$("#plusText");
    if(field&&$("#plusLessonForm")===originForm){
      field.value=(field.value+"\n"+extracted).trim();
      notice(t("readDone"));
    }else{
      const previous=data.lesson||{};
      data.lesson={...previous,text:((previous.text||"")+"\n"+extracted).trim().slice(0,30000),result:null};
      save();
      notice("Lesson text saved. Open Explain to continue.");
    }
  }else notice(t("ocrBad")+" "+t("pdfBad"));
  const feedback=$("#plusFileList");
  if(feedback)feedback.textContent=parts.length+" page(s) read"+(fails?", "+fails+" failed":"")+". "+t("share");
 }finally{b.disabled=false}
}
function createICS(ex){
 const esc=s=>String(s||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
 const at=ex.date.replace(/-/g,""),end=addDate(ex.date,1).replace(/-/g,"");
 const text="BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//StudyFlow//Exam Reminder//EN\r\nBEGIN:VEVENT\r\nUID:"+ex.id+"@studyflow.local\r\nDTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")+"\r\nDTSTART;VALUE=DATE:"+at+"\r\nDTEND;VALUE=DATE:"+end+"\r\nSUMMARY:"+esc(ex.subject+" exam")+"\r\nDESCRIPTION:"+esc(ex.topics)+"\r\nBEGIN:VALARM\r\nTRIGGER:-P"+Number(ex.lead||3)+"D\r\nACTION:DISPLAY\r\nDESCRIPTION:"+esc("Review for "+ex.subject)+"\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
 const a=document.createElement("a");const url=URL.createObjectURL(new Blob([text],{type:"text/calendar"}));a.href=url;a.download="studyflow-exam-"+at+".ics";a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function examAlerts(){
 for(const exam of data.exams){
  let diff=daysLeft(exam.date),lead=Number(exam.lead)||3;
  if(diff<0||diff>lead)continue;
  const key=exam.id+":"+nowDate();if(notified.has(key))continue;
  notified.add(key);
  if("Notification" in window&&Notification.permission==="granted"&&document.visibilityState==="visible")new Notification("StudyFlow · "+exam.subject,{body:"Exam in "+diff+" day(s). "+t("review"),tag:key});
 }
}
function inject(){
 let nav=$(".sidebar nav.nav");if(!nav)return;
 for(const [name,symbol] of [["lesson","📚"],["week","📅"],["exams","📝"]]){
  let b=document.createElement("button");b.className="nav-link plus-nav";b.dataset.plusView=name;b.innerHTML="<span>"+symbol+"</span> <span data-plus-label='"+name+"'>"+t(name)+"</span>";nav.appendChild(b);
 }
 let top=$(".top-actions"),select=document.createElement("select");select.id="plusLanguage";select.setAttribute("aria-label",t("settings"));
 select.innerHTML='<option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option><option value="azi">Arabizi</option>';select.value=data.lang;top.insertBefore(select,top.firstChild);
 select.addEventListener("change",()=>{data.lang=select.value;save();document.querySelectorAll("[data-plus-label]").forEach(el=>el.textContent=t(el.dataset.plusLabel));if(active)render();else translateBase()});
 document.addEventListener("click",e=>{
  const b=e.target.closest("[data-plus-view]");if(b){e.stopPropagation();openPlus(b.dataset.plusView);return}
  if(e.target.closest("[data-view]")){active=null;setTimeout(()=>{translateBase();injectSubjectLinks()},0);return}
  const subjectButton=e.target.closest("[data-plus-subject]");if(subjectButton){selectedSubject=subjectButton.dataset.plusSubject;openPlus("lesson");return}
  if(!active)return;
  if(e.target.id==="plusExtract"){doRead();return}
  if(e.target.id==="plusSpeak"){voice();return}
  if(e.target.id==="plusPause"){if(speechSynthesis.paused)speechSynthesis.resume();else speechSynthesis.pause();return}
  if(e.target.id==="plusStop"){speechSynthesis.cancel();reading=false;return}
  if(e.target.id==="plusPermission"){
   if(!("Notification" in window)||!isSecureContext){notice(t("permission"));return}
   Notification.requestPermission().then(p=>notice(p==="granted"?t("permissionGranted"):t("permissionDenied")));return;
  }
  const act=e.target.closest("[data-plus-action]");if(!act)return;
  let type=act.dataset.plusAction,idx=act.dataset.id;
  if(type==="class-del")data.classes=data.classes.filter(x=>x.id!==idx);
  if(type==="item-del")data.items=data.items.filter(x=>x.id!==idx);
  if(type==="exam-del")data.exams=data.exams.filter(x=>x.id!==idx);
  if(type==="ics"){let ex=data.exams.find(x=>x.id===idx);if(ex)createICS(ex);return}
  save();render();
 });
 document.addEventListener("submit",async e=>{
  const f=e.target;if(!active||!f.matches("#plusLessonForm,#plusClassForm,#plusExamForm,.plusTaskForm"))return;
  e.preventDefault();const v=new FormData(f);
  if(f.id==="plusLessonForm"){
   let text=String(v.get("text")||"").trim().slice(0,50000);
   if(!text&&currentFiles().length){
    const submit=f.querySelector('button[type="submit"]');
    if(submit)submit.disabled=true;
    try{await doRead()}finally{if(submit?.isConnected)submit.disabled=false}
    if(!f.isConnected||active!=="lesson")return;
    text=String(f.querySelector('[name="text"]')?.value||"").trim().slice(0,50000);
   }
   if(!text){notice(t("noText"));return}
   const s=String(v.get("subject")||"Other");
   let lesson={subject:s,book:String(v.get("book")||"").slice(0,150),grade:String(v.get("grade")||"").slice(0,40),pages:String(v.get("pages")||"").slice(0,80),mode:v.get("mode"),text:text.slice(0,30000),result:extractGuide(text,s,v.get("book"),v.get("pages"))};
   data.lesson=lesson;save();render();notice(t("lessonSaved"));if(lesson.mode!=="written")voice();
  }
  if(f.id==="plusClassForm"){
   let name=String(v.get("name")||"").trim().slice(0,90);
   if(!name)return;data.classes.push({id:uid(),day:Number(v.get("day")),name,period:Math.max(1,Math.min(15,Number(v.get("period"))||1)),time:String(v.get("time")||"")});save();render();
  }
  if(f.classList.contains("plusTaskForm")){
   let label=String(v.get("label")||"").trim().slice(0,160);if(!label)return;
   data.items.push({id:uid(),day:Number(f.dataset.day),label,doneWeek:""});save();render();
  }
  if(f.id==="plusExamForm"){
   let subject=String(v.get("subject")||"").trim().slice(0,110),date=String(v.get("date")||"");
   if(!subject||!/^\d{4}-\d{2}-\d{2}$/.test(date)){notice(t("atLeast"));return}
   data.exams.push({id:uid(),subject,date,lead:[2,3].includes(Number(v.get("lead")))?Number(v.get("lead")):3,topics:String(v.get("topics")||"").slice(0,1000)});save();render();examAlerts();
  }
 });
 document.addEventListener("change",e=>{
  if(!active)return;
  const id=e.target.dataset.plusCheck;
  if(id){let it=data.items.find(x=>x.id===id);if(it){it.doneWeek=e.target.checked?weekStart():"";save();render()}}
  if(e.target.matches("#plusPhotos,#plusCamera,#plusPDF")){$("#plusFileList").textContent=currentFiles().map(x=>x.name).join(" · ")}
 });
 translateBase();injectSubjectLinks();new MutationObserver(()=>{if(!active)injectSubjectLinks()}).observe($("#main"),{childList:true});examAlerts();setInterval(examAlerts,60000);
}
function injectSubjectLinks(){
 if(!$("#main .subject-grid"))return;
 const legacy=legacySubjects();
 $("#main").querySelectorAll(".subject-foot [data-action=plan-subject]").forEach(b=>{
  const foot=b.parentElement;if(foot.querySelector("[data-plus-subject]"))return;
  const item=legacy.find(x=>x.id===b.dataset.id);if(!item)return;
  const x=document.createElement("button");x.type="button";x.dataset.plusSubject=item.name;x.textContent=t("lesson")+" →";foot.appendChild(x);
 });
}
function translateBase(){
 const dict={
  fr:{"Overview":"Vue d'ensemble","My subjects":"Mes matières","Study planner":"Plan d'études","Flashcards":"Fiches","Practice quiz":"Quiz","Settings & plans":"Réglages","New subject":"Nouvelle matière","Your study planner":"Votre plan d'études","Upcoming exams":"Examens à venir"},
  ar:{"Overview":"الرئيسية","My subjects":"موادي","Study planner":"خطة الدراسة","Flashcards":"بطاقات","Practice quiz":"اختبار","Settings & plans":"الإعدادات","New subject":"مادة جديدة","Your study planner":"خطة الدراسة","Upcoming exams":"امتحانات قادمة"},
  azi:{"Overview":"El ra2isiye","My subjects":"El mawed","Study planner":"Plan el drous","Flashcards":"Flashcards","Practice quiz":"Quiz","Settings & plans":"Settings","New subject":"Madde jdide","Your study planner":"Plan el drous","Upcoming exams":"El exams el jeyin"}
 }[data.lang]||{};
 document.querySelectorAll(".nav-link:not(.plus-nav), .page-heading h1, .panel-header h2, #crumbTitle").forEach(el=>{
  const current=el.dataset.originalText||(el.matches(".nav-link")?({dashboard:"Overview",subjects:"My subjects",planner:"Study planner",flashcards:"Flashcards",quiz:"Practice quiz",settings:"Settings & plans"}[el.dataset.view]||el.textContent.trim()):el.textContent.trim());
  if(!el.dataset.originalText)el.dataset.originalText=current;
  if(el.matches(".nav-link")){
   const label=el.childNodes[el.childNodes.length-1];
   if(label&&label.nodeType===Node.TEXT_NODE)label.textContent=" "+(dict[current]||current);
  }else if(!active)el.textContent=dict[current]||current;
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",inject);else inject();
})();
