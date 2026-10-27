/* Café V73 — consistent keyboard support for stage-mounted café overlays. */
(()=>{
'use strict';
const STYLE=document.createElement('style');STYLE.id='cafe-keyboard-accessibility';STYLE.textContent=`
.cafe-keyboard-selected{outline:3px solid #7650bc!important;outline-offset:3px!important;box-shadow:0 0 0 5px rgba(118,80,188,.10)!important;}
#cafeKeyboardHint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);z-index:5;pointer-events:none;font:500 11px/1.2 system-ui,sans-serif;letter-spacing:.01em;color:#74677f;background:rgba(253,250,247,.90);border-radius:6px;padding:5px 9px;white-space:nowrap}
@media(max-width:700px){#cafeKeyboardHint{font-size:10px;max-width:80%;white-space:normal;text-align:center}}
@media(prefers-reduced-motion:reduce){.cafe-keyboard-selected{transition:none!important}}
`;document.head.append(STYLE);
const ids=['cafeAmberChat','cafeReviewModal','arcadeModal','portfolioSandbox','cafeNavMenu','musicModal','modal'];
const sel='button:not([disabled]),a[href],input:not([type="hidden"]),select,textarea,[role="button"],[role="slider"],[tabindex]:not([tabindex="-1"])';
let root=null,selected=null,manual=false,scheduled=false,lastChange=0,previous=null;
const isOpen=id=>{const el=document.getElementById(id);if(!el||el.hidden||el.getAttribute('aria-hidden')==='true')return false;
 if(id==='portfolioSandbox')return el.classList.contains('is-open');
 if(id==='modal')return !el.hidden&&getComputedStyle(el).display!=='none';
 return !!el.getClientRects().length;};
function layer(){for(const id of ids){if(isOpen(id))return document.getElementById(id)}return null;}
const typing=el=>el?.matches?.('input,textarea,select,[contenteditable="true"],[role="textbox"]');
const canUse=el=>{if(!el||!el.getClientRects().length||el.closest('[hidden],[inert],[aria-hidden="true"]'))return false;const c=getComputedStyle(el);return c.visibility!=='hidden'&&c.display!=='none'};
function choose(el){if(selected===el)return;if(selected)selected.classList.remove('cafe-keyboard-selected');selected=el;if(el)el.classList.add('cafe-keyboard-selected');lastChange=performance.now();}
function scrollerFor(modal){if(modal.id==='portfolioSandbox')return document.getElementById('resumeDocument')||modal;
 const all=[...modal.querySelectorAll('*')].filter(e=>{const st=getComputedStyle(e);return /auto|scroll/.test(st.overflowY)&&e.scrollHeight>e.clientHeight+20&&canUse(e)});return all.sort((a,b)=>b.clientHeight-a.clientHeight)[0]||modal;}
function update(){scheduled=false;const active=layer();if(active!==root){choose(null);manual=false;root=active;if(active){previous=document.activeElement;
 // Do not replace focus already established by each modal's own open() function.
 if(!active.contains(document.activeElement)){const first=active.querySelector('button:not([disabled]),input:not([disabled]),textarea,[tabindex="0"]');if(first&&canUse(first))first.focus({preventScroll:true})}
 requestAnimationFrame(schedule); }return;}
 if(!root)return;
 const scroll=scrollerFor(root),r=scroll.getBoundingClientRect(),lo=r.top+r.height*.3,hi=r.top+r.height*.7,cy=r.top+r.height*.5,cx=r.left+r.width/2;
 const choices=[...root.querySelectorAll(sel)].filter(canUse).filter(el=>!el.closest('iframe'));
 // When reading a portfolio case study or directory, prefer controls inside its iframe.
 if(root.id==='portfolioSandbox'&&document.getElementById('resumeStandalone')?.hidden)return;
 let best=null,dist=Infinity;for(const el of choices){const b=el.getBoundingClientRect();if(b.bottom<lo||b.top>hi||b.right<r.left||b.left>r.right)continue;
 const d=Math.abs((b.top+b.bottom)/2-cy)+Math.abs((b.left+b.right)/2-cx)*.12;
 if(d<dist){dist=d;best=el;}}
 if(manual&&selected&&canUse(selected))return;
 if(root.id==='cafeNavMenu'||root.id==='musicModal'){const current=document.activeElement;if(root.contains(current)&&canUse(current)&&current.matches(sel)){choose(current);return;}}
 if(best!==selected){if(selected&&best&&performance.now()-lastChange<130)return;choose(best)}
}
const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}};
document.addEventListener('scroll',()=>{manual=false;schedule()},true);addEventListener('resize',schedule);
document.addEventListener('focusin',e=>{if(!layer())return;if(canUse(e.target)&&e.target.matches(sel)){manual=true;choose(e.target)}},true);
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['hidden','aria-hidden','open','class']});
const native=el=>typing(el)||el?.matches?.('input[type="range"],[role="slider"],[role="combobox"],[role="listbox"]');
function scrollModal(e){const m=layer();if(!m)return false;const k=e.key;
 if(m.id==='portfolioSandbox'&&!document.getElementById('resumeStandalone')?.hidden){/* PDF keyboard scrolling */}
 const scroll=scrollerFor(m),height=scroll.clientHeight||m.clientHeight;
 const dy=k==='ArrowDown'?68:k==='ArrowUp'?-68:k==='PageDown'?height*.86:k==='PageUp'?-height*.86:null;
 if(dy!==null)scroll.scrollBy({top:dy,behavior:'instant'});else if(k==='Home')scroll.scrollTop=0;else if(k==='End')scroll.scrollTop=scroll.scrollHeight;else return false;
 manual=false;schedule();return true;
}
window.addEventListener('keydown',e=>{const m=layer();if(!m||e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey||e.isComposing)return;
 const k=e.key,focused=document.activeElement;
 if(k==='Tab'){manual=true;
  if(m.id!=='portfolioSandbox'){
    const focusable=[...m.querySelectorAll(sel)].filter(canUse);
    if(focusable.length){const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&(focused===first||!m.contains(focused))){e.preventDefault();first===last?first.focus():last.focus();return;}
      if(!e.shiftKey&&(focused===last||!m.contains(focused))){e.preventDefault();first.focus();return;}
    }
  }
  return;}
 if(native(focused))return;
 // Preserve the built-in arcade keyboard gameplay and menu-specific actions.
 if(m.id==='arcadeModal'&&m.dataset.phase==='playing')return;
 if(m.id==='portfolioSandbox'&&['ArrowLeft','ArrowRight'].includes(k)&&[document.getElementById('sandboxBack'),document.getElementById('sandboxClose')].includes(focused))return;
 if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(k)){
  if(scrollModal(e)){e.preventDefault();e.stopImmediatePropagation()}return;}
 if((k==='Enter'||k===' ')&&!e.repeat){if(focused&&m.contains(focused)&&focused.matches(sel))return;
  if(selected&&m.contains(selected)&&canUse(selected)){e.preventDefault();e.stopImmediatePropagation();selected.click();}}
},true);
// Fallback Escape from same-origin iframe: let existing Back/Close buttons handle the proper depth.
addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='cafe-keyboard-escape')return;
 const modal=document.getElementById('portfolioSandbox');if(!modal?.classList.contains('is-open'))return;
 const source=[document.getElementById('sandboxList')?.contentWindow,document.getElementById('sandboxFrame')?.contentWindow];if(!source.includes(e.source))return;
 const back=document.getElementById('sandboxBack'),close=document.getElementById('sandboxClose');
 if(back&&!back.hidden){back.focus({preventScroll:true});}else close?.click();},false);
