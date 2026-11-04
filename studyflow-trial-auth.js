import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.75.0/+esm";

const SUPABASE_URL="https://fwlxyydrxdvfenlfukfd.supabase.co";
const SUPABASE_KEY="sb_publishable_EK9oy2SvD7dJmIolMUDCcw_ru1IZxO8";
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{
 auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}
});
const byId=id=>document.getElementById(id);
const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let studentProfile=null;
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
  redeem.hidden=false;
  trigger.textContent="Student trial login";
  return;
 }
 auth.hidden=true;redeem.hidden=true;target.hidden=false;
 target.innerHTML=`<b>${safe(studentProfile.plan)} — trial active</b>
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
   await refreshProfile();message("Student name saved.");
 });
 byId("sfTrialSignout").addEventListener("click",async()=>{
  await supabase.auth.signOut();
  studentProfile=null;auth.hidden=false;renderProfile();message("Signed out.");
 });
 trigger.textContent=(studentProfile.display_name||"Student")+" · "+studentProfile.plan;
}
async function refreshProfile(){
 const {data:{user},error}=await supabase.auth.getUser();
 if(error&&error.name!=="AuthSessionMissingError")throw error;
 const auth=byId("sfAuthForm");
 if(!user){
  studentProfile=null;auth.hidden=false;renderProfile();return;
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
   const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
   if(error)throw error;
   if(!data?.session){message("Check the email inbox and confirm the signup, then return here to Sign in.");return}
   message("Account created. You may now activate your invitation.");
  }else{
   const {error}=await supabase.auth.signInWithPassword({email,password});
   if(error)throw error;
   message("Signed in.");
  }
  await refreshProfile();
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
 Promise.resolve().then(()=>refreshProfile()).catch(showError);
});
refreshProfile().catch(showError);
window.StudyFlowTrial={open:()=>dlg.showModal(),getProfile:()=>studentProfile};
