"use strict";
(()=>{
  // Presentation only. Real subscription balances will come from a separate
  // authenticated StudyFlow backend. Never infer paid AI hours from demo credits.
  const byId=id=>document.getElementById(id);
  const six=[
    ["Text chat","AI tutor not connected"],
    ["Downloadable MP3","Generation not connected"],
    ["Photos / PDFs","Local reading preview"],
    ["Quizzes","Local practice"],
    ["Flashcards","Local study cards"],
    ["Study planner","Local scheduling"]
  ];
  const formatSeconds=x=>{
    const n=Math.max(0,Math.floor(Number(x)||0));
    return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");
  };
  function status(){
    if(typeof window.StudyFlowDemoStatus==="function")return window.StudyFlowDemoStatus();
    try{
      const s=JSON.parse(window.StudyFlowStudentStore.get("studyflow-local-demo-v1")||"{}");
      return {remaining:window.StudyLogic?.creditsLeft(s.plan,s.usedCredits)||10,
        total:window.StudyLogic?.limits[s.plan]||10,
        focusMinutes:Math.max(0,Number(s.focusMinutes)||0),timerSeconds:1500,timerRunning:false};
    }catch{return {remaining:10,total:10,focusMinutes:0,timerSeconds:1500,timerRunning:false}}
  }
  function shell(){
    const area=document.querySelector(".body-area");
    if(!area||byId("sf-balance-strip"))return;
    const bar=document.createElement("section");
    bar.id="sf-balance-strip";bar.className="sf-balance-strip";
    bar.setAttribute("aria-label","Study balance; local demo only");
    bar.innerHTML='<div class="sf-strip-identity"><span>Study balance</span><strong>DEMO</strong></div>'+
      '<div class="sf-strip-units">'+
      '<div class="sf-strip-unit" title="Focus timer, not paid AI time"><span>Focus</span><b id="sf-bar-timer">25:00</b></div>'+
      '<div class="sf-strip-unit" title="Local note-drafting credits only"><span>Draft credits</span><b id="sf-bar-credits">10/10</b></div>'+
      '<div class="sf-strip-unit sf-ai-unavailable" title="Real paid AI credit accounts are not connected"><span>AI hours</span><b>Not active</b></div>'+
      '</div><button id="sf-balance-details" type="button" aria-label="Open detailed study balance on Home">Details <span aria-hidden="true">›</span></button>';
    const main=byId("main");
    area.insertBefore(bar,main);
    byId("sf-balance-details").addEventListener("click",()=>{
      document.querySelector('.sidebar [data-view="dashboard"]')?.click();
      requestAnimationFrame(()=>byId("sf-balance-home")?.scrollIntoView({block:"start",behavior:"smooth"}));
    });
  }
  function home(){
    const main=byId("main"),hero=main?.querySelector(".hero");
    if(!hero||byId("sf-balance-home"))return;
    const panel=document.createElement("section");
    panel.id="sf-balance-home";panel.className="sf-balance-home";
    panel.setAttribute("aria-label","Detailed study balance");
    panel.innerHTML='<div class="sf-balance-title"><div><p class="sf-balance-kicker">YOUR STUDY BALANCE</p><h2>Time & usage overview</h2></div><span class="sf-demolabel">Local demo — no billing</span></div>'+
      '<div class="sf-balance-overview">'+
      '<div class="sf-balance-figure"><span>Focus session left</span><strong id="sf-home-timer">25:00</strong><small id="sf-home-timer-state">Paused / ready</small></div>'+
      '<div class="sf-balance-figure"><span>Demo drafting credits</span><strong id="sf-home-credits">10 / 10</strong><div class="sf-demo-meter" role="progressbar" aria-label="Remaining local drafting credits" aria-valuemin="0" aria-valuemax="10" aria-valuenow="10"><i id="sf-home-credit-meter" style="width:100%"></i></div></div>'+
      '<div class="sf-balance-figure"><span>Paid AI time balance</span><strong class="sf-pending">Not active</strong><small>Real accounts not yet connected</small></div>'+
      '</div>'+
      '<p class="sf-balance-explainer">The focus timer is for study sessions. Draft credits are local demo usage. Neither represents paid AI hours or subscription credits.</p>'+
      '<div class="sf-balance-subtitle"><h3>Six learning functions</h3><small>Availability now (not paid balances)</small></div>'+
      '<div class="sf-balance-functions">'+six.map(([name,info])=>'<div class="sf-balance-function"><b>'+name+'</b><span>'+info+'</span></div>').join("")+'</div>'+
      '<p class="sf-balance-footer">Future subscriptions: each student will see their secure plan balance, conversion rates and usage history here. Transfers will require confirmation. No conversions or payments are active in this demo.</p>';
    main.insertBefore(panel,hero);
  }
  function refresh(){
    shell();home();
    const s=status(),total=Math.max(1,Number(s.total)||10);
    const remaining=Math.max(0,Math.min(total,Number(s.remaining)||0));
    const focus=formatSeconds(s.timerSeconds);
    const values={"sf-bar-timer":focus,"sf-bar-credits":remaining+"/"+total,
      "sf-home-timer":focus,"sf-home-credits":remaining+" / "+total,
      "sf-home-timer-state":s.timerRunning?"Focus session running":Math.max(0,Number(s.focusMinutes)||0)+" min completed; timer paused"};
    for(const [id,value] of Object.entries(values)){const node=byId(id);if(node&&node.textContent!==value)node.textContent=value}
    const meter=byId("sf-home-credit-meter");
    if(meter)meter.style.width=(100*remaining/total)+"%";
    const track=meter?.parentElement;
    if(track){track.setAttribute("aria-valuemax",String(total));track.setAttribute("aria-valuenow",String(remaining))}
    byId("sf-balance-strip")?.classList.toggle("sf-timer-running",Boolean(s.timerRunning));
  }
  function sticky(){
    const tools=byId("studyflow-mobile-tools");
    const visible=tools&&getComputedStyle(tools).display!=="none";
    document.documentElement.style.setProperty("--sf-tools-offset",visible?Math.ceil(tools.getBoundingClientRect().height)+"px":"0px");
  }
  function boot(){
    shell();home();refresh();sticky();
    const main=byId("main"),tools=byId("studyflow-mobile-tools");
    if(main)new MutationObserver(()=>{home();refresh()}).observe(main,{childList:true});
    if(tools){
      new ResizeObserver(()=>sticky()).observe(tools);
      new MutationObserver(sticky).observe(tools,{childList:true});
    }
    document.addEventListener("studyflow:demo-updated",refresh);
    window.addEventListener("storage",refresh);
    window.addEventListener("resize",sticky);
    window.StudyFlowBalance={refresh};
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();