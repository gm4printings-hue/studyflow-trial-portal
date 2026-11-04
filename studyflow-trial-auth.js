import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.0/+esm";

const SUPABASE_URL="https://fwlxyydrxdvfenlfukfd.supabase.co";
const SUPABASE_KEY="sb_publishable_EK9oy2SvD7dJmIolMUDCcw_ru1IZxO8";
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{
 auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}
});
const invitation=new URL(location.href).searchParams.get("invite")?.trim().toUpperCase();
const validInvitation=invitation&&/^SF-TRIAL-[A-F0-9]{24}$/.test(invitation)?invitation:null;
const byId=id=>document.getElementById(id);
const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
// Keep referral/tracking parameters out of the address bar without touching auth fragments.
try { const u=new URL(location.href); let changed=false;
 for(const k of [...u.searchParams.keys()]) if(/^utm_/i.test(k)){u.searchParams.delete(k);changed=true}
 if(changed) history.replaceState(history.state,"",u.pathname+u.search+u.hash);
} catch {}
let studentProfile=null;
const welcome=document.createElement("section");
welcome.id="sfWelcome";welcome.hidden=true;welcome.setAttribute("aria-label","Student home");
welcome.innerHTML='<h2 id="sfWelcomeTitle"></h2><p id="sfWelcomeMeta"></p><a class="sf-start-studying" href="./study.html">Start studying</a><p class="sf-welcome-note">Opens your private student workspace. Learning progress is saved under your StudyFlow account.</p>';
document.querySelector(".top-actions")?.insertAdjacentElement("afterend",welcome);
const welcomeStyle=document.createElement("style");
welcomeStyle.textContent='#sfWelcome{background:#f3efff;border:1px solid #ded5fc;padding:18px;margin:16px 0;border-radius:14px;color:#342d58}#sfWelcome[hidden]{display:none}#sfWelcomeTitle{margin:0 0 6px;font-size:22px;color:#583dbb}#sfWelcomeMeta{margin:3px 0 16px}#sfWelcome .sf-start-studying{display:block;background:#6750d7;padding:13px 14px;color:white;text-align:center;text-decoration:none;border-radius:10px;font-weight:800}#sfWelcome .sf-welcome-note{font-size:11px;line-height:1.55;margin:12px 0 0;color:#6e6783}';
document.head.append(welcomeStyle);
function renderWelcome(){
 const name=studentProfile?.display_name?.trim()||"Student";
 welcome.hidden=!studentProfile;
 if(!studentProfile)return;
 byId("sfWelcomeTitle").textContent="Welcome, "+name+"!";
 byId("sfWelcomeMeta").textContent=studentProfile.academic_class+" · "+studentProfile.plan+" trial";
}
const trigger=document.createElement("button");
trigger.type="button";trigger.id="sfTrialButton";trigger.className="sf-trial-entry";
trigger.textContent="Student trial login";
document.querySelector(".top-actions")?.prepend(trigger);