// V75: Direct same-origin Escape bridge. Keydown in an iframe does not bubble to the
// parent document. Attach to every loaded portfolio child frame so Escape always
// transfers *real* keyboard focus to the parent's Back to projects toolbar button.
// Preserve Escape inside an active nested image viewer/dialog.
(function installCaseStudyEscapeBridge(){
  const frame=document.getElementById('sandboxFrame');
  const listing=document.getElementById('sandboxList');
  const overlay=document.getElementById('portfolioSandbox');
  const back=document.getElementById('sandboxBack');
  const close=document.getElementById('sandboxClose');
  if(!frame||!listing||!overlay||!back||!close)return;
  function nestedIsOpen(doc){
    const open=doc.querySelector('dialog[open],[role="dialog"][aria-modal="true"]');
    if(open&&open.getClientRects().length)return true;
    const viewer=doc.getElementById('comparison-viewer');
    if(viewer&&viewer.getClientRects().length&&
       (viewer.classList.contains('open')||viewer.classList.contains('is-open')||viewer.getAttribute('aria-hidden')==='false'))return true;
    return false;
  }
  function focusToolbar(){
    if(!overlay.classList.contains('is-open'))return;
    if(!back.hidden){back.focus({preventScroll:true});
      // iframe->parent focus transition is not always synchronous across browsers.
      if(document.activeElement!==back)requestAnimationFrame(()=>back.focus({preventScroll:true}));
    }else{close.click();}
  }
  function attach(iframe){
    try{
      const win=iframe.contentWindow,doc=iframe.contentDocument;
      if(!win||!doc||win.__cafeV75EscAttached)return;
      win.__cafeV75EscAttached=true;
      win.addEventListener('keydown',e=>{
        if(e.key!=='Escape'||e.defaultPrevented||e.isComposing)return;
        if(!overlay.classList.contains('is-open')||iframe!==frame&&iframe!==listing)return;
        if(nestedIsOpen(doc))return;
        e.preventDefault();e.stopImmediatePropagation();
        focusToolbar();
      },true);
    }catch(_){/* Cross-origin frames retain native keyboard handling. */}
  }
  [frame,listing].forEach(el=>{el.addEventListener('load',()=>attach(el));attach(el)});
  window.cafeFocusCaseStudyToolbar=focusToolbar;
})();

