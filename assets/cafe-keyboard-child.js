/* Café V73 — keyboard-first viewport selection for same-origin embedded portfolio pages.
   Keeps real browser focus and Tab behavior; virtual selection never calls focus() while scrolling. */
(()=>{
'use strict';
if(window===window.parent)return;
const STYLE=document.createElement('style');STYLE.textContent=`
.cafe-keyboard-selected{outline:3px solid #7650bc!important;outline-offset:3px!important;box-shadow:0 0 0 5px rgba(118,80,188,.10)!important;}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}}
`;document.head.append(STYLE);
const selector='a[href],button:not([disabled]),input:not([type="hidden"]),select,textarea,[role="button"],[role="link"],[role="slider"],[tabindex]:not([tabindex="-1"])';
let virtual=null,manual=false,lastY=-1,lastChange=0,queued=false,observer;
const typing=el=>el?.matches?.('input,textarea,select,[contenteditable="true"],[role="textbox"]');
const activeDialog=()=>[...document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]')].filter(el=>el.getClientRects().length).pop()||null;
function eligible(el){if(el.matches('[disabled],[aria-disabled="true"],[hidden],[inert]'))return false;if(!el.getClientRects().length)return false;const st=getComputedStyle(el);if(st.visibility==='hidden'||st.display==='none')return false;return true;}
function clear(){if(virtual)virtual.classList.remove('cafe-keyboard-selected');virtual=null;}
function choose(el){if(virtual===el)return;clear();virtual=el;if(el)el.classList.add('cafe-keyboard-selected');lastChange=performance.now();}
function calculate(){queued=false;const dialog=activeDialog(),root=dialog||document.documentElement;
 const r=dialog?dialog.getBoundingClientRect():{top:0,bottom:innerHeight,left:0,right:innerWidth,width:innerWidth,height:innerHeight};
 const height=r.bottom-r.top;const lo=r.top+height*.30,hi=r.top+height*.70,cy=r.top+height*.5,cx=(r.left+r.right)/2;
 const els=[...root.querySelectorAll(selector)].filter(eligible);let best=null,dist=Infinity;
 for(const el of els){const b=el.getBoundingClientRect();const y=Math.max(b.top,Math.min(cy,b.bottom));if(b.bottom<lo||b.top>hi||b.right<r.left||b.left>r.right)continue;
 const d=Math.abs(y-cy)+Math.abs((b.left+b.right)/2-cx)*.12;
 if(d<dist){dist=d;best=el;}}
 if(manual&&virtual&&eligible(virtual))return;
 if(best!==virtual){if(virtual&&best&&performance.now()-lastChange<120){const current=virtual.getBoundingClientRect();if(current.bottom>=lo-12&&current.top<=hi+12)return;}choose(best);}
}
const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(calculate)}};
const onScroll=()=>{manual=false;schedule()};addEventListener('scroll',onScroll,true);addEventListener('resize',schedule);
document.addEventListener('focusin',e=>{if(eligible(e.target)&&e.target.matches(selector)){manual=true;choose(e.target)}},true);
const mo=new MutationObserver(()=>schedule());mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','open','aria-hidden']});
function scrollAmount(key){const d=document.scrollingElement||document.documentElement;let scroller=d;const focused=document.activeElement;
 if(focused&&focused!==document.body){let node=focused.parentElement;while(node&&node!==document.body){const st=getComputedStyle(node);if(/auto|scroll/.test(st.overflowY)&&node.scrollHeight>node.clientHeight+8){scroller=node;break;}node=node.parentElement;}}
 const h=scroller===d?innerHeight:scroller.clientHeight;
 const delta=key==='ArrowDown'?68:key==='ArrowUp'?-68:key==='PageDown'?h*.86:key==='PageUp'?-h*.86:null;
 if(delta!==null){scroller.scrollBy({top:delta,behavior:'instant'});return true;}
 if(key==='Home'){scroller.scrollTo({top:0,behavior:'instant'});return true;}
 if(key==='End'){scroller.scrollTo({top:scroller.scrollHeight,behavior:'instant'});return true;}return false;
}
function isNative(el,key){if(!el||el===document.body)return false;if(typing(el)||el.matches('[role="slider"],input[type="range"],[role="listbox"],[role="combobox"]'))return true;
 if(el.closest('.comparison-slider,.nu-comparison,[data-comparison]')&&['ArrowLeft','ArrowRight'].includes(key))return true;return false;}
function handleEscape(e){const dlg=activeDialog();if(dlg){e.preventDefault();e.stopImmediatePropagation();if(typeof dlg.close==='function')dlg.close();else dlg.querySelector('[aria-label*="Close" i],button')?.click();schedule();return true;}
 // Close the outer portfolio layer only when there is no nested viewer.
 e.preventDefault();e.stopImmediatePropagation();try{if(parent!==window&&typeof parent.cafeFocusCaseStudyToolbar==='function'){
   parent.cafeFocusCaseStudyToolbar();return true;
 }}catch(_){}
 parent.postMessage({type:'cafe-keyboard-escape'},location.origin);return true;}
addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey||e.isComposing)return;
 const k=e.key,real=document.activeElement;
 if(k==='Escape'){handleEscape(e);return;}
 if(typing(real))return;
 if(k==='Tab'){if(handleComparisonTab(e))return;if(handleSectionTab(e))return;manual=true;return;}
 if(activeDialog()&&['ArrowLeft','ArrowRight'].includes(k))return;
  if(handleHorizontalFocus(e))return;
 if(isNative(real,k))return;
 if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(k)){e.preventDefault();e.stopImmediatePropagation();manual=false;scrollAmount(k);schedule();return;}
 if((k==='Enter'||k===' ')&&!e.repeat){if(real&&real!==document.body&&real!==document.documentElement&&real.matches(selector))return;
 if(virtual&&eligible(virtual)){e.preventDefault();e.stopImmediatePropagation();virtual.click();}}
},true);
// V76: Section-oriented Tab navigation for long case studies.
// Scrolling updates a virtual current section; real DOM focus only moves when Tab is pressed.
const isCaseStudy=()=>/\/work\/[^/]+\/\d+\/?(?:index\.html)?$/.test(location.pathname);
let sectionStops=[],currentSection=null,sectionRefreshQueued=false;
const sectionStyle=document.createElement('style');sectionStyle.id='cafe-case-section-navigation-style';
sectionStyle.textContent=`
.cafe-case-current-section > :is(h1,h2,h3),
.cafe-case-current-section :is(h1,h2,h3):first-child {
 text-decoration-color:#7650bc;
}
.cafe-case-section-focus{outline:3px solid #7650bc!important;outline-offset:5px!important;border-radius:2px}
`;
document.head.append(sectionStyle);
function refreshSections(){
 if(!isCaseStudy())return;
 const main=document.querySelector('main');if(!main)return;
 const sections=[...main.querySelectorAll('section')].filter(el=>!el.closest('section section')&&!el.closest('[hidden]')&&eligible(el));
 if(!sections.length)return;
 sectionStops=sections;
 for(const section of sectionStops){if(!section.hasAttribute('tabindex'))section.tabIndex=-1;}
}
function sectionAtViewport(){
 if(!isCaseStudy())return null;
 if(!sectionStops.length||sectionStops.some(el=>!el.isConnected))refreshSections();
 if(!sectionStops.length)return null;
 const center=innerHeight*.48;
 // Prefer the section containing the current reading position.
 let chosen=null,best=Infinity;
 for(const section of sectionStops){const r=section.getBoundingClientRect();if(r.height<2||r.bottom<0||r.top>innerHeight)continue;
  const distance=r.top<=center&&r.bottom>=center?0:Math.min(Math.abs(r.top-center),Math.abs(r.bottom-center));
  if(distance<best){best=distance;chosen=section;}
 }
 return chosen||currentSection||sectionStops[0];
}
function updateReadingSection(){
 sectionRefreshQueued=false;
 if(!isCaseStudy()||activeDialog())return;
 const next=sectionAtViewport();
 if(next===currentSection)return;
 if(currentSection)currentSection.classList.remove('cafe-case-current-section');
 currentSection=next;
 if(next)next.classList.add('cafe-case-current-section');
}
function scheduleReadingSection(){if(sectionRefreshQueued)return;sectionRefreshQueued=true;requestAnimationFrame(updateReadingSection)}
addEventListener('scroll',scheduleReadingSection,true);
addEventListener('resize',scheduleReadingSection);
document.addEventListener('DOMContentLoaded',()=>{refreshSections();scheduleReadingSection()}, {once:true});
function handleSectionTab(event){
 if(!isCaseStudy()||activeDialog()||typing(document.activeElement))return false;
 const active=document.activeElement;
 // Preserve standard Tab behavior for a genuinely focused, visible interactive widget.
 // After scrolling away from it, however, the viewport section takes priority.
 if(active&&active!==document.body&&active!==document.documentElement&&active.matches(selector)&&active!==currentSection){
   const rect=active.getBoundingClientRect();
   const visible=rect.bottom>0&&rect.top<innerHeight&&rect.width>0;
   if(visible&&active.closest('section')===sectionAtViewport())return false;
 }
 refreshSections();if(!sectionStops.length)return false;
 // Always derive the starting point from the visible section, not stale browser focus.
 const visible=sectionAtViewport();const index=Math.max(0,sectionStops.indexOf(visible));
 const nextIndex=Math.max(0,Math.min(sectionStops.length-1,index+(event.shiftKey?-1:1)));
 const target=sectionStops[nextIndex];
 if(!target)return false;
 event.preventDefault();event.stopImmediatePropagation();
 if(currentSection)currentSection.classList.remove('cafe-case-current-section','cafe-case-section-focus');
 currentSection=target;target.classList.add('cafe-case-current-section','cafe-case-section-focus');
 // Explicit Tab is the point at which real focus moves. Scrolling alone never calls focus().
 target.focus({preventScroll:true});
 target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 requestAnimationFrame(()=>target.classList.remove('cafe-case-section-focus'));
 manual=false;schedule();
 return true;
}

