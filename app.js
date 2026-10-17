(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE_KEY = "gymbro_test_v1";
  const equipmentLabels = {dumbbell:"Manubri",barbell:"Bilanciere",machine:"Macchinari",cable:"Cavi",bodyweight:"Corpo libero",band:"Elastici"};
  const exercises = [
    {id:"bench",name:"Panca piana con bilanciere",muscle:"Petto",secondary:"Tricipiti, spalle",equipment:"barbell",level:"Intermedio",sets:3,reps:10,rest:90,unilateral:false},
    {id:"incline-db",name:"Panca inclinata con manubri",muscle:"Petto",secondary:"Spalle, tricipiti",equipment:"dumbbell",level:"Principiante",sets:3,reps:10,rest:90,unilateral:false},
    {id:"pushup",name:"Piegamenti sulle braccia",muscle:"Petto",secondary:"Tricipiti, core",equipment:"bodyweight",level:"Principiante",sets:3,reps:12,rest:60,unilateral:false},
    {id:"lat-pulldown",name:"Lat machine",muscle:"Schiena",secondary:"Bicipiti",equipment:"machine",level:"Principiante",sets:3,reps:10,rest:90,unilateral:false},
    {id:"row-db",name:"Rematore con manubrio",muscle:"Schiena",secondary:"Bicipiti",equipment:"dumbbell",level:"Intermedio",sets:3,reps:10,rest:75,unilateral:true},
    {id:"deadlift",name:"Stacco da terra",muscle:"Schiena",secondary:"Glutei, femorali",equipment:"barbell",level:"Avanzato",sets:3,reps:6,rest:150,unilateral:false},
    {id:"shoulder-press",name:"Shoulder press",muscle:"Spalle",secondary:"Tricipiti",equipment:"dumbbell",level:"Intermedio",sets:3,reps:10,rest:90,unilateral:false},
    {id:"lateral-raise",name:"Alzate laterali",muscle:"Spalle",secondary:"",equipment:"dumbbell",level:"Principiante",sets:3,reps:12,rest:60,unilateral:false},
    {id:"curl",name:"Curl per bicipiti",muscle:"Bicipiti",secondary:"",equipment:"dumbbell",level:"Principiante",sets:3,reps:12,rest:60,unilateral:false},
    {id:"hammer",name:"Curl a martello alternato",muscle:"Bicipiti",secondary:"Avambracci",equipment:"dumbbell",level:"Principiante",sets:3,reps:10,rest:60,unilateral:true},
    {id:"pushdown",name:"Push-down ai cavi",muscle:"Tricipiti",secondary:"",equipment:"cable",level:"Principiante",sets:3,reps:12,rest:60,unilateral:false},
    {id:"squat",name:"Squat con bilanciere",muscle:"Gambe",secondary:"Glutei, core",equipment:"barbell",level:"Intermedio",sets:4,reps:8,rest:150,unilateral:false},
    {id:"leg-press",name:"Leg press",muscle:"Gambe",secondary:"Glutei",equipment:"machine",level:"Principiante",sets:3,reps:12,rest:90,unilateral:false},
    {id:"lunge",name:"Affondi alternati",muscle:"Gambe",secondary:"Glutei",equipment:"bodyweight",level:"Principiante",sets:3,reps:10,rest:75,unilateral:true},
    {id:"leg-curl",name:"Leg curl",muscle:"Gambe",secondary:"Femorali",equipment:"machine",level:"Principiante",sets:3,reps:12,rest:75,unilateral:false},
    {id:"calf",name:"Calf raise",muscle:"Gambe",secondary:"Polpacci",equipment:"dumbbell",level:"Principiante",sets:3,reps:15,rest:60,unilateral:false},
    {id:"plank",name:"Plank",muscle:"Addome",secondary:"Core",equipment:"bodyweight",level:"Principiante",sets:3,reps:30,rest:45,unilateral:false,isTime:true},
    {id:"crunch",name:"Crunch",muscle:"Addome",secondary:"",equipment:"bodyweight",level:"Principiante",sets:3,reps:15,rest:45,unilateral:false},
    {id:"cable-crunch",name:"Crunch ai cavi",muscle:"Addome",secondary:"",equipment:"cable",level:"Intermedio",sets:3,reps:12,rest:60,unilateral:false},
    {id:"band-pull",name:"Aperture con elastico",muscle:"Spalle",secondary:"Schiena",equipment:"band",level:"Principiante",sets:3,reps:15,rest:45,unilateral:false}
  ];
  const freshState = () => ({
    profile:{name:"",goal:"hypertrophy",level:"beginner",days:4,equipment:["dumbbell","barbell","machine","cable","bodyweight"]},
    plans:[],history:[],session:null
  });
  let state = loadState();
  let sessionInterval = null, restInterval = null, toastTimeout = null;
  let editingPlanId = null, editorExerciseIds = [];
  function loadState(){
    try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); return saved && saved.profile && saved.plans ? {...freshState(),...saved} : freshState(); }
    catch { return freshState(); }
  }
  function persist(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e){ console.error(e); showToast("Impossibile salvare i dati sul dispositivo."); } }
  function showToast(message){ const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toastTimeout); toastTimeout=setTimeout(()=>el.classList.remove("show"),2500); }
  function go(viewId){
    $$(".view").forEach(v=>v.classList.toggle("active",v.id===viewId));
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===viewId));
    if(viewId==="homeView") renderHome();
    if(viewId==="plansView") renderPlans();
    if(viewId==="libraryView") renderLibrary();
    if(viewId==="historyView") renderHistory();
    if(viewId==="setupView") fillProfile();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function goalLabel(goal){ return ({hypertrophy:"Ipertrofia",strength:"Forza",endurance:"Resistenza",general:"Fitness generale"})[goal]||"Ipertrofia"; }
  function exById(id){return exercises.find(e=>e.id===id);}
  function createPlanObject(name,goal,ids){
    return {id:crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random(),name:name.trim(),goal,createdAt:Date.now(),exercises:ids.map(id=>{const e=exById(id);return {...e,weight:0,sets:e.sets,reps:e.reps,rest:e.rest,circuit:false,unilateral:e.unilateral};})};
  }
  function availableExercises(){const selected=state.profile.equipment||[];return exercises.filter(e=>selected.includes(e.equipment));}
  function renderHome(){
    $("#planCount").textContent=`${state.plans.length} ${state.plans.length===1?"scheda":"schede"}`;
    $("#statWorkouts").textContent=state.history.length;
    const total=state.history.reduce((sum,h)=>sum+(h.volume||0),0);
    $("#statVolume").innerHTML=`${Math.round(total).toLocaleString("it-IT")} <i>kg</i>`;
    const container=$("#homePlans");
    if(!state.plans.length){container.innerHTML='<div class="empty"><strong>La prima scheda ti aspetta.</strong>Crea una scheda personalizzata o genera una base in pochi tocchi.<br><br><button class="primary compact" data-action="generate">Genera scheda</button></div>';return;}
    container.innerHTML=state.plans.slice(0,3).map(p=>planCardHTML(p)).join("");
  }
  function planCardHTML(p){
    const count=p.exercises.length;
    return `<article class="plan-card"><div class="card-head"><div><p class="card-title">${escapeHTML(p.name)}</p><div class="muted">${goalLabel(p.goal)} · ${count} esercizi</div></div><span class="tag">${count?`${p.exercises.reduce((n,e)=>n+Number(e.sets||0),0)} serie`:"Vuota"}</span></div><div class="card-actions"><button class="primary compact" data-action="start" data-id="${p.id}">Apri allenamento ↗</button><button class="secondary" data-action="edit" data-id="${p.id}">Modifica</button><button class="secondary" data-action="duplicate" data-id="${p.id}">Duplica</button><button class="secondary" data-action="delete" data-id="${p.id}">Elimina</button></div></article>`;
  }
  function renderPlans(){
    $("#plansList").innerHTML=state.plans.length?state.plans.map(planCardHTML).join(""):'<div class="empty"><strong>Ancora nessuna scheda</strong>Crea la tua prima scheda o genera una base in base ai tuoi obiettivi.</div>';
  }
  function renderLibrary(){
    const q=($("#exerciseSearch").value||"").toLowerCase().trim(), muscle=$("#muscleFilter").value, equipment=$("#equipmentFilter").value;
    const items=availableExercises().filter(e=>(!q||`${e.name} ${e.muscle} ${e.secondary}`.toLowerCase().includes(q))&&(!muscle||e.muscle===muscle)&&(!equipment||e.equipment===equipment));
    $("#libraryList").innerHTML=items.length?items.map(e=>`<article class="exercise-card"><div class="card-head"><div><div class="muscle">${e.muscle}</div><p class="card-title" style="margin-top:6px">${escapeHTML(e.name)}</p><div class="muted">Secondari: ${escapeHTML(e.secondary||"—")} · ${equipmentLabels[e.equipment]}</div></div><span class="tag">${e.level}</span></div><div class="tag-row"><span class="tag">${e.sets} serie × ${e.reps} ${e.isTime?"sec":"rip."}</span><span class="tag">Recupero ${e.rest}s</span></div><div class="card-actions"><button class="secondary" data-action="exercise-info" data-id="${e.id}">Dettagli</button><button class="primary compact" data-action="add-to-plan" data-id="${e.id}">Aggiungi a scheda</button></div></article>`).join(""):'<div class="empty"><strong>Nessun esercizio trovato</strong>Prova a cambiare i filtri o seleziona più attrezzatura nel profilo.</div>';
  }
  function renderHistory(){
    const root=$("#historyList");
    if(!state.history.length){root.innerHTML='<div class="empty"><strong>Ogni progresso inizia da una serie.</strong>Completa il primo allenamento per vedere qui il riepilogo.</div>';return;}
    root.innerHTML=state.history.slice().reverse().map(h=>`<article class="history-card"><div class="card-head"><div><p class="card-title">${escapeHTML(h.planName)}</p><div class="muted">${new Date(h.endedAt).toLocaleString("it-IT",{dateStyle:"medium",timeStyle:"short"})} · ${h.status==="completed"?"Completato":"Interrotto"}</div></div><span class="tag">${formatTime(h.duration)}</span></div><div class="tag-row"><span class="tag">${Math.round(h.volume)} kg volume</span><span class="tag">${h.exercisesCompleted} esercizi</span><span class="tag">${h.reps} ripetizioni</span><span class="tag">${h.setsCompleted} serie</span></div><div class="card-actions"><button class="secondary" data-action="share-history" data-id="${h.id}">Condividi riepilogo</button></div></article>`).join("");
  }
  function fillProfile(){
    const f=$("#profileForm");f.elements.name.value=state.profile.name||"";f.elements.goal.value=state.profile.goal||"hypertrophy";f.elements.level.value=state.profile.level||"beginner";f.elements.days.value=String(state.profile.days||4);
    $$('input[name="equipment"]',f).forEach(i=>i.checked=(state.profile.equipment||[]).includes(i.value));
  }
  function saveProfile(ev){
    ev.preventDefault();const f=$("#profileForm");
    state.profile={name:f.elements.name.value.trim(),goal:f.elements.goal.value,level:f.elements.level.value,days:Number(f.elements.days.value),equipment:$$('input[name="equipment"]:checked',f).map(i=>i.value)};
    persist();showToast("Profilo salvato.");go("homeView");
  }
  function openPlanEditor(plan=null){
    editingPlanId=plan?.id||null;editorExerciseIds=plan?plan.exercises.map(e=>e.id):[];
    $("#editorTitle").textContent=plan?"Modifica scheda":"Nuova scheda";
    $("#planName").value=plan?.name||"";$("#planGoal").value=plan?.goal||state.profile.goal||"hypertrophy";
    $("#planEditor").hidden=false;renderEditorExercises();$("#planName").focus();
  }
  function renderEditorExercises(){
    const root=$("#editorExercises");
    root.innerHTML=editorExerciseIds.length?editorExerciseIds.map((id,i)=>{const e=exById(id);return `<div class="exercise-card"><div class="card-head"><div><p class="card-title">${escapeHTML(e?.name||"Esercizio")}</p><div class="muted">${e?.muscle||""}</div></div><div class="card-actions"><button class="secondary" data-action="move-editor-up" data-index="${i}" ${i===0?"disabled":""}>↑</button><button class="secondary" data-action="move-editor-down" data-index="${i}" ${i===editorExerciseIds.length-1?"disabled":""}>↓</button><button class="secondary" data-action="remove-editor-exercise" data-index="${i}">Rimuovi</button></div></div></div>`}).join(""):'<div class="empty">Nessun esercizio. Premi “Aggiungi”.</div>';
  }
  function addExerciseToEditor(id){
    if(!editorExerciseIds.includes(id)){editorExerciseIds.push(id);renderEditorExercises();showToast("Esercizio aggiunto.");}
    else showToast("Questo esercizio è già nella scheda.");
  }
  function savePlan(){
    const name=$("#planName").value.trim();if(!name){showToast("Dai un nome alla scheda.");$("#planName").focus();return;}
    if(!editorExerciseIds.length){showToast("Aggiungi almeno un esercizio.");return;}
    if(editingPlanId){
      const old=state.plans.find(p=>p.id===editingPlanId);if(!old)return;
      const oldById=new Map(old.exercises.map(e=>[e.id,e]));
      old.name=name;old.goal=$("#planGoal").value;
      old.exercises=editorExerciseIds.map(id=>oldById.get(id)||{...exById(id),weight:0,circuit:false,unilateral:exById(id).unilateral});
    } else state.plans.push(createPlanObject(name,$("#planGoal").value,editorExerciseIds));
    persist();$("#planEditor").hidden=true;renderPlans();renderHome();showToast("Scheda salvata.");
  }
  function generatePlan(){
    const list=availableExercises();if(!list.length){showToast("Seleziona prima l'attrezzatura nel profilo.");go("setupView");return;}
    const goal=state.profile.goal||"hypertrophy";
    const preferred=goal==="strength"?list.filter(e=>["Squat con bilanciere","Panca piana con bilanciere","Stacco da terra","Rematore con manubrio","Shoulder press"].includes(e.name)):list;
    const chosen=[], muscles=new Set();
    for(const e of preferred){if(!muscles.has(e.muscle)){chosen.push(e.id);muscles.add(e.muscle);}if(chosen.length>=Math.min(6,Math.max(4,Number(state.profile.days)+1)))break;}
    for(const e of preferred){if(chosen.length>=6)break;if(!chosen.includes(e.id))chosen.push(e.id);}
    const p=createPlanObject(`${goalLabel(goal)} — Full body`,goal,chosen);
    state.plans.push(p);persist();renderPlans();renderHome();showToast("Scheda generata: puoi modificarla prima dell'allenamento.");
  }
  function startSession(planId){
    const plan=state.plans.find(p=>p.id===planId);if(!plan){showToast("Scheda non trovata.");return;}
    if(!plan.exercises.length){showToast("Aggiungi almeno un esercizio alla scheda.");return;}
    state.session={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),planId:plan.id,planName:plan.name,startedAt:Date.now(),elapsedSeconds:0,exercises:plan.exercises.map(e=>({...e,setsLog:Array.from({length:Number(e.sets)||1},()=>({done:false,weight:Number(e.weight)||0,reps:Number(e.reps)||1}))})),rest:null,restEndsAt:null,restExerciseId:null,status:"active"};
    persist();renderSession();go("sessionView");startSessionClock();showToast("Allenamento iniziato. Si spinge!");
  }
  function startSessionClock(){
    clearInterval(sessionInterval);sessionInterval=setInterval(()=>{if(!state.session)return;state.session.elapsedSeconds=Math.floor((Date.now()-state.session.startedAt)/1000);$("#elapsed").textContent=formatTime(state.session.elapsedSeconds);},1000);
    if(state.session)$("#elapsed").textContent=formatTime(Math.floor((Date.now()-state.session.startedAt)/1000));
  }
  function renderSession(){
    const s=state.session;if(!s)return;
    $("#sessionTitle").textContent=s.planName;$("#sessionPlanLabel").textContent="SESSIONE ATTIVA";
    $("#sessionMeta").textContent=`${s.exercises.length} esercizi · iniziato alle ${new Date(s.startedAt).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}`;
    $("#elapsed").textContent=formatTime(Math.floor((Date.now()-s.startedAt)/1000));
    $("#sessionExercises").innerHTML=s.exercises.map((e,ei)=>{
      const done=e.setsLog.filter(x=>x.done).length;
      const isRest=s.restExerciseId===e.id && s.restEndsAt;
      return `<article class="exercise-card session-exercise ${isRest?"active-rest":""}"><div class="card-head"><div><div class="muscle">${escapeHTML(e.muscle)}</div><p class="card-title" style="margin-top:6px">${escapeHTML(e.name)}</p><div class="muted">${done}/${e.setsLog.length} serie completate · Recupero ${e.rest}s ${e.unilateral?"· unilaterale":""} ${e.circuit?"· circuito":""}</div></div><button class="secondary" data-action="session-edit" data-index="${ei}">Modifica</button></div><div class="set-list">${e.setsLog.map((set,si)=>`<div class="set-row"><span class="set-number">S${si+1}</span><input type="number" min="0" step="0.5" aria-label="Kg serie ${si+1}" value="${set.weight}" data-action="log-weight" data-ei="${ei}" data-si="${si}" placeholder="kg"><input type="number" min="1" step="1" aria-label="Ripetizioni serie ${si+1}" value="${set.reps}" data-action="log-reps" data-ei="${ei}" data-si="${si}" placeholder="rip."><input type="checkbox" aria-label="Completa serie ${si+1}" data-action="complete-set" data-ei="${ei}" data-si="${si}" ${set.done?"checked":""}></div>`).join("")}</div>${isRest?`<div class="rest-box"><div><span>RECUPERO IN CORSO</span><strong id="restCountdown">${formatTime(Math.max(0,Math.ceil((s.restEndsAt-Date.now())/1000)))}</strong></div><div class="rest-actions"><button data-action="add-rest">+15s</button><button data-action="skip-rest">Salta</button></div></div>`:""}<div class="card-actions"><button class="secondary" data-action="session-add-set" data-index="${ei}">+ Serie</button><button class="secondary" data-action="session-add-exercise">+ Esercizio</button><button class="secondary" data-action="session-delete" data-index="${ei}">Elimina</button></div></article>`;
    }).join("");
    const allDone=s.exercises.every(e=>e.setsLog.every(x=>x.done));
    $("#sessionFooter").innerHTML=allDone&&!s.restEndsAt?'<p>Tutte le serie sono completate.</p><button class="primary full" id="finishCompleted" style="margin-top:12px">Termina e salva allenamento</button>':`<p>${allDone?"Ultimo recupero in corso.":"Completa le serie: il recupero partirà automaticamente."}</p>`;
    if(s.restEndsAt) startRestClock(); else clearInterval(restInterval);
  }
  function allSetsDone(s){return s.exercises.length>0&&s.exercises.every(e=>e.setsLog.length>0&&e.setsLog.every(set=>set.done));}
  function startRest(exerciseId,seconds){
    const s=state.session;if(!s)return;
    s.restExerciseId=exerciseId;s.restEndsAt=Date.now()+Math.max(1,seconds)*1000;persist();renderSession();startRestClock();
  }
  function startRestClock(){
    clearInterval(restInterval);
    restInterval=setInterval(()=>{
      const s=state.session;if(!s||!s.restEndsAt){clearInterval(restInterval);return;}
      const remaining=Math.ceil((s.restEndsAt-Date.now())/1000);
      const countdown=$("#restCountdown");if(countdown)countdown.textContent=formatTime(Math.max(0,remaining));
      if(remaining<=0){clearInterval(restInterval);s.restEndsAt=null;s.restExerciseId=null;persist();playBeep();renderSession();showToast("Recupero terminato. Si riparte!");}
    },250);
  }
  // iOS Safari richiede che l'AudioContext venga sbloccato durante un gesto dell'utente.
  let gymBroAudioContext = null;
  async function unlockWorkoutAudio(){
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!gymBroAudioContext) gymBroAudioContext = new Ctx();
      if (gymBroAudioContext.state === "suspended") await gymBroAudioContext.resume();
      // Un campione quasi silenzioso sblocca l'uscita audio su alcuni browser mobile.
      const buffer = gymBroAudioContext.createBuffer(1, 1, gymBroAudioContext.sampleRate);
      const source = gymBroAudioContext.createBufferSource();
      source.buffer = buffer; source.connect(gymBroAudioContext.destination); source.start(0);
    } catch (e) { console.warn("Audio non disponibile", e); }
  }
  async function playBeep(){
    try {
      await unlockWorkoutAudio();
      const ctx = gymBroAudioContext;
      if (ctx && ctx.state === "running") {
        [0, 0.22, 0.44].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine"; osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + offset + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.18);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(ctx.currentTime + offset); osc.stop(ctx.currentTime + offset + 0.19);
        });
      }
    } catch (e) { console.warn("Suono di recupero non riprodotto", e); }
    try { if ("vibrate" in navigator) navigator.vibrate([180, 100, 180]); } catch (_) {}
  }
  function completeSet(ei,si,checked){
    const s=state.session;if(!s)return;const e=s.exercises[ei],set=e?.setsLog[si];if(!e||!set)return;
    set.done=checked;set.weight=Number($(`[data-action="log-weight"][data-ei="${ei}"][data-si="${si}"]`)?.value??set.weight)||0;
    set.reps=Number($(`[data-action="log-reps"][data-ei="${ei}"][data-si="${si}"]`)?.value??set.reps)||1;
    if(checked){
      if(e.circuit){
        const circuitMembers=s.exercises.filter(x=>x.circuit);const circuitDone=circuitMembers.every(x=>x.setsLog[si]?.done);
        if(circuitDone)startRest(e.id,e.rest);
        else {persist();renderSession();}
      } else startRest(e.id,e.rest);
    } else {persist();renderSession();}
  }
  function sessionEdit(ei){
    const e=state.session?.exercises[ei];if(!e)return;
    openModal(`<div class="eyebrow">MODIFICA ESERCIZIO</div><h2 id="modalTitle">${escapeHTML(e.name)}</h2><label class="modal-label">Numero serie<input id="editSets" type="number" min="1" max="20" value="${e.setsLog.length}"></label><label class="modal-label">Ripetizioni per serie<input id="editReps" type="number" min="1" max="300" value="${e.reps}"></label><label class="modal-label">Recupero in secondi<input id="editRest" type="number" min="0" max="900" value="${e.rest}"></label><label class="modal-label">Carico predefinito (kg)<input id="editWeight" type="number" min="0" step=".5" value="${e.weight||0}"></label><label class="check-option"><input id="editUnilateral" type="checkbox" ${e.unilateral?"checked":""}> Esercizio unilaterale</label><label class="check-option"><input id="editCircuit" type="checkbox" ${e.circuit?"checked":""}> Parte di un circuito</label><button class="primary full" id="applySessionEdit">Salva modifiche</button>`);
    $("#applySessionEdit").onclick=()=>{
      const sets=Math.max(1,Math.min(20,Number($("#editSets").value)||1)),reps=Math.max(1,Number($("#editReps").value)||1),rest=Math.max(0,Number($("#editRest").value)||0),weight=Math.max(0,Number($("#editWeight").value)||0);
      const old=e.setsLog;e.setsLog=Array.from({length:sets},(_,i)=>old[i]||({done:false,weight,reps}));e.reps=reps;e.rest=rest;e.weight=weight;e.unilateral=$("#editUnilateral").checked;e.circuit=$("#editCircuit").checked;
      persist();closeModal();renderSession();showToast("Esercizio aggiornato.");
    };
  }
  function addExerciseDuringSession(){
    const s=state.session;if(!s)return;
    const available=availableExercises().filter(e=>!s.exercises.some(x=>x.id===e.id));
    if(!available.length){showToast("Non ci sono altri esercizi disponibili.");return;}
    openModal(`<div class="eyebrow">AGGIUNGI ALLA SESSIONE</div><h2 id="modalTitle">Scegli un esercizio</h2><div class="stack">${available.map(e=>`<button class="exercise-card" style="text-align:left;color:var(--text);width:100%" data-action="modal-add-exercise" data-id="${e.id}"><div class="muscle">${e.muscle}</div><strong>${escapeHTML(e.name)}</strong><div class="muted">${equipmentLabels[e.equipment]}</div></button>`).join("")}</div>`);
  }
  function finishSession(status="completed"){
    const s=state.session;if(!s)return;
    if(status==="interrupted"&&!confirm("Vuoi terminare l'allenamento prima di completarlo? I progressi registrati verranno salvati."))return;
    clearInterval(sessionInterval);clearInterval(restInterval);
    const duration=Math.floor((Date.now()-s.startedAt)/1000);
    let volume=0,reps=0,setsCompleted=0,exercisesCompleted=0;
    s.exercises.forEach(e=>{const completed=e.setsLog.filter(x=>x.done);if(completed.length)exercisesCompleted++;completed.forEach(set=>{volume+=Number(set.weight||0)*Number(set.reps||0)*(e.unilateral?2:1);reps+=Number(set.reps||0)*(e.unilateral?2:1);setsCompleted++;});});
    const record={id:s.id,planName:s.planName,startedAt:s.startedAt,endedAt:Date.now(),duration,volume,reps,setsCompleted,setsPlanned:s.exercises.reduce((n,e)=>n+e.setsLog.length,0),exercisesCompleted,exerciseCount:s.exercises.length,status};
    state.history.push(record);state.session=null;persist();closeModal();go("historyView");showSummary(record);
  }
  function showSummary(r){
    openModal(`<div class="eyebrow">ALLENAMENTO ${r.status==="completed"?"COMPLETATO":"INTERROTTO"}</div><h1 id="modalTitle">Bel lavoro<span class="lime">.</span></h1><p class="muted">${escapeHTML(r.planName)} · ${new Date(r.endedAt).toLocaleDateString("it-IT")}</p><div class="summary-grid"><div class="summary-stat"><strong>${formatTime(r.duration)}</strong><span>DURATA TOTALE</span></div><div class="summary-stat"><strong>${Math.round(r.volume).toLocaleString("it-IT")} kg</strong><span>VOLUME REGISTRATO</span></div><div class="summary-stat"><strong>${r.exercisesCompleted}/${r.exerciseCount}</strong><span>ESERCIZI COMPLETATI</span></div><div class="summary-stat"><strong>${r.reps}</strong><span>RIPETIZIONI REGISTRATE</span></div><div class="summary-stat"><strong>${r.setsCompleted}/${r.setsPlanned}</strong><span>SERIE COMPLETATE</span></div></div><button class="primary full" id="shareSummary">Condividi riepilogo ↗</button><p class="muted" style="margin-top:12px">Il volume è una stima basata sui kg e sulle ripetizioni registrate; gli esercizi a corpo libero non sono inclusi nel volume.</p>`);
    $("#shareSummary").onclick=()=>shareRecord(r);
  }
  async function shareRecord(r){
    const text=`GymBro 💚\n${r.planName}\n⏱ ${formatTime(r.duration)}\n🏋️ ${Math.round(r.volume)} kg di volume registrato\n💪 ${r.exercisesCompleted} esercizi · ${r.setsCompleted} serie · ${r.reps} ripetizioni\nTraccia. Spingi. Migliora.`;
    try{if(navigator.share)await navigator.share({title:"Il mio allenamento GymBro",text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);showToast("Riepilogo copiato.");}else showToast(text);}catch(e){if(e.name!=="AbortError")showToast("Condivisione non disponibile in questo browser.");}
  }
  function openModal(html){$("#modalContent").innerHTML=html;$("#modal").hidden=false;}
  function closeModal(){$("#modal").hidden=true;$("#modalContent").innerHTML="";}
  function formatTime(sec){sec=Math.max(0,Math.floor(Number(sec)||0));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;}
  function escapeHTML(str){return String(str??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function addSet(ei){const e=state.session?.exercises[ei];if(!e)return;e.setsLog.push({done:false,weight:Number(e.weight)||0,reps:Number(e.reps)||1});persist();renderSession();}
  function deleteSessionExercise(ei){const s=state.session;if(!s)return;if(!confirm(`Eliminare ${s.exercises[ei].name} dalla sessione?`))return;s.exercises.splice(ei,1);persist();renderSession();}
  function handleAction(target){
    const action=target.dataset.action;if(!action)return;
    const id=target.dataset.id, index=Number(target.dataset.index);
    switch(action){
      case "generate":generatePlan();break;
      case "start":startSession(id);break;
      case "edit":openPlanEditor(state.plans.find(p=>p.id===id));go("plansView");$("#planEditor").hidden=false;break;
      case "duplicate":{const p=state.plans.find(x=>x.id===id);if(p){const copy=JSON.parse(JSON.stringify(p));copy.id=String(Date.now())+Math.random();copy.name+=" — copia";state.plans.push(copy);persist();renderPlans();renderHome();showToast("Scheda duplicata.");}break;}
      case "delete":if(confirm("Eliminare questa scheda?")){state.plans=state.plans.filter(p=>p.id!==id);persist();renderPlans();renderHome();showToast("Scheda eliminata.");}break;
      case "exercise-info":{const e=exById(id);openModal(`<div class="eyebrow">${e.muscle.toUpperCase()}</div><h2 id="modalTitle">${escapeHTML(e.name)}</h2><p class="muted">Muscoli secondari: ${escapeHTML(e.secondary||"Nessuno indicato")}</p><p class="muted">Attrezzatura: ${equipmentLabels[e.equipment]} · Livello: ${e.level}</p><div class="panel"><strong>Come eseguirlo</strong><p class="muted" style="margin:8px 0 0">Mantieni il movimento controllato, usa un carico gestibile e interrompi se avverti dolore. Video originale dimostrativo: in preparazione.</p></div><p class="muted">Il video originale sarà aggiunto in una fase successiva; non mostriamo video di terzi come se fossero contenuti GymBro.</p>`);break;}
      case "add-to-plan":go("plansView");openPlanEditor();addExerciseToEditor(id);break;
      case "move-editor-up":if(index>0){[editorExerciseIds[index-1],editorExerciseIds[index]]=[editorExerciseIds[index],editorExerciseIds[index-1]];renderEditorExercises();}break;
      case "move-editor-down":if(index<editorExerciseIds.length-1){[editorExerciseIds[index+1],editorExerciseIds[index]]=[editorExerciseIds[index],editorExerciseIds[index+1]];renderEditorExercises();}break;
      case "remove-editor-exercise":editorExerciseIds.splice(index,1);renderEditorExercises();break;
      case "session-edit":sessionEdit(index);break;
      case "session-add-set":addSet(index);break;
      case "session-add-exercise":addExerciseDuringSession();break;
      case "session-delete":deleteSessionExercise(index);break;
      case "skip-rest":if(state.session){state.session.restEndsAt=null;state.session.restExerciseId=null;persist();clearInterval(restInterval);renderSession();showToast("Recupero saltato.");}break;
      case "add-rest":if(state.session?.restEndsAt){state.session.restEndsAt+=15000;persist();renderSession();}break;
      case "modal-add-exercise":{const e=exById(id);if(e&&state.session){state.session.exercises.push({...e,weight:0,circuit:false,setsLog:Array.from({length:e.sets},()=>({done:false,weight:0,reps:e.reps}))});persist();closeModal();renderSession();showToast("Esercizio aggiunto alla sessione.");}break;}
      case "share-history":{const r=state.history.find(x=>x.id===id);if(r)shareRecord(r);break;}
    }
  }
  function bind(){
    // Sblocca l'audio al primo tocco/click dell'utente, prima che scada il recupero.
    document.addEventListener("pointerdown", () => { unlockWorkoutAudio(); }, { once: true, passive: true });
    document.addEventListener("touchstart", () => { unlockWorkoutAudio(); }, { once: true, passive: true });
    $$(".nav-item").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
    $$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
    $("#profileBtn").addEventListener("click",()=>go("setupView"));
    $("#startFromHome").addEventListener("click",()=>{
      // Il CTA principale deve avviare davvero una sessione, non limitarsi a cambiare schermata.
      if (state.session) { go("sessionView"); renderSession(); return; }
      if (!state.plans.length) {
        generatePlan();
        const generated = state.plans[state.plans.length - 1];
        if (generated && generated.exercises.length) startSession(generated.id);
        else go("plansView");
        return;
      }
      // Se esistono schede, avvia la più recente; dalla sezione Schede si può scegliere un'altra scheda.
      startSession(state.plans[state.plans.length - 1].id);
    });
    $("#profileForm").addEventListener("submit",saveProfile);
    $("#newPlanBtn").addEventListener("click",()=>openPlanEditor());
    $("#addExerciseBtn").addEventListener("click",()=>{go("libraryView");showToast("Scegli un esercizio e premi Aggiungi a scheda.");});
    $("#savePlanBtn").addEventListener("click",savePlan);
    $("#cancelPlanBtn").addEventListener("click",()=>{$("#planEditor").hidden=true;});
    $("#exerciseSearch").addEventListener("input",renderLibrary);
    $("#muscleFilter").addEventListener("change",renderLibrary);
    $("#equipmentFilter").addEventListener("change",renderLibrary);
    $("#modalClose").addEventListener("click",closeModal);
    $("#modal").addEventListener("click",e=>{if(e.target===$("#modal"))closeModal();});
    document.addEventListener("click",e=>{const target=e.target.closest("[data-action]");if(target)handleAction(target);if(e.target.id==="finishEarly")finishSession("interrupted");if(e.target.id==="finishCompleted")finishSession("completed");});
    document.addEventListener("change",e=>{
      const t=e.target;
      if(t.dataset.action==="complete-set")completeSet(Number(t.dataset.ei),Number(t.dataset.si),t.checked);
      else if(t.dataset.action==="log-weight"||t.dataset.action==="log-reps"){
        const s=state.session,ex=s?.exercises[Number(t.dataset.ei)],set=ex?.setsLog[Number(t.dataset.si)];if(set){if(t.dataset.action==="log-weight")set.weight=Math.max(0,Number(t.value)||0);else set.reps=Math.max(1,Number(t.value)||1);persist();}
      }
    });
    document.addEventListener("visibilitychange",()=>{if(!document.hidden&&state.session){startSessionClock();if(state.session.restEndsAt)startRestClock();}});
  }
  function boot(){
    bind();renderHome();renderPlans();renderLibrary();renderHistory();
    if(!state.profile.name && !state.profileConfigured){/* onboarding remains optional for test prototype */}
    if(state.session){state.session=null;persist();}
    if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(err=>console.warn("Service worker non registrato",err));
  }
  boot();
})();
