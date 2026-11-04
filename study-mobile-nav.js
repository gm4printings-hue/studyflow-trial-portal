"use strict";
(()=>{
 const views=[
 {id:"dashboard",icon:"⌂",en:"Home",fr:"Accueil",ar:"الرئيسية",azi:"Home"},
 {id:"subjects",icon:"▤",en:"Subjects",fr:"Matières",ar:"المواد",azi:"Mawed"},
 {id:"lesson",icon:"📖",en:"Explain",fr:"Expliquer",ar:"شرح درس",azi:"Chare7"},
 {id:"week",icon:"▦",en:"Schedule",fr:"Horaire",ar:"الجدول",azi:"Programme"},
 {id:"exams",icon:"◷",en:"Exams",fr:"Examens",ar:"امتحانات",azi:"Exams"},
 {id:"planner",icon:"✓",en:"Planner",fr:"Planning",ar:"خطة",azi:"Planner"},
 {id:"flashcards",icon:"▣",en:"Cards",fr:"Fiches",ar:"بطاقات",azi:"Cards"},
 {id:"quiz",icon:"◎",en:"Quiz",fr:"Quiz",ar:"اختبار",azi:"Quiz"},
 {id:"settings",icon:"⚙",en:"Settings",fr:"Réglages",ar:"إعدادات",azi:"Settings"}
 ];
 const plus=new Set(["lesson","week","exams"]);
 const base=new Set(views.map(v=>v.id).filter(id=>!plus.has(id)));
 let current="dashboard";
 let expanded=true;
 const t=(obj,language)=>obj[language]||obj.en;
 function lang(){return document.querySelector("#plusLanguage")?.value||"en"}
 function build(){
  const main=document.querySelector("#main"),parent=main?.parentElement;
  if(!main||!parent||document.querySelector("#studyflow-mobile-tools"))return;
  const nav=document.createElement("nav");
  nav.id="studyflow-mobile-tools";nav.className="studyflow-mobile-tools";nav.setAttribute("aria-label","StudyFlow all tools");
  parent.insertBefore(nav,main);
  nav.addEventListener("click",e=>{
   const toggle=e.target.closest("#studyflow-tools-toggle");
   if(toggle){expanded=!expanded;draw();return}
   const btn=e.target.closest("[data-mobile-destination]");
   if(!btn)return;
   const dest=btn.dataset.mobileDestination;
   const original=plus.has(dest)?document.querySelector('.sidebar [data-plus-view="'+dest+'"]'):document.querySelector('.sidebar [data-view="'+dest+'"]');
   if(!original){console.warn("StudyFlow navigation not found",dest);return}
   current=dest;expanded=false;
   original.click();
   draw();
  });
  document.addEventListener("click",e=>{
   const node=e.target.closest("[data-plus-view],[data-view],[data-plus-subject]");
   if(!node||node.closest("#studyflow-mobile-tools"))return;
   if(node.dataset.plusView&&plus.has(node.dataset.plusView))current=node.dataset.plusView;
   else if(node.dataset.plusSubject)current="lesson";
   else if(node.dataset.view&&base.has(node.dataset.view))current=node.dataset.view;
   window.requestAnimationFrame(draw);
  },true);
  document.querySelector("#plusLanguage")?.addEventListener("change",()=>window.requestAnimationFrame(draw));
  draw();
 }
 function draw(){
  const nav=document.querySelector("#studyflow-mobile-tools");if(!nav)return;
  const lng=lang(),label={en:"All 9 study tools",fr:"9 outils d'étude",ar:"كل أدوات الدراسة",azi:"Kel tools el drous"};
  const hide={en:"Hide",fr:"Masquer",ar:"إخفاء",azi:"Hide"};
  const show={en:"Show tools",fr:"Afficher",ar:"إظهار",azi:"Show tools"};
  nav.setAttribute("dir",lng==="ar"?"rtl":"ltr");
  nav.innerHTML='<div class="studyflow-tools-heading"><b>✦ '+t(label,lng)+'</b><button type="button" id="studyflow-tools-toggle" aria-expanded="'+expanded+'">'+(expanded?t(hide,lng)+' ⌃':t(show,lng)+' ⌄')+'</button></div>'+
  (expanded?'<div class="studyflow-tools-grid">'+views.map(v=>'<button type="button" class="studyflow-tool-item '+(current===v.id?"is-current":"")+'" data-mobile-destination="'+v.id+'" aria-label="'+t(v,lng)+'" aria-current="'+(current===v.id?"page":"false")+'"><span class="studyflow-tool-icon">'+v.icon+'</span><span class="studyflow-tool-text">'+t(v,lng)+'</span></button>').join("")+'</div>':"");
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();