const dlg=document.createElement("dialog");
dlg.id="sfTrialDialog";dlg.setAttribute("aria-label","StudyFlow trial account");
dlg.innerHTML=`
 <div class="sf-auth-head"><strong>StudyFlow student trial</strong><button id="sfAuthClose" type="button" aria-label="Close">✕</button></div>
 <p class="sf-auth-hint">A separate STUDYFLOW account. The student uses their own email and password. No charges during this pilot.</p>
 <form id="sfAuthForm" class="sf-auth-form">
  <label>Email <input type="email" name="email" autocomplete="email" required maxlength="200" placeholder="student or parent email"></label>
  <label>Password <input type="password" name="password" autocomplete="current-password" required minlength="8" maxlength="150"></label>
  <div class="sf-auth-row">
   <button type="submit" name="mode" value="login">Sign in</button>
   <button type="submit" name="mode" value="signup">Create account</button>
  </div>
 </form>
 <div class="sf-auth-divider">After signing in</div>
 <form id="sfRedeemForm" class="sf-auth-form">
  <label>One-time trial code <input name="code" type="text" autocomplete="off" spellcheck="false" maxlength="75" placeholder="SF-BASIC-..." required></label>
  <label>Your school class <input name="schoolClass" type="text" maxlength="60" autocomplete="off" required placeholder="Example: Grade 7"></label>
  <button type="submit">Activate my trial</button>
 </form>
 <section id="sfStudentAccount" class="sf-student-account" hidden></section>
 <p id="sfTrialStatus" class="sf-trial-status" role="status" aria-live="polite"></p>
 <p class="sf-auth-footer">The class is locked after activation. Account and plan are stored in STUDYFLOW; existing lesson and planner data are still local to this browser. AI tutoring and downloadable MP3 are not activated yet. Only use a student/parent email with appropriate consent.</p>
`;
document.body.appendChild(dlg);
if(validInvitation)byId("sfRedeemForm").elements.code.value=validInvitation;
trigger.addEventListener("click",()=>{dlg.showModal();refreshProfile().catch(showError)});
byId("sfAuthClose").addEventListener("click",()=>dlg.close());
dlg.addEventListener("click",ev=>{if(ev.target===dlg)dlg.close()});
const message=(msg,bad=false)=>{const e=byId("sfTrialStatus");if(e){e.textContent=String(msg);e.dataset.bad=bad?"1":"0"}};
function showError(e){
 let msg=String(e?.message||"Could not complete this request.");
 if(/duplicate|already exists/i.test(msg))msg="This email may already be registered. Try Sign in.";
 if(/rate limit/i.test(msg))msg="Too many attempts; please try later.";
 message(msg,true);
}
function renderProfile(){
 const target=byId("sfStudentAccount"),redeem=byId("sfRedeemForm"),auth=byId("sfAuthForm");
 if(!target)return;
 if(!studentProfile){
  target.hidden=true;
  redeem.hidden= !auth.hidden;
  trigger.textContent="Student trial login";
  renderWelcome();
  return;
 }
 auth.hidden=true;redeem.hidden=true;target.hidden=false;
 target.innerHTML=`<b>${safe(studentProfile.plan)} — trial active</b>
 <p><a class="sf-start-studying" href="./study.html">Start studying</a></p>
 <div>Student: <strong>${safe(studentProfile.display_name||"Name not added")}</strong></div>
 <div>Class: ${safe(studentProfile.academic_class)}</div>
 <label>Student display name (first name or nickname) <input id="sfStudentName" type="text" maxlength="40" autocomplete="nickname" placeholder="First name or nickname" value="${safe(studentProfile.display_name||"")}"></label>
 <button type="button" id="sfSaveStudentName">Save student name</button>
 <div>Starting allocation: ${Number(studentProfile.initial_credits).toLocaleString("en")} provisional Study Credits</div>
 <div>Spent: ${Number(studentProfile.spent_credits).toLocaleString("en")} credits</div>
 <small>Credit rates are under validation; AI generation is not yet enabled. Lesson files remain on this device.</small>
 <button type="button" id="sfTrialSignout">Sign out</button>`;
 byId("sfSaveStudentName").addEventListener("click",async()=>{
   const value=byId("sfStudentName").value.trim();
   if(value.length<2||value.length>40){message("Enter a first name or nickname (2–40 characters).",true);return}
   const {data:{user}}=await supabase.auth.getUser();
   if(!user){message("Please sign in again.",true);return}
   const {error}=await supabase.from("sf_student_profiles").update({display_name:value}).eq("user_id",user.id);
   if(error){showError(error);return}
   await refreshProfile();
   message("Student name saved.");
   if(dlg.open)dlg.close();
   window.scrollTo({top:0,behavior:"smooth"});
 });
 byId("sfTrialSignout").addEventListener("click",async()=>{
  await supabase.auth.signOut();
  studentProfile=null;auth.hidden=false;renderProfile();message("Signed out.");
 });
 trigger.textContent=(studentProfile.display_name||"Student")+" · "+studentProfile.plan;
 renderWelcome();
}
async function refreshProfile(){
 const {data:{user},error}=await supabase.auth.getUser();
 if(error&&error.name!=="AuthSessionMissingError")throw error;
 const auth=byId("sfAuthForm");
 if(!user){
  studentProfile=null;auth.hidden=false;renderProfile();message("Sign in with your own email and password, or choose Create account.");return;
 }
 auth.hidden=true;
 const {data,error:readError}=await supabase.from("sf_student_profiles")
  .select("plan,academic_class,academic_year,initial_credits,spent_credits,theme,display_name").eq("user_id",user.id).maybeSingle();
 if(readError)throw readError;
 studentProfile=data;
 renderProfile();
 if(!data)message("Signed in. Enter your one-time invitation code and school class.");
 else message("Your STUDYFLOW trial is active. No payment required.");
}
byId("sfAuthForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const form=e.currentTarget;
 const submitter=e.submitter;
 const mode=submitter?.value||"login";
 const email=form.elements.email.value.trim();
 const password=form.elements.password.value;
 if(!email||password.length<8){message("Enter a valid email and password of 8+ characters.",true);return}
 for(const btn of form.querySelectorAll("button"))btn.disabled=true;
 try{
  if(mode==="signup"){
   const redirect=new URL(location.pathname,location.origin);
   if(validInvitation)redirect.searchParams.set("invite",validInvitation);
   const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:redirect.href}});
   if(error)throw error;
   if(!data?.session){message("Check the email inbox and confirm the signup, then return here to Sign in.");return}
   message("Account created. You may now activate your invitation.");
  }else{
   const {error}=await supabase.auth.signInWithPassword({email,password});
   if(error)throw error;
   message("Signed in.");
  }
  await refreshProfile();
  if(studentProfile && mode==="login")dlg.close();
 }catch(err){showError(err)}finally{for(const btn of form.querySelectorAll("button"))btn.disabled=false}
});
byId("sfRedeemForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const form=e.currentTarget,button=form.querySelector("button");
 button.disabled=true;
 try{
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)throw Error("Sign in first to activate your trial.");
  const code=form.elements.code.value.trim().toUpperCase();
  const schoolClass=form.elements.schoolClass.value.trim();
  if(schoolClass.length<1||schoolClass.length>60)throw Error("Enter your class (up to 60 characters).");
  const {error}=await supabase.rpc("sf_redeem_trial",{trial_code:code,class_name:schoolClass});
  if(error)throw error;
  form.elements.code.value="";
  await refreshProfile();
 }catch(err){showError(err)}finally{button.disabled=false}
});
supabase.auth.onAuthStateChange((_event,_session)=>{
 // Run after the auth callback releases its session lock.
 setTimeout(()=>refreshProfile().catch(showError),0);
});
refreshProfile().catch(showError);
window.StudyFlowTrial={open:()=>dlg.showModal(),getProfile:()=>studentProfile};
if("serviceWorker" in navigator){navigator.serviceWorker.register("./sw.js").catch(()=>{});}
