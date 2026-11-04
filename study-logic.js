(function(root,factory){
 if(typeof module==="object"&&module.exports){module.exports=factory();}
 else{root.StudyLogic=factory();}
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const limits={Free:10,Student:100,Pro:300};
 const pad=n=>String(n).padStart(2,"0");
 function localDate(d=new Date()){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
 function addDays(s,n){const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return localDate(d);}
 function daysBetween(a,b){const x=Date.parse(a+"T12:00:00"),y=Date.parse(b+"T12:00:00");return Math.round((y-x)/86400000);}
 function topicsOf(text){return String(text||"").split(/\r?\n|;/).map(x=>x.replace(/^[\s\-•\d.)]+/,"").trim()).filter(x=>x.length>=3).slice(0,60);}
 function schedule(subject,today=localDate()){
  const topics=topicsOf(subject.topics);
  const remaining=Math.max(1,daysBetween(today,subject.examDate||addDays(today,14)));
  const studyDays=Math.max(1,remaining-1);
  const tasks=[];
  topics.forEach((topic,i)=>{
   const when=Math.min(studyDays-1,Math.floor(i*studyDays/Math.max(1,topics.length)));
   const dueDate=addDays(today,when);
   tasks.push({subjectId:subject.id,title:"Study: "+topic,dueDate,minutes:25,kind:"Learn",done:false});
   if(remaining>=6 && (i%2===0)){
    tasks.push({subjectId:subject.id,title:"Review: "+topic,dueDate:addDays(today,Math.min(studyDays,when+2)),minutes:15,kind:"Review",done:false});
   }
  });
  if(topics.length)tasks.push({subjectId:subject.id,title:"Practice test — "+subject.name,
   dueDate:addDays(today,Math.max(0,remaining-2)),minutes:30,kind:"Practice",done:false});
  return tasks;
 }
 function draftCards(text,subjectId,max=12){
  const clean=String(text||"").replace(/[ \t]+/g," ").replace(/\r/g,"\n");
  const lines=clean.split(/\n+|(?<=[.!?])\s+(?=[A-Z])/).map(x=>x.trim()).filter(x=>x.length>22&&x.length<420);
  const result=[],seen=new Set();
  for(const line of lines){
   let term="",def="";
   let m=line.match(/^([\p{L}][\p{L}\p{N} \-/()]{2,56})\s*[:：–—]\s*(.{18,280})$/u);
   if(m){term=m[1].trim();def=m[2].trim();}
   else{
    m=line.match(/^([\p{L}][\p{L}\p{N} \-/()]{2,55}?)\s+(?:is|are|means|refers to|describes|est|sont|signifie)\s+(.{16,270})$/iu);
    if(m){term=m[1].trim();def=m[0].trim();}
   }
   if(!term||!def||seen.has(term.toLowerCase()))continue;
   seen.add(term.toLowerCase());
   result.push({subjectId,front:"Explain: "+term.replace(/[.]+$/,""),back:def.replace(/\s+/g," "),source:"Local notes draft"});
   if(result.length>=max)break;
  }
  return result;
 }
 function quizQuestions(cards,limit=10){
  const clean=cards.filter(c=>String(c.front||"").trim()&&String(c.back||"").trim());
  return clean.slice(0,limit).map((c,i)=>{
   const distractors=clean.filter(x=>x.id!==c.id&&x.back!==c.back).slice(0,5).map(x=>x.back);
   const options=[c.back,...distractors.slice(0,3)];
   // deterministic rotation so answers aren't all first; no artificial AI cost.
   if(options.length>1){const steps=i%options.length;for(let n=0;n<steps;n++)options.push(options.shift());}
   return {front:c.front,correct:c.back,options};
  });
 }
 function creditsLeft(plan,used){return Math.max(0,(limits[plan]||limits.Free)-Math.max(0,used||0));}
 return {limits,localDate,addDays,daysBetween,topicsOf,schedule,draftCards,quizQuestions,creditsLeft};
});
