import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.0/+esm";

const PROJECT_URL="https://fwlxyydrxdvfenlfukfd.supabase.co";
const PUBLIC_KEY="sb_publishable_EK9oy2SvD7dJmIolMUDCcw_ru1IZxO8";
const supabase=createClient(PROJECT_URL,PUBLIC_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const gate=document.getElementById("sfStudyGate");
const app=document.getElementById("sfPrivateApp");
const home="./";
const allowed=new Map([["studyflow-local-demo-v1","workspace"],["studyflow-plus-v1","lesson_tools"]]);
const cacheKey=(uid,key)=>"sf_private_v1:"+uid+":"+key;
const timeout=(ms)=>new Promise((_,rej)=>setTimeout(()=>rej(new Error("Connection timed out. Please retry.")),ms));
async function limited(work){return await Promise.race([work,timeout(18000)])}
const escapeText=(e)=>String(e?.message||e||"Please try again.");
function refuse(reason){
  if(app)app.hidden=true;
  gate.hidden=false;
  gate.textContent="";
  const title=document.createElement("h2");
  title.textContent="StudyFlow student login required";
  const desc=document.createElement("p");desc.textContent=reason;
  const link=document.createElement("a");link.href=home;link.textContent="Go to student login";
  gate.append(title,desc,link);
}
const loadScript=src=>new Promise((resolve,reject)=>{
  const script=document.createElement("script");script.src=src;script.async=false;
  script.onload=resolve;script.onerror=()=>reject(new Error("Could not load "+src));
  document.body.appendChild(script);
});
async function start(){
  const {data:{user},error:authError}=await limited(supabase.auth.getUser());
  if(authError||!user)return refuse("Sign in with your own StudyFlow student account before starting lessons.");
  const {data:profile,error:profileError}=await limited(supabase.from("sf_student_profiles")
    .select("plan,academic_class,display_name,initial_credits,spent_credits").eq("user_id",user.id).maybeSingle());
  if(profileError)throw profileError;
  if(!profile)return refuse("This login has no student trial assigned. Activate a student invitation first.");
  gate.textContent="Opening "+(profile.display_name||"your")+" private workspace…";
  const {data:snapshots,error:syncError}=await limited(supabase.from("sf_student_snapshots")
    .select("namespace,content").eq("user_id",user.id));
  if(syncError)throw syncError;

  const uid=user.id;
  const persisted=new Map();
  for(const snap of snapshots||[]){
    if(!["workspace","lesson_tools"].includes(snap.namespace))continue;
    if(snap.content?.state&&typeof snap.content.state==="object"){
      const raw=JSON.stringify(snap.content.state);
      const key=[...allowed].find(([,value])=>value===snap.namespace)?.[0];
      if(key){localStorage.setItem(cacheKey(uid,key),raw);persisted.set(key,raw)}
    }
  }

  const pending=new Map(),timers=new Map(),saving=new Map();
  async function sync(key){
    if(!pending.has(key))return;
    const raw=pending.get(key);pending.delete(key);
    const ns=allowed.get(key);
    if(!ns)return;
    try{
      const parsed=JSON.parse(raw);
      const {error}=await supabase.from("sf_student_snapshots").upsert(
        {user_id:uid,namespace:ns,content:{state:parsed},updated_at:new Date().toISOString()},
        {onConflict:"user_id,namespace"}
      );
      if(error)throw error;
      const label=document.querySelector("#sfPrivateSaveStatus");
      if(label){label.textContent="Saved";label.title="Workspace saved to this student account"}
    }catch(error){
      if(!pending.has(key))pending.set(key,raw);
      const label=document.querySelector("#sfPrivateSaveStatus");
      if(label){label.textContent="Saved on this device only";label.title=escapeText(error)}
      console.warn("StudyFlow per-student cloud sync needs retry:",escapeText(error));
    }
  }
  function queue(key){
    const previous=timers.get(key);if(previous)clearTimeout(previous);
    const t=setTimeout(async()=>{
      timers.delete(key);
      const ongoing=saving.get(key);
      if(ongoing)await ongoing;
      const work=sync(key);saving.set(key,work);
      try{await work}finally{if(saving.get(key)===work)saving.delete(key)}
      if(pending.has(key))queue(key);
    },850);
    timers.set(key,t);
  }
  async function flush(){
    for(const t of timers.values())clearTimeout(t);
    timers.clear();
    await Promise.all([...allowed.keys()].map(async key=>{
      if(saving.has(key))await saving.get(key);
      if(pending.has(key))await sync(key);
    }));
  }
  window.StudyFlowStudentStore=Object.freeze({
    userId:uid,
    get(key){if(!allowed.has(key))throw new Error("Study storage key not allowed");return localStorage.getItem(cacheKey(uid,key))},
    set(key,raw){if(!allowed.has(key))throw new Error("Study storage key not allowed");
      const data=String(raw);
      if(data.length>750000)throw new Error("Study data is too large to synchronize.");
      localStorage.setItem(cacheKey(uid,key),data);pending.set(key,data);
      const label=document.querySelector("#sfPrivateSaveStatus");
      if(label)label.textContent="Saving…";
      queue(key);
    },
    flush
  });
  const displayName=profile.display_name?.trim()||"Student";
  document.getElementById("sfPrivateStudentName").textContent=displayName;
  document.getElementById("sfPrivateStudentClass").textContent=profile.academic_class+" · "+profile.plan;
  const header=document.querySelector(".crumb");
  if(header){const b=document.createElement("strong");b.id="sfPrivateIdentity";b.textContent="Welcome, "+displayName+"! · "+profile.academic_class;header.append(b)}
  const online=document.createElement("span");online.id="sfPrivateSaveStatus";online.textContent="Cloud connected";
  online.style.cssText="font-size:11px;color:#347f70;margin-right:8px";
  document.querySelector(".top-actions")?.prepend(online);
  const logOut=document.getElementById("sfPrivateSignout");
  if(logOut)logOut.addEventListener("click",async()=>{
    logOut.disabled=true;
    await flush();
    const {error}=await supabase.auth.signOut();
    if(error){alert("Could not sign out: "+escapeText(error));logOut.disabled=false;return}
    location.replace(home);
  });
  window.addEventListener("online",()=>{for(const key of pending.keys())queue(key)});
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible"){for(const key of pending.keys())queue(key)}
    else flush().catch(()=>{});
  });
  const scripts=["study-logic.js","study-app.js","study-plus.js","study-mobile-nav.js","study-themes.js","study-balance.js"];
  for(const src of scripts)await loadScript("./"+src);
  gate.hidden=true;app.hidden=false;
  document.title=displayName+" · StudyFlow";
}
start().catch(error=>refuse("Could not safely load your private data: "+escapeText(error)));
