'use strict';
// Cache layout and DOM references. Scroll handlers only schedule one frame.
const $=s=>document.querySelector(s);
if(!location.hash||location.hash==='#entrance')scrollTo({top:0,behavior:'instant'});
const ui={journey:$('#journey'),facade:$('#facade'),door:$('#door'),room:$('.room'),intro:$('.intro'),concept:$('.concept'),fill:$('#progressFill'),percent:$('#percentage'),label:$('#chapterLabel'),cue:$('#sceneCue'),menu:$('#menu'),menuButton:$('#menuButton'),motion:$('#motionButton')};
const media=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=media.matches;try{const saved=localStorage.getItem('valentina-motion');if(saved!==null)reduced=saved==='reduced';}catch{}
let frame=0,travel=1,pageTravel=1,lastChapter='',lastPercent=-1,lastPhase=-1;
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
function queue(){if(!frame)frame=requestAnimationFrame(render)}
function measure(){travel=Math.max(1,ui.journey.offsetHeight-innerHeight);pageTravel=Math.max(1,document.documentElement.scrollHeight-innerHeight);queue()}
function sectionVisible(el,opacity){el.style.opacity=opacity;const active=opacity>.55;if(el.inert===active)el.inert=!active;el.classList.toggle('active',active)}
function render(){frame=0;const y=scrollY,p=clamp(y/travel),phase=p<.58?0:1;
 if(y<=travel+innerHeight){const open=ease(.025,.28,p),push=ease(.25,.57,p);ui.door.style.transform=reduced?"none":`translate3d(${-open*112}%,0,0)`;ui.facade.style.transform=reduced?'none':`scale(${1+push*6.4})`;ui.facade.style.opacity=1-ease(.48,.59,p);ui.facade.style.visibility=p>=.59?'hidden':'visible';ui.room.style.transform=reduced?'none':`scale(${1+push*.06})`;sectionVisible(ui.intro,1-ease(.015,.16,p));sectionVisible(ui.concept,ease(.58,.69,p));}
 if(phase!==lastPhase){ui.cue.textContent=phase?'KEEP SCROLLING TO EXPLORE':'SCROLL TO OPEN';lastPhase=phase;}
 const progress=clamp(y/pageTravel),percent=Math.round(progress*100);ui.fill.style.transform=`scaleX(${progress})`;if(percent!==lastPercent){ui.percent.textContent=String(percent).padStart(2,'0')+'%';lastPercent=percent;}
 const chapter=y<travel*.56?'01 — THE ENTRANCE':y<sectionTops.details-150?'02 — THE ROOM WITHIN':y<sectionTops.reference-150?'03 — THE COMPOSITION':y<sectionTops.contact-150?'04 — THE MAKERS':'05 — THE NEXT POSSIBILITY';if(chapter!==lastChapter){ui.label.textContent=chapter;lastChapter=chapter;}
 const dark=y>sectionTops.reference-70&&y<sectionTops.film-70||y>sectionTops.contact-70;document.body.classList.toggle('dark-section',dark);document.body.classList.toggle('content-mode',y>travel+innerHeight-90);
}
const sectionTops={details:0,reference:0,film:0,questions:0,contact:0};
function layout(){for(const key in sectionTops){const el=key==='film'?$('.workshop-film'):key==='questions'?$('.questions'):$('#'+key);sectionTops[key]=el.getBoundingClientRect().top+scrollY;}measure()}
addEventListener('scroll',queue,{passive:true});addEventListener('resize',layout,{passive:true});new ResizeObserver(layout).observe(document.body);
function closeMenu(returnFocus=false){ui.menu.hidden=true;ui.menuButton.setAttribute('aria-expanded','false');if(returnFocus)ui.menuButton.focus({preventScroll:true})}
ui.menuButton.addEventListener('click',()=>{ui.menu.hidden=!ui.menu.hidden;ui.menuButton.setAttribute('aria-expanded',String(!ui.menu.hidden));if(!ui.menu.hidden)ui.menu.querySelector('a').focus({preventScroll:true})});
document.addEventListener('click',e=>{if(!ui.menu.hidden&&!ui.menu.contains(e.target)&&!ui.menuButton.contains(e.target))closeMenu()});
function navigate(id,updateHistory=true,instant=false){const target=document.getElementById(id);if(!target)return;const top=id==='entrance'?0:id==='concept'?travel*.78:target.getBoundingClientRect().top+scrollY-85;closeMenu();if(updateHistory)history.pushState(null,'','#'+id);scrollTo({top,behavior:reduced||instant?'instant':'smooth'});if(id!=='concept'&&id!=='entrance'){target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();navigate(link.hash.slice(1))}));addEventListener('popstate',()=>navigate(location.hash.slice(1)||'entrance',false));addEventListener('hashchange',()=>navigate(location.hash.slice(1)||'entrance',false));
addEventListener('keydown',e=>{if(e.key==='Escape'&&!ui.menu.hidden)closeMenu(true)});
function applyMotion(){const art=$('.art'),src=reduced?'door.svg':'door-intro.svg';if(art.getAttribute('src')!==src)art.src=src;document.body.classList.toggle('reduced-motion',reduced);ui.motion.setAttribute('aria-pressed',String(reduced));ui.motion.textContent=reduced?'Motion reduced':'Reduce motion';queue()}
ui.motion.addEventListener('click',()=>{reduced=!reduced;try{localStorage.setItem('valentina-motion',reduced?'reduced':'full')}catch{}applyMotion()});media.addEventListener('change',e=>{reduced=e.matches;applyMotion()});
const details={color:{text:'Bold frames and circular forms turn the sliding panel into an expressive piece of furniture. The original photograph reveals how each color finds its place.',caption:'COLOR & COMPOSITION'},depth:{text:'Books sit within raised frames. Overlapping timber shapes give the surface depth, catching light and casting shadows across the panel.',caption:'SHELVES & DETAILS'},passage:{text:'Beyond the sculptural surface is a room. The concealed sliding panel brings storage and a passage together in one piece of bespoke woodwork.',caption:'A CONCEALED PASSAGE'}};
const tabs=[...document.querySelectorAll('[data-detail]')];function chooseTab(tab){tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});const key=tab.dataset.detail;$('#detailPanel').setAttribute('aria-labelledby',tab.id);$('#detailText').textContent=details[key].text;$('#drawingCaption').textContent=details[key].caption;$('.detail-figure').dataset.view=key;}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>chooseTab(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%tabs.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();chooseTab(tabs[next]);tabs[next].focus()}})});
const viewer=$('#viewer');function view(kind){const workshop=kind==='original';$('#viewerTitle').textContent=workshop?'Inside the workshop':'The hidden bookshelf door';$('#viewerImage').src=workshop?'workshop.webp':'reference.webp';$('#viewerImage').alt=workshop?'Manifattura Ravennate workshop in Ravenna':'Original photograph of the hidden bookshelf door';$('#viewerCaption').textContent=workshop?'Photography: Manifattura Ravennate.':'Product photograph supplied for this project.';viewer.showModal();document.body.classList.add('viewer-open')}
$('#inspectButton').addEventListener('click',()=>view('drawing'));$('#photoButton').addEventListener('click',()=>view('original'));$('#closeViewer').addEventListener('click',()=>viewer.close());viewer.addEventListener('close',()=>document.body.classList.remove('viewer-open'));viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500)}
$('#shareButton').addEventListener('click',async()=>{const url=location.origin+location.pathname;try{await navigator.clipboard.writeText(url);toast('Project link copied. Access follows the site’s sharing settings.')}catch(e){if(e.name!=='AbortError')toast('Copy the project URL from your browser’s address bar.')}});
$('#printButton').addEventListener('click',()=>window.print());$('#year').textContent=new Date().getFullYear();
applyMotion();layout();render();document.body.classList.add('scene-ready');document.fonts.ready.then(layout);addEventListener('load',()=>{layout();navigate(location.hash.slice(1)||'entrance',false,true)},{once:true});