function handleComparisonTab(e){
 if(e.key!=='Tab'||activeDialog()||!isCaseStudy())return false;
 const current=document.activeElement;
 const cluster=current?.closest?.('.hs-comparison-section,.renewal-comparison,.comparison-slider,.nu-comparison,[data-comparison]');
 if(!cluster)return false;
 const nodes=[...document.querySelectorAll(selector)].filter(el=>eligible(el)&&el.getAttribute('tabindex')!=='-1'&&getComputedStyle(el).pointerEvents!=='none');
 const local=nodes.filter(el=>cluster.contains(el));
 if(!local.length)return false;
 // A comparison range is still a native input. Arrow Left/Right on it remain untouched.
 const i=nodes.indexOf(current), edge=e.shiftKey?local[0]:local[local.length-1];
 if(current!==edge)return false; // standard browser Tab through comparison controls
 const target=e.shiftKey?nodes[i-1]:nodes[i+1];
 if(!target||cluster.contains(target))return false;
 e.preventDefault();e.stopImmediatePropagation();
 manual=true;choose(target);target.focus({preventScroll:true});
 target.scrollIntoView({block:'nearest',behavior:'instant'});
 return true;
}

// V77: Left/Right navigate actual interactive elements from the current viewport.
function handleHorizontalFocus(e){
 if(activeDialog()||typing(document.activeElement))return false;
 const key=e.key;if(key!=='ArrowLeft'&&key!=='ArrowRight')return false;
 const active=document.activeElement;
 if(isNative(active,key))return false;
 const main=document.querySelector('main')||document.getElementById('cards')||document.querySelector('#app')||document.body;if(!main)return false;
 const all=[...main.querySelectorAll(selector)].filter(el=>eligible(el)&&el.getAttribute('tabindex')!=='-1'&&!el.closest('#cafeKeyboardFooter')&&getComputedStyle(el).pointerEvents!=='none');
 if(!all.length)return false;
 const visible=all.filter(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth});
 const center=innerHeight*.5;
 const near=(visible.length?visible:all).slice().sort((a,b)=>{
  const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
  return Math.abs((x.top+x.bottom)*.5-center)-Math.abs((y.top+y.bottom)*.5-center);
 })[0];
 const focusedIndex=all.indexOf(active),virtualIndex=all.indexOf(virtual);
 // A previously focused element outside the visible reading section should not steer navigation.
 let index=focusedIndex>=0&&visible.includes(active)?focusedIndex:virtualIndex>=0&&visible.includes(virtual)?virtualIndex:-1;
 const dir=key==='ArrowRight'?1:-1;
 let target;
 if(index<0){target=near;}else{target=all[Math.min(all.length-1,Math.max(0,index+dir))];}
 if(!target)return false;
 e.preventDefault();e.stopImmediatePropagation();
 manual=true;choose(target);
 target.focus({preventScroll:true});
 const rect=target.getBoundingClientRect();
 if(rect.top<12||rect.bottom>innerHeight-18)target.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 return true;
}

// Keyboard help is part of the embedded reading surface, not a second application toolbar.
function installKeyboardFooter(){
 if(document.getElementById('cafeKeyboardFooter'))return;
 const css=document.createElement('style');css.id='cafe-keyboard-footer-style';css.textContent=`
 #cafeKeyboardFooter{position:fixed;z-index:9000;inset:auto 0 0 0;box-sizing:border-box;
 padding:9px 14px 10px;text-align:center;font:500 12px/1.45 system-ui,-apple-system,sans-serif;
 color:#544958;background:rgba(251,249,246,.97);border-top:1px solid rgba(107,85,115,.20);
 box-shadow:0 -3px 14px rgba(41,30,40,.05);pointer-events:none}
 body{padding-bottom:58px!important}
 @media(max-width:660px){#cafeKeyboardFooter{font-size:11px;padding:7px 10px}body{padding-bottom:72px!important}}
 `;document.head.append(css);
 const footer=document.createElement('footer');footer.id='cafeKeyboardFooter';footer.setAttribute('aria-label','Keyboard navigation instructions');
 footer.textContent='↑ ↓ Scroll · ← → Focus controls · Tab Next · Shift+Tab Previous · Enter Interact · Esc Back';
 document.body.append(footer);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installKeyboardFooter,{once:true});else installKeyboardFooter();

// When a project card is opened, parent handles routing and remembers the listing scroll offset.
requestAnimationFrame(schedule);
window.cafeKeyboardChild={refresh:schedule};
})();
