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
    {id:"band-pull",name:"Aperture con elastico",muscle:"Spalle",secondary:"Schiena",equipment:"band",level:"Principiante",sets:3,reps:15,rest:45,unilateral:false},
    {id:"hip-thrust",name:"Hip thrust",muscle:"Glutei",secondary:"Femorali",equipment:"barbell",level:"Intermedio",sets:3,reps:10,rest:90,unilateral:false},
    {id:"glute-bridge",name:"Glute bridge",muscle:"Glutei",secondary:"Addome",equipment:"bodyweight",level:"Principiante",sets:3,reps:15,rest:60,unilateral:false},
    {id:"rdl",name:"Stacco rumeno",muscle:"Femorali",secondary:"Glutei, schiena",equipment:"dumbbell",level:"Intermedio",sets:3,reps:10,rest:90,unilateral:false},
    {id:"leg-extension",name:"Leg extension",muscle:"Quadricipiti",secondary:"",equipment:"machine",level:"Principiante",sets:3,reps:12,rest:75,unilateral:false},
    {id:"calf-machine",name:"Calf alla macchina",muscle:"Polpacci",secondary:"",equipment:"machine",level:"Principiante",sets:3,reps:15,rest:60,unilateral:false},
    {id:"wrist-curl",name:"Wrist curl",muscle:"Avambracci",secondary:"",equipment:"dumbbell",level:"Principiante",sets:3,reps:15,rest:45,unilateral:false},
    {id:"dead-bug",name:"Dead bug",muscle:"Core",secondary:"Addome",equipment:"bodyweight",level:"Principiante",sets:3,reps:10,rest:45,unilateral:true}
  ];
  const freshState = () => ({
    profile:{name:"",goal:"hypertrophy",level:"beginner",days:4,equipment:["dumbbell","barbell","machine","cable","bodyweight"]},
    plans:[],history:[],session:null
  });
  let state = loadState();
  let sessionInterval = null, restInterval = null, toastTimeout = null;
  let editingPlanId = null, editorExerciseIds = [];
  let audioContext = null;
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
  function createPlanObject(name,goal,ids,programName="Programma personale"){
    return {id:crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random(),name:name.trim(),programName:(programName||"Programma personale").trim(),goal,createdAt:Date.now(),exercises:ids.map(id=>{const e=exById(id);return {...e,weight:0,sets:e.sets,reps:e.reps,rest:e.rest,circuit:false,unilateral:e.unilateral};})};
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
    return `<article class="plan-card"><div class="card-head"><div><p class="card-title">${escapeHTML(p.name)}</p><div class="muted">${escapeHTML(p.programName||"Programma personale")} · ${goalLabel(p.goal)} · ${count} esercizi</div></div><span class="tag">${count?`${p.exercises.reduce((n,e)=>n+Number(e.sets||0),0)} serie`:"Vuota"}</span></div><div class="card-actions"><button class="primary compact" data-action="start" data-id="${p.id}">Apri allenamento ↗</button><button class="secondary" data-action="edit" data-id="${p.id}">Modifica</button><button class="secondary" data-action="duplicate" data-id="${p.id}">Duplica</button><button class="secondary" data-action="delete" data-id="${p.id}">Elimina</button></div></article>`;
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
    $("#planName").value=plan?.name||"";$("#programName").value=plan?.programName||"Programma personale";$("#planGoal").value=plan?.goal||state.profile.goal||"hypertrophy";
    $("#planEditor").hidden=false;renderEditorExercises();$("#planName").focus();
  }
  function renderEditorExercises(){
    const root=$("#editorExercises");
    root.innerHTML=editorExerciseIds.length?editorExerciseIds.map((id,i)=>{const e=exById(id);return `<div class="exercise-card reorder-card" data-reorder-index="${i}"><div class="card-head"><button class="drag-handle" type="button" aria-label="Trascina per riordinare" title="Trascina per riordinare">⠿</button><div class="reorder-title"><p class="card-title">${escapeHTML(e?.name||"Esercizio")}</p><div class="muted">${e?.muscle||""}</div></div><div class="card-actions reorder-actions"><button class="secondary" data-action="move-editor-up" data-index="${i}" ${i===0?"disabled":""} aria-label="Sposta sopra">↑</button><button class="secondary" data-action="move-editor-down" data-index="${i}" ${i===editorExerciseIds.length-1?"disabled":""} aria-label="Sposta sotto">↓</button><button class="secondary" data-action="remove-editor-exercise" data-index="${i}">Rimuovi</button></div></div></div>`}).join(""):'<div class="empty">Nessun esercizio. Premi “Aggiungi”.</div>';
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
      old.name=name;old.programName=$("#programName").value.trim()||"Programma personale";old.goal=$("#planGoal").value;
      old.exercises=editorExerciseIds.map(id=>oldById.get(id)||{...exById(id),weight:0,circuit:false,unilateral:exById(id).unilateral});
    } else state.plans.push(createPlanObject(name,$("#planGoal").value,editorExerciseIds,$("#programName").value));
    persist();$("#planEditor").hidden=true;renderPlans();renderHome();showToast("Scheda salvata.");
  }
  function generatePlan(){
    const list=availableExercises();if(!list.length){showToast("Seleziona prima l'attrezzatura nel profilo.");go("setupView");return;}
    const goal=state.profile.goal||"hypertrophy";
    const preferred=goal==="strength"?list.filter(e=>["Squat con bilanciere","Panca piana con bilanciere","Stacco da terra","Rematore con manubrio","Shoulder press"].includes(e.name)):list;
    const chosen=[], muscles=new Set();
    for(const e of preferred){if(!muscles.has(e.muscle)){chosen.push(e.id);muscles.add(e.muscle);}if(chosen.length>=Math.min(6,Math.max(4,Number(state.profile.days)+1)))break;}
    for(const e of preferred){if(chosen.length>=6)break;if(!chosen.includes(e.id))chosen.push(e.id);}
    const p=createPlanObject(`${goalLabel(goal)} — Full body`,goal,chosen,"Programma personale");
    state.plans.push(p);persist();renderPlans();renderHome();showToast("Scheda generata: puoi modificarla prima dell'allenamento.");
  }
  function startSession(planId){
    // Avvia/sblocca l’audio durante il gesto esplicito dell’utente (compatibilità Safari iOS).
    unlockAudio();
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
      return `<article class="exercise-card session-exercise reorder-card ${isRest?"active-rest":""}" data-reorder-index="${ei}"><div class="card-head"><button class="drag-handle" type="button" aria-label="Trascina per riordinare" title="Trascina per riordinare">⠿</button><div class="reorder-title"><div class="muscle">${escapeHTML(e.muscle)}</div><p class="card-title" style="margin-top:6px">${escapeHTML(e.name)}</p><div class="muted">${done}/${e.setsLog.length} serie completate · Recupero ${e.rest}s ${e.unilateral?"· unilaterale":""} ${e.circuit?"· circuito":""}</div></div><div class="session-reorder-actions"><button class="secondary" data-action="move-session-up" data-index="${ei}" ${ei===0?"disabled":""} aria-label="Sposta sopra">↑</button><button class="secondary" data-action="move-session-down" data-index="${ei}" ${ei===s.exercises.length-1?"disabled":""} aria-label="Sposta sotto">↓</button><button class="secondary" data-action="session-edit" data-index="${ei}">Modifica</button></div></div><div class="set-list">${e.setsLog.map((set,si)=>`<div class="set-row"><span class="set-number">S${si+1}</span><input type="number" min="0" step="0.5" aria-label="Kg serie ${si+1}" value="${set.weight}" data-action="log-weight" data-ei="${ei}" data-si="${si}" placeholder="kg"><input type="number" min="1" step="1" aria-label="Ripetizioni serie ${si+1}" value="${set.reps}" data-action="log-reps" data-ei="${ei}" data-si="${si}" placeholder="rip."><input type="checkbox" aria-label="Completa serie ${si+1}" data-action="complete-set" data-ei="${ei}" data-si="${si}" ${set.done?"checked":""}></div>`).join("")}</div>${isRest?`<div class="rest-box"><div><span>RECUPERO IN CORSO</span><strong id="restCountdown">${formatTime(Math.max(0,Math.ceil((s.restEndsAt-Date.now())/1000)))}</strong></div><div class="rest-actions"><button data-action="add-rest">+15s</button><button data-action="skip-rest">Salta</button></div></div>`:""}<div class="card-actions"><button class="secondary" data-action="session-add-set" data-index="${ei}">+ Serie</button><button class="secondary" data-action="session-add-exercise">+ Esercizio</button><button class="secondary" data-action="session-delete" data-index="${ei}">Elimina</button></div></article>`;
    }).join("");
    const allDone=s.exercises.every(e=>e.setsLog.every(x=>x.done));
    $("#sessionFooter").innerHTML=`<p>${allDone?(s.restEndsAt?"Ultimo recupero in corso.":"Tutte le serie sono completate."):"Completa le serie: il recupero partirà automaticamente."}</p><div class="sound-tools"><button class="secondary" id="testSoundBtn" type="button">♪ Attiva e prova il suono</button><span class="muted" id="soundStatus">Prova il suono prima di iniziare.</span></div>${allDone&&!s.restEndsAt?'<button class="primary full" id="finishCompleted" style="margin-top:12px">Termina e salva allenamento</button>':""}`;
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
  async function unlockAudio(){
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx){showToast("Questo browser non supporta l'audio Web.");return false;}
    try{
      if(!audioContext) audioContext=new Ctx();
      if(audioContext.state==="suspended") await audioContext.resume();
      // Tiny silent oscillator, created directly from a user gesture, helps unlock iOS Safari audio.
      const osc=audioContext.createOscillator(), gain=audioContext.createGain();
      gain.gain.value=0;osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+0.02);
      return audioContext.state==="running";
    }catch(e){console.warn("Impossibile attivare audio",e);return false;}
  }
  async function playBeep(){
    try{
      // Non creare né sbloccare AudioContext alla scadenza: su iOS serve un gesto utente precedente.
      if(!audioContext){console.warn("AudioContext non inizializzato");return false;}
      if(audioContext.state==="suspended"){
        try{await audioContext.resume();}catch(e){console.warn("AudioContext sospeso",e);}
      }
      if(audioContext.state!=="running"){console.warn("AudioContext non running:",audioContext.state);return false;}
      const now=audioContext.currentTime;
      [0,0.32,0.64].forEach((offset,i)=>{
        const osc=audioContext.createOscillator(),gain=audioContext.createGain();
        osc.type="sine";osc.frequency.value=i===1?1046:880;
        gain.gain.setValueAtTime(0.0001,now+offset);
        gain.gain.exponentialRampToValueAtTime(0.22,now+offset+0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001,now+offset+0.24);
        osc.connect(gain);gain.connect(audioContext.destination);
        osc.start(now+offset);osc.stop(now+offset+0.26);
      });
      if("vibrate" in navigator){try{navigator.vibrate([150,80,150]);}catch{}}
      return true;
    }catch(e){console.warn("Audio non disponibile",e);return false;}
  }
  async function testSound(){
    const status=$("#soundStatus");
    const ready=await unlockAudio();
    if(!ready){if(status)status.textContent="Audio non attivato dal browser. Riprova toccando il pulsante.";showToast("Safari non ha attivato l'audio: riprova con questo pulsante.");return;}
    const played=await playBeep();
    if(!played){if(status)status.textContent="Il browser non sta riproducendo l'audio. Riprova a toccare il test con GymBro in primo piano.";showToast("Audio non riprodotto: verifica autorizzazione e stato del browser.");return;}
    if(status)status.textContent="Segnale audio richiesto correttamente. Se non lo senti, il browser/dispositivo sta bloccando l'uscita audio.";
    showToast("Test audio inviato.");
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
      const old=e.setsLog.slice();
      e.setsLog=Array.from({length:sets},(_,i)=>{
        const previous=old[i]||{done:false};
        return {...previous,weight,reps};
      });
      e.reps=reps;
      e.rest=rest;
      e.weight=weight;
      e.unilateral=$("#editUnilateral").checked;
      e.circuit=$("#editCircuit").checked;
      // Persist explicit defaults and each row value before repainting the session.
      persist();
      closeModal();
      renderSession();
      showToast(`Aggiornate ${sets} serie: ${weight} kg × ${reps} ripetizioni.`);

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
    openModal(`<div class="eyebrow">ALLENAMENTO ${r.status==="completed"?"COMPLETATO":"INTERROTTO"}</div><h1 id="modalTitle">Bel lavoro<span class="lime">.</span></h1><p class="muted">${escapeHTML(r.planName)} · ${new Date(r.endedAt).toLocaleDateString("it-IT")}</p><div class="summary-grid"><div class="summary-stat"><strong>${formatTime(r.duration)}</strong><span>DURATA TOTALE</span></div><div class="summary-stat"><strong>${Math.round(r.volume).toLocaleString("it-IT")} kg</strong><span>VOLUME REGISTRATO</span></div><div class="summary-stat"><strong>${r.exercisesCompleted}/${r.exerciseCount}</strong><span>ESERCIZI COMPLETATI</span></div><div class="summary-stat"><strong>${r.reps}</strong><span>RIPETIZIONI REGISTRATE</span></div><div class="summary-stat"><strong>${r.setsCompleted}/${r.setsPlanned}</strong><span>SERIE COMPLETATE</span></div></div><button class="primary full" id="createStoryGraphic">Crea e condividi grafica per Instagram ↗</button><button class="secondary full" id="shareSummary" style="width:100%;margin-top:8px">Condividi solo testo</button><p class="muted" style="margin-top:12px">Il volume è una stima basata sui kg e sulle ripetizioni registrate; gli esercizi a corpo libero non sono inclusi nel volume.</p>`);
    $("#shareSummary").onclick=()=>shareRecord(r);
    $("#createStoryGraphic").onclick=()=>openStoryGraphic(r);
  }
  let storyRecord = null, storyPhoto = null, storyTemplate = "photo", storyStickers = [], selectedSticker = 0, storyBg = "#171a1c";
  const STORY_STYLES = ["Pulito", "GymBro", "Contorno", "Editoriale"];
  function openStoryGraphic(r){
    storyRecord=r;storyPhoto=null;storyTemplate="Pulito";storyBg="#171a1c";
    const values=storyValues(r);
    storyStickers=[
      {id:uid(),kind:"title",label:"Titolo",text:r.planName||"Il mio allenamento",x:42,y:160,size:42,color:"#ffffff",weight:700,style:"Pulito"},
      {id:uid(),kind:"stat",label:"Durata",stat:"DURATA",x:42,y:610,size:23,color:"#ffffff",weight:700,style:"Pulito"},
      {id:uid(),kind:"stat",label:"Volume",stat:"VOLUME",x:42,y:680,size:34,color:"#c3ff3d",weight:700,style:"Pulito"}
    ];selectedSticker=0;
    openModal(`<div class="social-editor" id="socialEditor">
      <header class="social-editor-head"><button class="social-icon-btn" id="storyBack" aria-label="Indietro">‹</button><div><strong>GymBro <span>STORY STUDIO</span></strong><small>Crea la tua storia</small></div><button class="social-done" id="storyDone">Fatto ✓</button></header>
      <div class="story-stage-wrap"><div class="story-stage"><canvas id="storyCanvas" width="540" height="960" aria-label="Anteprima storia a tutta pagina"></canvas></div></div>
      <div class="story-editor-panel"><div class="story-editor-tabs"><button class="story-tab active" data-panel="background">Sfondo</button><button class="story-tab" data-panel="stickers">Adesivi</button><button class="story-tab" data-panel="style">Stile</button></div>
        <div class="story-panel active" id="panel-background"><label class="story-action-tile">▧ <span><b>La tua foto</b><small>Usa una foto come sfondo</small></span><input id="storyPhotoInput" type="file" accept="image/*" hidden></label><div class="story-bg-swatches"><button data-bg="#171a1c" aria-label="Antracite" class="active" style="background:#171a1c"></button><button data-bg="#080909" aria-label="Nero" style="background:#080909"></button><button data-bg="#23301a" aria-label="Verde scuro" style="background:#23301a"></button><button data-bg="#c3ff3d" aria-label="Lime" style="background:#c3ff3d"></button></div><p class="story-helper">La foto resta sullo sfondo. Puoi spostare e ingrandire ogni elemento senza modificare l'immagine.</p></div>
        <div class="story-panel" id="panel-stickers"><div class="story-sticker-grid"><button data-add="duration"><b>00:00</b><span>Durata</span></button><button data-add="volume"><b>3.620 kg</b><span>Volume</span></button><button data-add="sets"><b>33</b><span>Serie</span></button><button data-add="reps"><b>120</b><span>Ripetizioni</span></button><button data-add="exercises"><b>8</b><span>Esercizi</span></button><button data-add="calories"><b>483 kcal</b><span>Calorie*</span></button><button data-add="title"><b>Tt</b><span>Testo</span></button><button data-add="brand"><b>GB /</b><span>Firma GymBro</span></button></div><p class="story-helper">Tocca un adesivo per aggiungerlo. Trascinalo direttamente sull'anteprima per posizionarlo.</p></div>
        <div class="story-panel" id="panel-style"><div class="story-style-options"><button data-style="Pulito" class="active"><b>Ab</b><span>Pulito</span></button><button data-style="GymBro"><b style="color:#c3ff3d">GB</b><span>GymBro</span></button><button data-style="Contorno"><b style="-webkit-text-stroke:1px white;color:transparent">Ab</b><span>Contorno</span></button><button data-style="Editoriale"><b style="font-family:Georgia,serif">Ab</b><span>Editoriale</span></button></div><div class="story-selected-tools"><label>Testo adesivo<input id="stickerTextInput" type="text" maxlength="80" placeholder="Scrivi il testo"></label><label>Colore testo<select id="stickerColor"><option value="#ffffff">Bianco</option><option value="#c3ff3d">GymBro lime</option><option value="#111111">Nero</option></select></label><label>Dimensione<input id="stickerSize" type="range" min="12" max="88" value="34"></label><button class="secondary" id="deleteSticker">Elimina adesivo selezionato</button></div></div>
      </div>
      <footer class="story-editor-footer"><button class="secondary" id="downloadStoryImage">↓ Salva</button><button class="primary" id="shareStoryImage">Condividi ↗</button></footer>
      <p class="story-editor-note">*Le calorie sono modificabili solo se hai un dato disponibile. Instagram potrebbe richiedere di selezionare la storia dal rullino.</p>
    </div>`);
    const sc=$("#storyCanvas");
    const selectSticker=(id)=>{selectedSticker=storyStickers.findIndex(s=>s.id===id);if(selectedSticker<0)selectedSticker=0;syncStickerTools();drawStoryGraphic();};
    const syncStickerTools=()=>{const st=storyStickers[selectedSticker];if(!st)return;$("#stickerSize").value=String(st.size);$("#stickerColor").value=st.color||"#ffffff";$("#stickerTextInput").value=st.text||stickerText(st,r)||"";};
    const switchPanel=name=>{$$(".story-tab").forEach(b=>b.classList.toggle("active",b.dataset.panel===name));$$(".story-panel").forEach(p=>p.classList.toggle("active",p.id===`panel-${name}`));};
    $$(".story-tab").forEach(b=>b.onclick=()=>switchPanel(b.dataset.panel));
    $("#storyBack").onclick=()=>closeModal();$("#storyDone").onclick=()=>{switchPanel("stickers");showToast("Seleziona e modifica gli adesivi, poi condividi la storia.");};
    $("#storyPhotoInput").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;try{storyPhoto=await loadImage(URL.createObjectURL(f));drawStoryGraphic();}catch{showToast("Non riesco a leggere questa foto.");}});
    $$("[data-bg]").forEach(b=>b.onclick=()=>{storyBg=b.dataset.bg;$$("[data-bg]").forEach(x=>x.classList.toggle("active",x===b));drawStoryGraphic();});
    $$("[data-style]").forEach(b=>b.onclick=()=>{storyTemplate=b.dataset.style;$$("[data-style]").forEach(x=>x.classList.toggle("active",x===b));const st=storyStickers[selectedSticker];if(st)st.style=storyTemplate;drawStoryGraphic();});
    $$("[data-add]").forEach(b=>b.onclick=()=>{const kind=b.dataset.add,st=makeStorySticker(kind,r,storyStickers.length);storyStickers.push(st);selectSticker(st.id);switchPanel("style");});
    $("#stickerColor").onchange=e=>{const st=storyStickers[selectedSticker];if(st){st.color=e.target.value;drawStoryGraphic();}};
    $("#stickerTextInput").oninput=e=>{const st=storyStickers[selectedSticker];if(st){st.text=e.target.value;if(st.kind!=="text"&&st.kind!=="brand")st.customText=e.target.value;drawStoryGraphic();}};
    $("#stickerSize").oninput=e=>{const st=storyStickers[selectedSticker];if(st){st.size=Number(e.target.value);drawStoryGraphic();}};
    $("#deleteSticker").onclick=()=>{if(!storyStickers.length)return;storyStickers.splice(selectedSticker,1);selectedSticker=Math.max(0,selectedSticker-1);syncStickerTools();drawStoryGraphic();};
    let drag=null;
    sc.addEventListener("pointerdown",e=>{const rect=sc.getBoundingClientRect(),x=(e.clientX-rect.left)*sc.width/rect.width,y=(e.clientY-rect.top)*sc.height/rect.height;let idx=-1,resize=false;for(let i=storyStickers.length-1;i>=0;i--){const box=stickerBounds(sc.getContext("2d"),storyStickers[i]);const hx=box.x+box.w+8,hy=box.y+box.h+8;const handleHit=Math.hypot(x-hx,y-hy)<=28;if(handleHit){idx=i;resize=true;break;}if(x>=box.x-18&&x<=box.x+box.w+18&&y>=box.y-18&&y<=box.y+box.h+18){idx=i;resize=false;break;}}if(idx<0)return;selectedSticker=idx;const st=storyStickers[idx];drag={x,y,sx:st.x,sy:st.y,size:st.size,mode:resize?"resize":"move"};try{sc.setPointerCapture(e.pointerId);}catch{}syncStickerTools();drawStoryGraphic();e.preventDefault();});
    sc.addEventListener("pointermove",e=>{if(!drag)return;const rect=sc.getBoundingClientRect(),x=(e.clientX-rect.left)*sc.width/rect.width,y=(e.clientY-rect.top)*sc.height/rect.height,st=storyStickers[selectedSticker];if(!st)return;if(drag.mode==="resize"){st.size=Math.max(12,Math.min(110,drag.size+(x-drag.x)*0.35));$("#stickerSize").value=String(st.size);}else{st.x=Math.max(0,Math.min(520,drag.sx+x-drag.x));st.y=Math.max(20,Math.min(940,drag.sy+y-drag.y));}drawStoryGraphic();e.preventDefault();});
    const endDrag=()=>drag=null;sc.addEventListener("pointerup",endDrag);sc.addEventListener("pointercancel",endDrag);
    sc.addEventListener("dblclick",()=>{switchPanel("style");});
    $("#shareStoryImage").onclick=shareStoryImage;$("#downloadStoryImage").onclick=downloadStoryImage;
    drawStoryGraphic();syncStickerTools();
  }
  function uid(){return "st"+Math.random().toString(36).slice(2,10);}
  function storyValues(r){return {DURATA:formatTime(r.duration),VOLUME:`${Math.round(r.volume).toLocaleString("it-IT")} kg`,SERIE:`${r.setsCompleted}/${r.setsPlanned}`,RIPETIZIONI:String(r.reps),ESERCIZI:String(r.exercisesCompleted),CALORIE:"—"};}
  function makeStorySticker(kind,r,index){const values=storyValues(r),defaults={duration:{label:"Durata",text:values.DURATA,stat:"DURATA",size:30,color:"#ffffff"},volume:{label:"Volume",text:values.VOLUME,stat:"VOLUME",size:42,color:"#c3ff3d"},sets:{label:"Serie",text:values.SERIE,stat:"SERIE",size:42,color:"#ffffff"},reps:{label:"Ripetizioni",text:values.RIPETIZIONI,stat:"RIPETIZIONI",size:42,color:"#ffffff"},exercises:{label:"Esercizi",text:values.ESERCIZI,stat:"ESERCIZI",size:42,color:"#ffffff"},calories:{label:"Calorie",text:values.CALORIE,stat:"CALORIE",size:34,color:"#ffffff"},title:{label:"Testo",text:"Scrivi qualcosa…",size:34,color:"#ffffff"},brand:{label:"Firma GymBro",text:"GYMBRO /",size:24,color:"#c3ff3d"}};const d=defaults[kind]||defaults.title;return {id:uid(),kind:kind==="title"?"text":kind,label:d.label,text:d.text,stat:d.stat||null,x:48+(index%2)*60,y:420+(index%4)*65,size:d.size,color:d.color,weight:700,style:storyTemplate};}
  function stickerText(st,r){if(st.customText)return st.customText;if(st.kind==="text")return st.text;if(st.kind==="brand")return "GYMBRO /";const v=storyValues(r);return v[st.stat]??st.text;}
  function stickerBounds(ctx,st){ctx.save();ctx.font=`${st.weight||700} ${st.size}px ${st.style==="Editoriale"?"Georgia,serif":"Arial,sans-serif"}`;const text=stickerText(st,storyRecord);const w=Math.max(40,ctx.measureText(text).width+8),h=st.size*1.25;ctx.restore();return {x:st.x,y:st.y-h,w,h};}
  function drawStoryGraphic(showHandles=true,targetCanvas=null){
    const canvas=targetCanvas||$("#storyCanvas");if(!canvas||!storyRecord)return;const ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height,r=storyRecord;ctx.clearRect(0,0,w,h);
    if(storyPhoto){const scale=Math.max(w/storyPhoto.width,h/storyPhoto.height),iw=storyPhoto.width*scale,ih=storyPhoto.height*scale;ctx.drawImage(storyPhoto,(w-iw)/2,(h-ih)/2,iw,ih);}else{ctx.fillStyle=storyBg;ctx.fillRect(0,0,w,h);if(storyBg!=="#c3ff3d"){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#28321e55");g.addColorStop(1,"#05060622");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}}
    storyStickers.forEach((st,i)=>{ctx.save();const text=stickerText(st,r),size=Math.max(10,st.size);ctx.font=`${st.weight||700} ${size}px ${st.style==="Editoriale"?"Georgia,serif":"Arial,sans-serif"}`;ctx.textBaseline="alphabetic";ctx.textAlign="left";if(st.style==="Contorno"){ctx.lineWidth=Math.max(1,size/22);ctx.strokeStyle=st.color;ctx.strokeText(text,st.x,st.y);}else{ctx.fillStyle=st.style==="GymBro"&&st.kind==="title"?"#c3ff3d":st.color||"#ffffff";ctx.shadowColor="rgba(0,0,0,.55)";ctx.shadowBlur=storyPhoto?5:0;ctx.shadowOffsetY=1;ctx.fillText(text,st.x,st.y);}ctx.restore();if(showHandles&&i===selectedSticker){const b=stickerBounds(ctx,st);ctx.save();ctx.strokeStyle="#c3ff3d";ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.strokeRect(b.x-6,b.y-6,b.w+12,b.h+12);ctx.setLineDash([]);ctx.fillStyle="#c3ff3d";ctx.beginPath();ctx.arc(b.x+b.w+8,b.y+b.h+8,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#111315";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x+b.w+2,b.y+b.h+14);ctx.lineTo(b.x+b.w+14,b.y+b.h+2);ctx.stroke();ctx.restore();}});
    if(showHandles){ctx.save();ctx.fillStyle="#c3ff3d";ctx.font="bold 14px Arial";ctx.fillText("GYMBRO / TRACCIA. SPINGI. MIGLIORA.",28,h-28);ctx.restore();}
  }
  function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});}
  function storyBlob(){return new Promise((resolve,reject)=>{const out=document.createElement("canvas");out.width=1080;out.height=1920;drawStoryGraphic(false,out);out.toBlob(b=>b?resolve(b):reject(new Error("PNG non disponibile")),"image/png");});}
  async function shareStoryImage(){try{const blob=await storyBlob(),file=new File([blob],"gymbro-story.png",{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[file]})&&navigator.share){await navigator.share({title:"Il mio allenamento GymBro",text:"Traccia. Spingi. Migliora. 💚",files:[file]});}else{downloadBlob(blob);showToast("Immagine salvata: apri Instagram e aggiungila alla Storia.");}}catch(e){if(e.name!=="AbortError")showToast("Condivisione non disponibile: prova Salva immagine PNG.");}}
  async function downloadStoryImage(){try{downloadBlob(await storyBlob());showToast("Grafica PNG pronta. Su iPhone controlla Download in File.");}catch{showToast("Non è stato possibile creare l'immagine.");}}
  function downloadBlob(blob){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="gymbro-story.png";a.style.display="none";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);}
  async function shareRecord(r){
    const text=`GymBro 💚\n${r.planName}\n⏱ ${formatTime(r.duration)}\n🏋️ ${Math.round(r.volume)} kg di volume registrato\n💪 ${r.exercisesCompleted} esercizi · ${r.setsCompleted} serie · ${r.reps} ripetizioni\nTraccia. Spingi. Migliora.`;
    try{if(navigator.share)await navigator.share({title:"Il mio allenamento GymBro",text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);showToast("Riepilogo copiato.");}else showToast(text);}catch(e){if(e.name!=="AbortError")showToast("Condivisione non disponibile in questo browser.");}
  }
  function openModal(html){$("#modalContent").innerHTML=html;$("#modal").hidden=false;}
  function closeModal(){$("#modal").hidden=true;$("#modalContent").innerHTML="";}
  function formatTime(sec){sec=Math.max(0,Math.floor(Number(sec)||0));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;}
  function escapeHTML(str){return String(str??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function addSet(ei){const e=state.session?.exercises[ei];if(!e)return;e.setsLog.push({done:false,weight:Number(e.weight)||0,reps:Number(e.reps)||1});persist();renderSession();}
  function moveSessionExercise(from,to){const s=state.session;if(!s||from<0||to<0||from>=s.exercises.length||to>=s.exercises.length||from===to)return;const [item]=s.exercises.splice(from,1);s.exercises.splice(to,0,item);const plan=state.plans.find(p=>p.id===s.planId);if(plan){const byId=new Map(plan.exercises.map(e=>[e.id,e]));const ordered=s.exercises.map(e=>byId.get(e.id)).filter(Boolean);plan.exercises=[...ordered,...plan.exercises.filter(e=>!ordered.some(x=>x.id===e.id))];}persist();renderSession();}
  function reorderByPointer(container, getList, render){let from=null;container.addEventListener("pointerdown",e=>{const grip=e.target.closest(".drag-handle");if(!grip)return;const card=grip.closest("[data-reorder-index]");if(!card)return;from=Number(card.dataset.reorderIndex);grip.setPointerCapture?.(e.pointerId);e.preventDefault();});container.addEventListener("pointerup",e=>{if(from===null)return;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.("[data-reorder-index]");const to=target?Number(target.dataset.reorderIndex):from;const list=getList();if(target&&to!==from&&list[from]!==undefined){const [item]=list.splice(from,1);list.splice(to,0,item);render();persist();showToast("Ordine degli esercizi aggiornato.");}from=null;});container.addEventListener("pointercancel",()=>{from=null;});}
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
      case "move-session-up":moveSessionExercise(index,index-1);break;
      case "move-session-down":moveSessionExercise(index,index+1);break;
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
    reorderByPointer($("#editorExercises"),()=>editorExerciseIds,renderEditorExercises);
    reorderByPointer($("#sessionExercises"),()=>state.session?.exercises||[],renderSession);
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
    document.addEventListener("click",e=>{const target=e.target.closest("[data-action]");if(target)handleAction(target);if(e.target.id==="finishEarly")finishSession("interrupted");if(e.target.id==="finishCompleted")finishSession("completed");if(e.target.id==="testSoundBtn")testSound();});
    // Aggiorna le altre serie mentre si modifica la prima, senza rerender che chiuderebbe la tastiera iOS.
    document.addEventListener("input",e=>{
      const t=e.target;
      if(t.dataset.action!=="log-weight" && t.dataset.action!=="log-reps") return;
      const s=state.session,ei=Number(t.dataset.ei),si=Number(t.dataset.si),ex=s?.exercises[ei],set=ex?.setsLog[si];
      if(!set || si!==0) return;
      const field=t.dataset.action==="log-weight"?"weight":"reps";
      const raw=t.value;
      const value=raw==="" ? "" : (field==="weight"?Math.max(0,Number(raw)||0):Math.max(1,Number(raw)||1));
      set[field]=value;
      ex[field]=value;
      ex.setsLog.forEach((other,index)=>{
        if(index===0)return;
        other[field]=value;
        const peer=$(`[data-action="log-${field==="weight"?"weight":"reps"}"][data-ei="${ei}"][data-si="${index}"]`);
        if(peer && document.activeElement!==peer) peer.value=raw;
      });
      persist();
    });
    document.addEventListener("change",e=>{
      const t=e.target;
      if(t.dataset.action==="complete-set")completeSet(Number(t.dataset.ei),Number(t.dataset.si),t.checked);
      else if(t.dataset.action==="log-weight"||t.dataset.action==="log-reps"){
        const s=state.session,ei=Number(t.dataset.ei),si=Number(t.dataset.si),ex=s?.exercises[ei],set=ex?.setsLog[si];
        if(set){
          const field=t.dataset.action==="log-weight"?"weight":"reps";
          set[field]=field==="weight"?Math.max(0,Number(t.value)||0):Math.max(1,Number(t.value)||1);
          // Editing set 1 updates every planned set; editing later sets changes only that set.
          if(si===0){
            ex[field]=set[field];
            ex.setsLog.forEach((other,index)=>{if(index>0)other[field]=set[field];});
          }
          persist();
          if(si===0){
            renderSession();
            showToast(field==="weight"?"Carico aggiornato in tutte le serie.":"Ripetizioni aggiornate in tutte le serie.");
          }
        }
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