// V77: One-step Escape hierarchy, explicitly bridged from embedded documents.
(function(){
 const modal=document.getElementById('portfolioSandbox'),caseFrame=document.getElementById('sandboxFrame'),directory=document.getElementById('sandboxList');
 const back=document.getElementById('sandboxBack'),close=document.getElementById('sandboxClose');
 if(!modal||!caseFrame||!directory||!back||!close)return;
 let lastEscapeAt=0;
 function handle(source){
  if(!modal.classList.contains('is-open'))return false;
  if(source!==caseFrame.contentWindow&&source!==directory.contentWindow)return false;
  // Debounce a second message from the legacy navigation bridge for the same keypress.
  if(performance.now()-lastEscapeAt<120)return true;
  lastEscapeAt=performance.now();
  if(source===caseFrame.contentWindow&&!back.hidden){
    // Exit the iframe and return real keyboard focus to the header.
    try{window.focus();}catch(_e){}
    back.focus({preventScroll:true});
    requestAnimationFrame(()=>{if(modal.classList.contains('is-open')&&!back.hidden&&document.activeElement!==back)back.focus({preventScroll:true})});
  }else{close.click();}
  return true;
 }
 window.cafeCaseKeyboardEscape=handle;
 window.addEventListener('message',e=>{
  if(e.data?.type!=='cafe-v77-escape')return;
  if(location.protocol!=='file:'&&e.origin!==location.origin)return;
  handle(e.source);
 },true);
})();

// Keep the native iframe accessible. Navigation events in same-origin embedded pages are handled there.
// The modal mutation observer schedules the layer change; no timer is needed.
schedule();
})();
