"use strict";
(()=>{
 const STORE="studyflow-appearance-v1";
 const THEMES=["calm","joy","night"];
 const names={calm:"Calm",joy:"Joy",night:"Night"};
 function chosen(){try{const v=localStorage.getItem(STORE);return THEMES.includes(v)?v:"calm"}catch{return "calm"}}
 function apply(v){if(!THEMES.includes(v))return;document.documentElement.dataset.studyTheme=v;try{localStorage.setItem(STORE,v)}catch{};document.querySelectorAll("[data-theme-choice]").forEach(b=>{b.setAttribute("aria-pressed",String(b.dataset.themeChoice===v));});}
 apply(chosen());
 function build(){
  if(document.getElementById("studyflow-appearance-trigger"))return;
  const top=document.querySelector(".top-actions");
  if(!top)return;
  const button=document.createElement("button");
  button.id="studyflow-appearance-trigger";button.className="studyflow-appearance-trigger";
  button.type="button";button.textContent="Appearance";button.setAttribute("aria-label","Choose StudyFlow theme");
  top.prepend(button);
  const dialog=document.createElement("dialog");
  dialog.id="studyflow-appearance-dialog";dialog.className="studyflow-theme-dialog";
  dialog.innerHTML='<div class="studyflow-theme-modal"><div class="studyflow-theme-head"><h2>Choose your StudyFlow theme</h2><button type="button" id="studyflow-appearance-close" aria-label="Close theme choices">×</button></div><p>Your choice stays on this device. All themes offer exactly the same learning functions.</p><div class="studyflow-theme-options" role="group" aria-label="Themes"><button type="button" data-theme-choice="calm" aria-pressed="false"><span class="studyflow-theme-swatch swatch-calm">Aa</span><strong>Calm</strong><small>Soft teal and light surfaces</small></button><button type="button" data-theme-choice="joy" aria-pressed="false"><span class="studyflow-theme-swatch swatch-joy">Aa</span><strong>Joy</strong><small>Bright and welcoming</small></button><button type="button" data-theme-choice="night" aria-pressed="false"><span class="studyflow-theme-swatch swatch-night">Aa</span><strong>Night</strong><small>Dark, low-glare study space</small></button></div><div class="studyflow-theme-foot">Theme changes do not affect your saved study data.</div></div>';
  document.body.append(dialog);
  button.addEventListener("click",()=>{apply(chosen());dialog.showModal()});
  dialog.querySelector("#studyflow-appearance-close").addEventListener("click",()=>dialog.close());
  dialog.querySelectorAll("[data-theme-choice]").forEach(b=>b.addEventListener("click",()=>{apply(b.dataset.themeChoice);dialog.close()}));
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
  apply(chosen());
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build,{once:true});else build();
 window.StudyFlowAppearance={apply,chosen};
})();
