if(location.protocol!=='file:'){
(()=>{
 'use strict';
 const projectId='yzytsdcyq0',storageKey='amber-portfolio-analytics-v1',maxAge=180*24*60*60*1000;
 let collecting=false,started=false,observer=null,banner,privacy;
 const seen=new Set();
 function readChoice(){try{const item=JSON.parse(localStorage.getItem(storageKey));return item&&['accepted','declined','cookieless'].includes(item.value)&&Date.now()-item.updated<maxAge?item.value:null}catch{return null}}
 function saveChoice(value){try{localStorage.setItem(storageKey,JSON.stringify({value,updated:Date.now()}))}catch{}}
 function track(event,key){if(!collecting||!started)return false;if(key&&seen.has(key))return false;window.clarity('event',event);if(key)seen.add(key);return true}
 function pageContext(){const parts=location.pathname.split('/').filter(Boolean),isCase=!!document.querySelector('main.hs-case, main.cal-case');return {type:isCase?'case_study':parts[0]==='work'?'company_projects':'homepage',company:parts[0]==='work'?parts[1]||'unknown':'none',project:isCase?parts.slice(0,3).join('/'):'none'}}
 function observe(){
  observer?.disconnect();if(!('IntersectionObserver' in window))return;
  observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{
   if(!entry.isIntersecting)return;const el=entry.target,event=el.dataset.analyticsView;
   if(track(event,'view:'+event))observer.unobserve(el);
  })},{threshold:.15});
  const targets=[['.selected.section','selected_work_viewed'],['#about','about_viewed'],['#experience','experience_viewed'],['.case-footer-band','case_study_end_reached']];
  targets.forEach(([selector,event])=>{const el=document.querySelector(selector);if(el){el.dataset.analyticsView=event;observer.observe(el)}});
 }
 function start(choice=null){
  collecting=true;
  // No synthetic consent for new visitors: Clarity applies its regional rules and project cookie setting.
  const explicit=choice==='accepted'||choice==='cookieless';
  if(!started){
   window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)};
   if(explicit)window.clarity('consentv2',{analytics_Storage:choice==='accepted'?'granted':'denied',ad_Storage:'denied'});
   const script=document.createElement('script');script.async=true;script.src='https://www.clarity.ms/tag/'+projectId;
   script.dataset.portfolioClarity='true';document.head.append(script);started=true;
  }else if(explicit){
   window.clarity('consentv2',{analytics_Storage:choice==='accepted'?'granted':'denied',ad_Storage:'denied'});
  }
  const context=pageContext();
  window.clarity('set','page_type',context.type);window.clarity('set','company',context.company);
  if(context.project!=='none')window.clarity('set','project',context.project);
  if(context.type==='case_study')track('case_study_opened','page:case');
  if(context.type==='company_projects')track('company_projects_opened','page:company');
  observe();
 }
 function revoke(){
  collecting=false;observer?.disconnect();
  if(started){
   window.clarity('consentv2',{analytics_Storage:'denied',ad_Storage:'denied'});
   window.clarity('consent',false);
   // Reload with the saved refusal so no Clarity script remains active.
   location.reload();
  }
 }
 function choose(value){saveChoice(value);banner.close();if(value==='declined')revoke();else start(value)}
 function showPreferences(){banner.showModal()}
 function init(){
  const ui=document.createElement('div');ui.id='portfolio-privacy-ui';ui.innerHTML=`<dialog class="analytics-preferences-dialog" aria-labelledby="analytics-preferences-title"><div class="analytics-privacy-head"><h2 id="analytics-preferences-title">Analytics preferences</h2><button type="button" data-preferences-close aria-label="Close analytics preferences">×</button></div><div class="analytics-privacy-copy"><p>This portfolio uses Microsoft Clarity to understand visits and interactions. Default cookie behavior follows Clarity’s regional controls. Where explicit consent is required, tracking stays limited until you allow analytics cookies. You can also choose cookieless analytics or turn tracking off entirely.</p><div class="analytics-preference-actions"><button type="button" data-analytics-cookieless>Use cookieless analytics</button><button type="button" data-analytics-accept>Allow analytics cookies</button><button type="button" data-analytics-decline>Turn off analytics</button></div></div></dialog><dialog class="analytics-privacy-dialog" aria-labelledby="analytics-privacy-title"><div class="analytics-privacy-head"><h2 id="analytics-privacy-title">Portfolio analytics & privacy</h2><button type="button" data-privacy-close aria-label="Close privacy notice">×</button></div><div class="analytics-privacy-copy"><p>This portfolio uses Microsoft Clarity to help Amber Tang understand how visitors explore her work. Default tracking follows Clarity’s regional cookie controls and project settings. Cookies support linked, multi-page sessions where enabled. For regions where Clarity requires explicit consent, cookie-based tracking stays restricted until you choose to allow it. You can manage analytics through the footer preferences.</p><p>When enabled, Clarity can collect page visits, clicks, scrolling, interaction replays, device and browser information, referring pages, approximate location, and time spent. Replays reconstruct activity within this website, not your desktop or other tabs. Custom events record actions such as opening a case study, using a comparison slider, enlarging an image, or opening the resume.</p><p>Clarity processes this information through Microsoft’s services. Its default masking protects sensitive text and input content; this site does not send your name or email as an analytics identifier. Explicit preference selections grant analytics storage only; advertising storage is denied when those selections are sent to Clarity. Otherwise Clarity’s regional and project defaults apply.</p><p>An explicit analytics preference is saved in this browser for up to 180 days. You can change it using “Analytics preferences” in the footer. Turning analytics off stops future collection after the page reloads and does not erase previously collected data. Without cookie permission, page visits may appear as separate sessions and visitor counts and funnels are limited.</p><p>Read <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft’s Privacy Statement</a> and <a href="https://learn.microsoft.com/en-us/clarity/setup-and-installation/data-retention" target="_blank" rel="noopener noreferrer">Clarity’s data retention information</a>. For questions, contact <a href="mailto:amberhrtang@gmail.com">amberhrtang@gmail.com</a>.</p><button class="analytics-manage" type="button" data-privacy-manage>Manage analytics preferences</button></div></dialog>`;
  document.body.append(ui);banner=ui.querySelector('.analytics-preferences-dialog');privacy=ui.querySelector('.analytics-privacy-dialog');
  banner.querySelector('[data-analytics-cookieless]').addEventListener('click',()=>choose('cookieless'));
  banner.querySelector('[data-preferences-close]').addEventListener('click',()=>banner.close());
  banner.querySelector('[data-analytics-accept]').addEventListener('click',()=>choose('accepted'));
  banner.querySelector('[data-analytics-decline]').addEventListener('click',()=>choose('declined'));
  ui.querySelector('[data-privacy-close]').addEventListener('click',()=>privacy.close());
  ui.querySelector('[data-privacy-manage]').addEventListener('click',()=>{privacy.close();showPreferences()});
  privacy.addEventListener('click',event=>{if(event.target!==privacy)return;const r=privacy.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)privacy.close()});
  document.addEventListener('click',event=>{
   const el=event.target instanceof Element?event.target:null;if(!el)return;
   if(el.closest('[data-analytics-preferences]')){showPreferences();return}
   if(el.closest('[data-privacy-notice]')){privacy.showModal();return}
   if(el.closest('.resume-link,.experience-resume'))track('resume_clicked');
   if(el.closest('.resume-download'))track('resume_download_clicked');
   if(el.closest('.project-card'))track('project_card_clicked');
   if(el.closest('.company-card'))track('company_card_clicked');
   if(el.closest('[data-comparison-image],[data-zoom-src],.zoomable-image'))track('image_zoom_opened');
   if(el.closest('#prev,#next,.carousel-track'))track('carousel_navigated');
  });
  document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target instanceof Element&&event.target.matches('.zoomable-image'))track('image_zoom_opened')});
  document.addEventListener('input',event=>{if(event.target instanceof Element&&event.target.matches('.comparison-range'))track('comparison_used','comparison:'+Array.from(document.querySelectorAll('.comparison-range')).indexOf(event.target))});
  document.addEventListener('wheel',event=>{if(event.target instanceof Element&&event.target.closest('.comparison-slider')&&(event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)*.6))track('comparison_used','comparison:wheel')},{passive:true});
  const choice=readChoice();if(choice!=='declined')start(choice);
  window.addEventListener('storage',event=>{if(event.key!==storageKey)return;const choice=readChoice();if(choice==='declined')revoke();else start(choice)});
 }
 if(document.readyState==='complete')init();else document.addEventListener('DOMContentLoaded',init,{once:true});
})();

}
