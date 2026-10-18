"use strict";
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const saved = (key, fallback) => { try { return JSON.parse(localStorage.getItem("sonicstriker_"+key)) ?? fallback; } catch { return fallback; } };
  const store = (key, value) => { try { localStorage.setItem("sonicstriker_"+key, JSON.stringify(value)); } catch {} };
  const basePlayers = [
    {id:"gk",name:"Academy Keeper",pos:"GK",ovr:64,cost:0,pace:45,skill:"Reflexes",owned:true},
    {id:"cb",name:"Defensive Anchor",pos:"CB",ovr:63,cost:0,pace:55,skill:"Strength",owned:true},
    {id:"cm",name:"Midfield Engine",pos:"CM",ovr:62,cost:0,pace:66,skill:"Passing",owned:true},
    {id:"lw",name:"Wing Runner",pos:"LW",ovr:61,cost:0,pace:79,skill:"Pace",owned:true},
    {id:"st",name:"Academy Striker",pos:"ST",ovr:60,cost:0,pace:70,skill:"Finishing",owned:true},
    {id:"lb",name:"Quick Fullback",pos:"LB",ovr:65,cost:180,pace:76,skill:"Recovery",owned:false},
    {id:"cb2",name:"Wall Defender",pos:"CB",ovr:68,cost:260,pace:59,skill:"Tackling",owned:false},
    {id:"cdm",name:"Ball Winner",pos:"CDM",ovr:67,cost:240,pace:62,skill:"Interceptions",owned:false},
    {id:"cam",name:"Creative Playmaker",pos:"CAM",ovr:70,cost:350,pace:71,skill:"Vision",owned:false},
    {id:"rw",name:"Soundwave Winger",pos:"RW",ovr:72,cost:420,pace:88,skill:"Dribbling",owned:false},
    {id:"st2",name:"Power Finisher",pos:"ST",ovr:74,cost:500,pace:74,skill:"Shooting",owned:false},
    {id:"rb",name:"Rapid Rightback",pos:"RB",ovr:66,cost:210,pace:78,skill:"Speed",owned:false}
  ];
  const positions = ["GK","CB","LB","RB","LWB","RWB","CDM","CM","CAM","LM","RM","LW","RW","CF","ST"];
  const nameA = ["Thunder","Sonic","Neon","Blaze","Echo","Nova","Storm","Vortex","Pulse","Comet","Shadow","Rapid","Pixel","Phantom","Orbit","Turbo","Frost","Solar","Rogue","Velocity","Prism","Falcon","Rhythm","Titan","Aero","Cobalt","Midnight","Rocket","Voltage","Wild"];
  const nameB = ["Striker","Maestro","Wall","Winger","Engine","Finisher","Playmaker","Guardian","Sprinter","Artist","Captain","Ace","Creator","Sweeper","Hunter","Wizard","Sentinel","Dribbler","Anchor","Ranger","Falcon","Magician","Commander","Dynamo","Sniper","Architect","Glider","Breaker","Keeper","Pioneer"];
  const tierNames = ["Rising","Prime","Elite","Icon","Ultimate"];
  const generatedPlayers = Array.from({length:1200},(_,i)=>{
    const n=i+1, tier=tierNames[Math.min(4,Math.floor((n-1)/240))];
    const ovr=58+((n*17+Math.floor(n/9)*7)%42);
    const pos=positions[(n*7+Math.floor(n/11))%positions.length];
    const pace=42+((n*13)%58);
    return {id:"SS-GEN-"+String(n).padStart(4,"0"),name:nameA[(n*3)%nameA.length]+" "+nameB[(n*7)%nameB.length]+" "+String(Math.floor((n-1)/30)+1),pos,ovr,cost:Math.max(180,ovr*10),pace,skill:["Pace","Passing","Finishing","Reflexes","Tackling","Vision","Dribbling","Strength"][(n*5)%8],tier,version:tier,owned:false};
  });
  const catalogPlayers = [...basePlayers,...generatedPlayers];
  let players = saved("players", catalogPlayers);
  catalogPlayers.forEach(p => { if (!players.some(x => x.id === p.id)) players.push(p); });
  const formations = {
    "4-3-3":["GK","LB","CB","CB","RB","CM","CM","CM","LW","ST","RW"],
    "4-4-2":["GK","LB","CB","CB","RB","LM","CM","CM","RM","ST","ST"],
    "4-2-3-1":["GK","LB","CB","CB","RB","CDM","CDM","LW","CAM","RW","ST"],
    "3-5-2":["GK","CB","CB","CB","LWB","CDM","CM","CM","RWB","ST","ST"],
    "3-4-3":["GK","CB","CB","CB","LM","CM","CM","RM","LW","ST","RW"],
    "5-3-2":["GK","LWB","CB","CB","CB","RWB","CM","CM","CAM","ST","ST"],
    "4-1-2-1-2":["GK","LB","CB","CB","RB","CDM","CM","CM","CAM","ST","ST"],
    "4-3-2-1":["GK","LB","CB","CB","RB","CM","CDM","CM","CAM","CAM","ST"],
    "5-2-3":["GK","LWB","CB","CB","CB","RWB","CM","CM","LW","ST","RW"],
    "4-5-1":["GK","LB","CB","CB","RB","LM","CM","CDM","CM","RM","ST"]
  };
  let formation = saved("formation","4-3-3");
  let selectedMode = "quick";
  let marketPage = 0;
  let coins = saved("coins",500), wins = saved("wins",0), goals = saved("goals",0), earned = saved("earned",0);
  let match = {running:false, seconds:0, home:0, away:0, lastGoal:0, frame:0, x:0.5, y:0.68, ballX:0.5, ballY:0.51, ballVx:0, ballVy:0, direction:{x:0,y:0}, player:0};
  let canvas, ctx, canvasW=700, canvasH=430, anim=0, timer=null, recognition=null;
  const owned = () => players.filter(p=>p.owned);
  const teamOvr = () => Math.round(owned().reduce((a,p)=>a+p.ovr,0)/Math.max(1,owned().length));
  function persist(){store("players",players);store("coins",coins);store("wins",wins);store("goals",goals);store("earned",earned);updateStats();}
  function updateStats(){
    ["coinCount","squadCoins"].forEach(id=>{const el=$("#"+id);if(el)el.textContent=coins;});
    ["teamOvr","squadOvr"].forEach(id=>{const el=$("#"+id);if(el)el.textContent=teamOvr();});
    if($("#ownedCount"))$("#ownedCount").textContent=owned().length;
    if($("#careerWins"))$("#careerWins").textContent=wins;
    if($("#careerGoals"))$("#careerGoals").textContent=goals;
    if($("#careerEarned"))$("#careerEarned").textContent=earned;
    renderMiniPitch();
    const form=$("#formationSelect");if(form)form.value=formation;
  }
  function renderMiniPitch(){const pitch=$("#miniPitch");if(!pitch)return;pitch.innerHTML="";const labels=formations[formation]||formations["4-3-3"];const coords=[[50,83],[18,68],[39,72],[61,72],[82,68],[25,49],[43,54],[57,54],[75,49],[38,29],[62,29]];labels.forEach((label,i)=>{const el=document.createElement("span");el.className="mini-player";el.textContent=label;el.style.left=coords[i][0]+"%";el.style.top=coords[i][1]+"%";pitch.appendChild(el);});const form=$("#formationSelect");if(form)form.value=formation;}
  function renderSquad(){const grid=$("#squadGrid"),market=$("#marketGrid");if(!grid||!market)return;grid.innerHTML="";market.innerHTML="";
    players.filter(p=>p.owned).forEach(p=>grid.appendChild(playerCard(p,true)));
    const query=($("#playerSearch")?.value||"").trim().toLowerCase(),pos=$("#positionFilter")?.value||"ALL",tier=$("#tierFilter")?.value||"ALL";
    const available=players.filter(p=>!p.owned&&(!query||p.name.toLowerCase().includes(query)||p.id.toLowerCase().includes(query))&&(pos==="ALL"||p.pos===pos)&&(tier==="ALL"||(p.tier||"Academy")===tier));
    const pages=available.slice(0,(marketPage+1)*24);pages.forEach(p=>market.appendChild(playerCard(p,false)));
    const count=$("#marketCount");if(count)count.textContent="Showing "+pages.length+" of "+available.length+" available · "+players.length+" total cards";
    const more=$("#loadMorePlayers");if(more)more.hidden=pages.length>=available.length;
    updateStats();
  }
  function playerCard(p,isOwned){const card=document.createElement("article");card.className="player-card"+(isOwned?" owned":"")+" tier-"+String(p.tier||"Academy").toLowerCase().replace(/[^a-z]/g,"");card.innerHTML='<span class="position"></span><span class="rating"></span><span class="card-tier"></span><h3></h3><p></p><div class="stats"><span></span><span></span></div>'+(isOwned?'<label class="position-label">PLAYING POSITION<select class="position-select" aria-label="Change player position"></select></label>':'')+'<button class="'+(isOwned?"secondary-btn":"primary-btn")+'"></button>';
    $(".position",card).textContent=p.pos;$(".rating",card).textContent=p.ovr;$(".card-tier",card).textContent=(p.tier||"Academy")+" · "+(p.version||"Base");$(".player-card h3",card).textContent=p.name;$(".player-card p",card).textContent=p.skill+" specialist";$$(".stats span",card)[0].textContent="PACE "+p.pace;$$(".stats span",card)[1].textContent=isOwned?(p.ovr>=99?"MAX RATING":"UPGRADE ◆ "+Math.max(100,p.ovr*8)):"◆ "+p.cost;
    if(isOwned){const select=$(".position-select",card);positions.forEach(pos=>{const option=document.createElement("option");option.value=pos;option.textContent=pos;select.appendChild(option);});select.value=positions.includes(p.pos)?p.pos:"CM";select.addEventListener("change",()=>{p.pos=select.value;persist();renderMiniPitch();});}
    const btn=$("button",card);
    if(isOwned){btn.textContent=p.ovr>=99?"MAXED OUT":"UPGRADE +1";btn.disabled=p.ovr>=99;btn.addEventListener("click",()=>{const cost=Math.max(100,p.ovr*8);if(p.ovr>=99)return;if(coins<cost){alert("You need "+cost+" coins to upgrade this card. Play matches to earn more.");return;}coins-=cost;p.ovr=Math.min(99,p.ovr+1);p.pace=Math.min(99,p.pace+1);p.version="Upgraded";persist();renderSquad();});}
    else btn.addEventListener("click",()=>{if(coins<p.cost){alert("Not enough coins yet. Play a match to earn more.");return;}coins-=p.cost;p.owned=true;persist();renderSquad();});
    return card;
  }
  function showView(name){const valid=["home","match","squad","career","online","youtube"].includes(name)?name:"home";$$(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+valid));$$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===valid));$("#pageTitle").textContent=valid.toUpperCase()==="HOME"?"DASHBOARD":valid.replace(/^./,c=>c.toUpperCase()).toUpperCase();$(".sidebar").classList.remove("open");if(valid==="match")requestAnimationFrame(resizeCanvas);if(valid==="squad")renderSquad();}
  $$("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
  $("#menuToggle").addEventListener("click",()=>$(".sidebar").classList.toggle("open"));
  $("#formationSelect").addEventListener("change",e=>{formation=e.target.value;store("formation",formation);renderMiniPitch();});
  ["playerSearch","positionFilter","tierFilter"].forEach(id=>$("#"+id).addEventListener(id==="playerSearch"?"input":"change",()=>{marketPage=0;renderSquad();}));
  $("#loadMorePlayers").addEventListener("click",()=>{marketPage++;renderSquad();});

  function resizeCanvas(){if(!canvas)return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);canvasW=rect.width;canvasH=rect.height;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  function roundedRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
  function drawPlayer(x,y,color,label,selected=false){ctx.save();ctx.shadowColor=selected?"#d5ff8c":"#0007";ctx.shadowBlur=selected?14:5;ctx.beginPath();ctx.arc(x,y,canvasW<500?8:10,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.lineWidth=selected?3:1.5;ctx.strokeStyle=selected?"#f0ffd4":"#ffffffbb";ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle="#071009";ctx.font="bold 8px Oxanium, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(label,x,y+.5);ctx.restore();}
  function draw(){if(!ctx||!canvasW||!canvasH)return;const w=canvasW,h=canvasH;ctx.clearRect(0,0,w,h);ctx.fillStyle="#1c5a32";ctx.fillRect(0,0,w,h);
    for(let i=0;i<8;i++){ctx.fillStyle=i%2?"#1c5a32":"#205f36";ctx.fillRect(0,i*h/8,w,h/8);}
    const pad=18;ctx.strokeStyle="#d4f2d2c9";ctx.lineWidth=1.5;ctx.strokeRect(pad,pad,w-pad*2,h-pad*2);ctx.beginPath();ctx.moveTo(w/2,pad);ctx.lineTo(w/2,h-pad);ctx.stroke();ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)*.105,0,Math.PI*2);ctx.stroke();ctx.strokeRect(w*.32,pad,w*.36,h*.15);ctx.strokeRect(w*.32,h-pad-h*.15,w*.36,h*.15);ctx.strokeRect(w*.42,pad,w*.16,h*.06);ctx.strokeRect(w*.42,h-pad-h*.06,w*.16,h*.06);
    // Opponent team
    [[.5,.23,"GK"],[.23,.28,"LB"],[.39,.31,"CB"],[.61,.31,"CB"],[.77,.28,"RB"],[.32,.43,"CM"],[.5,.39,"CM"],[.68,.43,"CM"],[.3,.18,"LW"],[.5,.14,"ST"],[.7,.18,"RW"]].forEach(([x,y,l])=>drawPlayer(x*w,y*h,"#f5f5f0",l));
    // User team; active player responds to joystick and keyboard.
    const spots=[[.5,.84,"GK"],[.2,.72,"LB"],[.4,.75,"CB"],[.6,.75,"CB"],[.8,.72,"RB"],[.32,.61,"CM"],[.5,.65,"CM"],[.68,.61,"CM"],[.25,.53,"LW"],[.5,.55,"ST"],[.75,.53,"RW"]];
    spots.forEach(([x,y,l],i)=>{let px=x*w,py=y*h;if(i===match.player){px=match.x*w;py=match.y*h;}drawPlayer(px,py,"#b7ff35",l,i===match.player);});
    // Ball shadow and ball
    const bx=match.ballX*w,by=match.ballY*h;ctx.beginPath();ctx.ellipse(bx+2,by+4,7,4,0,0,Math.PI*2);ctx.fillStyle="#0006";ctx.fill();ctx.beginPath();ctx.arc(bx,by,6,0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill();ctx.strokeStyle="#142017";ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.moveTo(bx-4,by-2);ctx.lineTo(bx+3,by+3);ctx.moveTo(bx+3,by-4);ctx.lineTo(bx-2,by+4);ctx.stroke();
    if(match.running){match.x=Math.max(.06,Math.min(.94,match.x+match.direction.x*.0028));match.y=Math.max(.08,Math.min(.92,match.y+match.direction.y*.0028));match.ballX+=match.ballVx;match.ballY+=match.ballVy;match.ballVx*=.982;match.ballVy*=.982;if(match.ballX<.04||match.ballX>.96)match.ballVx*=-.65;if(match.ballY<.05||match.ballY>.95)match.ballVy*=-.65;
      const dist=Math.hypot(match.x-match.ballX,match.y-match.ballY);if(dist<.028&&match.frame%30===0){$("#pitchHint").textContent="You are near the ball — PASS or SHOOT!";}else if(dist>.04&&match.frame%50===0){$("#pitchHint").textContent="Move your player towards the ball using the joystick.";}
    }
  }
  function loop(){match.frame++;draw();anim=requestAnimationFrame(loop);}
  function startMatch(){match.mode=selectedMode;match.running=true;match.seconds=0;match.home=0;match.away=0;match.lastGoal=Date.now();match.x=.5;match.y=match.mode==="goalkeeper"?.88:.68;match.ballX=.5;match.ballY=match.mode==="penalty"?.27:match.mode==="freekick"?.35:.51;match.ballVx=0;match.ballVy=0;$("#homeScore").textContent="0";$("#awayScore").textContent="0";$("#matchClock").textContent="00:00";const labels={quick:"Full match started! Move to the ball, then pass or shoot.",tournament:"Tournament round started! Win to claim the next round.",penalty:"Penalty shootout! Aim carefully and shoot.",freekick:"Free kick! Line up your shot and strike.",goalkeeper:"Goalkeeper challenge! Move your keeper and use dive controls.",training:"Skill training started. Practice movement, passing and shooting."};$("#pitchHint").textContent=labels[match.mode]||labels.quick;if(timer)clearInterval(timer);timer=setInterval(()=>{if(!match.running)return;match.seconds++;$("#matchClock").textContent=String(Math.floor(match.seconds/60)).padStart(2,"0")+":"+String(match.seconds%60).padStart(2,"0");const limit=match.mode==="penalty"?15:match.mode==="freekick"?30:match.mode==="training"?60:90;if(match.seconds>=limit)finishMatch();},1000);resizeCanvas();}
  function finishMatch(){if(!match.running)return;match.running=false;if(match.home>match.away)wins++;const reward=100+match.home*25;coins+=reward;earned+=reward;persist();$("#pitchHint").textContent="Full time! You earned "+reward+" coins. Start again for another match.";if(timer)clearInterval(timer);timer=null;}
  function kick(kind){if(!match.running){$("#pitchHint").textContent="Press START / RESTART MATCH first.";return;}if(match.mode==="goalkeeper"){const left=kind==="pass"||kind==="left";match.x=Math.max(.15,Math.min(.85,match.x+(left?-.16:.16)));match.ballX=Math.max(.08,Math.min(.92,match.ballX+(left?-.12:.12)));$("#pitchHint").textContent=Math.random()>.32?"SAVE! Great reaction, keeper.":"The shot got past you — try the other side!";draw();return;}const d=Math.hypot(match.x-match.ballX,match.y-match.ballY);if(d>.18){$("#pitchHint").textContent="Move closer to the ball before you "+kind+".";match.direction={x:Math.sign(match.ballX-match.x),y:Math.sign(match.ballY-match.y)};return;}const dx=.5-match.ballX,dy=.08-match.ballY;const mag=Math.hypot(dx,dy)||1;const power=kind==="shoot"?.055:.035;match.ballVx=(dx/mag)*power+(Math.random()-.5)*.008;match.ballVy=(dy/mag)*power;if(kind==="shoot"){const chance=match.mode==="penalty"?.68:match.mode==="freekick"?.48:match.mode==="training"?.9:.64;if(match.ballY<.4&&Math.random()<chance){match.home++;goals++;$("#homeScore").textContent=match.home;$("#pitchHint").textContent=match.mode==="penalty"?"GOAL! Penalty scored!":match.mode==="freekick"?"WHAT A FREE KICK!":"GOOOAL! Nice finish!";}else{$("#pitchHint").textContent="Shot taken! Chase the rebound.";}}else{$("#pitchHint").textContent=kind==="through ball"?"Through ball played! Run onto it.":"Pass played! Move to the ball.";}}
  function setMode(mode){selectedMode=mode;$("[data-mode]").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));const p=$("#passBtn"),s=$("#shootBtn");if(mode==="goalkeeper"){p.innerHTML="↙ <span>DIVE LEFT</span>";s.innerHTML="↘ <span>DIVE RIGHT</span>";}else{p.innerHTML="↗ <span>PASS</span>";s.innerHTML="◉ <span>SHOOT</span>";}$("#pitchHint").textContent="Selected mode: "+mode.replace(/(^|\s)\S/g,m=>m.toUpperCase())+". Press START / RESTART MATCH when ready.";}$("[data-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));$("#passBtn").addEventListener("click",()=>kick("pass"));$("#shootBtn").addEventListener("click",()=>kick("shoot"));$("#switchBtn").addEventListener("click",()=>{match.player=(match.player+1)%11;const p=[[.5,.84],[.2,.72],[.4,.75],[.6,.75],[.8,.72],[.32,.61],[.5,.65],[.68,.61],[.25,.53],[.5,.55],[.75,.53]][match.player];match.x=p[0];match.y=p[1];$("#pitchHint").textContent="Switched to player "+(match.player+1)+". Move towards the ball.";draw();});$("#startMatchBtn").addEventListener("click",startMatch);
  const keyDirections={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
  window.addEventListener("keydown",e=>{if(keyDirections[e.key]){match.direction={x:keyDirections[e.key][0],y:keyDirections[e.key][1]};if($("#view-match").classList.contains("active"))e.preventDefault();}if(e.key===" "&&$("#view-match").classList.contains("active")){e.preventDefault();kick("shoot");}});
  window.addEventListener("keyup",e=>{if(keyDirections[e.key])match.direction={x:0,y:0};});
  // Drag joystick, with normalized vector driving the active player.
  const joystick=$("#joystick"),knob=$("#joyKnob");let joyActive=false;
  function moveJoy(e){if(!joyActive)return;const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,limit=r.width*.32;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy);if(len>limit){dx=dx/len*limit;dy=dy/len*limit;}knob.style.left=(50+dx/r.width*100)+"%";knob.style.top=(50+dy/r.height*100)+"%";match.direction={x:dx/limit,y:dy/limit};}
  joystick.addEventListener("pointerdown",e=>{joyActive=true;joystick.setPointerCapture(e.pointerId);moveJoy(e);});joystick.addEventListener("pointermove",moveJoy);function endJoy(){joyActive=false;knob.style.left="50%";knob.style.top="50%";match.direction={x:0,y:0};}joystick.addEventListener("pointerup",endJoy);joystick.addEventListener("pointercancel",endJoy);
  $("#voiceBtn").addEventListener("click",()=>{const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SpeechRecognition){$("#voiceStatus").textContent="Voice recognition is not supported in this browser. Use the touch buttons instead.";return;}if(recognition){recognition.stop();recognition=null;$("#voiceBtn").textContent="🎙 ENABLE VOICE";$("#voiceStatus").textContent="Voice controls stopped.";return;}recognition=new SpeechRecognition();recognition.lang="en-US";recognition.continuous=true;recognition.interimResults=false;recognition.onresult=e=>{const text=e.results[e.results.length-1][0].transcript.toLowerCase();$("#voiceStatus").textContent='Heard: "'+text+'"';if(text.includes("through ball"))kick("through ball");else if(text.includes("pass"))kick("pass");else if(text.includes("shoot")||text.includes("shot"))kick("shoot");else if(text.includes("switch"))$("#switchBtn").click();else if(text.includes("move up"))match.direction={x:0,y:-1};};recognition.onerror=e=>{$("#voiceStatus").textContent="Voice error: "+e.error+". Check microphone permission.";};recognition.onend=()=>{if(recognition){$("#voiceBtn").textContent="🎙 STOP VOICE";}};try{recognition.start();$("#voiceBtn").textContent="■ STOP VOICE";$("#voiceStatus").textContent="Listening… say pass, shoot, through ball or switch player.";}catch(err){$("#voiceStatus").textContent="Could not start microphone. Check browser permissions.";recognition=null;}});
  // Backend health check is separate from a multiplayer session.
  const urlInput=$("#serverUrl"),serverMessage=$("#serverMessage");
  urlInput.value=saved("serverUrl",window.SONICSTRIKER_CONFIG?.backendUrl || "");
  $("#saveServerBtn").addEventListener("click",()=>{store("serverUrl",urlInput.value.trim());serverMessage.textContent="Backend URL saved on this device.";});
  $("#connectServerBtn").addEventListener("click",async()=>{const base=urlInput.value.trim().replace(/\/$/,"");if(!base){serverMessage.textContent="Enter your backend URL first.";return;}serverMessage.textContent="Checking /health…";$("#onlineBadge").textContent="CHECKING";try{const res=await fetch(base+"/health",{method:"GET",mode:"cors"});if(!res.ok)throw new Error("HTTP "+res.status);const data=await res.json();$("#serverStatus").textContent="Backend reachable";$("#onlineBadge").textContent="CONNECTED";serverMessage.textContent="Health check passed: "+JSON.stringify(data);store("serverUrl",base);}catch(e){$("#serverStatus").textContent="Server not connected";$("#onlineBadge").textContent="OFFLINE";serverMessage.textContent="Could not verify server. Check URL, server status and CORS settings. "+e.message;}});
  $("#loadVideoBtn").addEventListener("click",()=>{let input=$("#youtubeId").value.trim(),id=input;const matchUrl=input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);if(matchUrl)id=matchUrl[1];if(!/^[\w-]{11}$/.test(id)){alert("Enter a valid YouTube video ID or URL.");return;}$("#videoFrame").innerHTML="";const frame=document.createElement("iframe");frame.src="https://www.youtube-nocookie.com/embed/"+encodeURIComponent(id);frame.title="YouTube football video";frame.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";frame.allowFullscreen=true;$("#videoFrame").appendChild(frame);});
  canvas=$("#gameCanvas");ctx=canvas.getContext("2d");window.addEventListener("resize",resizeCanvas);renderSquad();updateStats();resizeCanvas();loop();
})();