const modal=document.getElementById('resume-viewer');
const viewport=modal.querySelector('.resume-document'),host=modal.querySelector('.resume-page-host');
const status=document.getElementById('resume-pdf-status'),zoomLevel=document.getElementById('resume-zoom-level');
const minus=document.getElementById('resume-zoom-out'),plus=document.getElementById('resume-zoom-in'),fitWidth=document.getElementById('resume-fit'),fitHeight=document.getElementById('resume-fit-height');
const previewUrl='/assets/resume-preview.webp?v=20261018';
let pdf=null,page=null,loading=null,zoom=1,mode='height',sequence=0,trigger=null,previousOverflow='',resizeTimer,cached=null;
let natural={width:612,height:792};
function fitScale(){
 const width=Math.max(80,viewport.clientWidth-32)/natural.width;
 return mode==='height'?Math.min(width,Math.max(80,viewport.clientHeight-32)/natural.height):width;
}
function controls(){
 minus.disabled=zoom<=.25;plus.disabled=zoom>=4;
 fitWidth.setAttribute('aria-pressed',mode==='width'?'true':'false');fitHeight.setAttribute('aria-pressed',mode==='height'?'true':'false');
 zoomLevel.textContent=`${Math.round(zoom*100)}%`;
}
function preview(){
 const image=new Image();image.src=previewUrl;image.alt='Amber Tang’s resume. Download the PDF for selectable text.';
 image.style.width=`${natural.width*zoom}px`;image.style.height=`${natural.height*zoom}px`;
 image.decoding='async';host.replaceChildren(image);
}
async function loadPdf(){
 if(page)return page;
 if(!loading)loading=(async()=>{
  const lib=await import('/assets/pdfjs/pdf.min.mjs');
  lib.GlobalWorkerOptions.workerSrc='/assets/pdfjs/pdf.worker.min.mjs';
  pdf=await lib.getDocument({url:modal.querySelector('.resume-download').href,standardFontDataUrl:'/assets/pdfjs/standard_fonts/',cMapUrl:'/assets/pdfjs/cmaps/',cMapPacked:true,wasmUrl:'/assets/pdfjs/wasm/',iccUrl:'/assets/pdfjs/iccs/',isEvalSupported:false}).promise;
  page=await pdf.getPage(1);natural=page.getViewport({scale:1});return page;
 })().catch(error=>{loading=null;throw error});
 return loading;
}
async function render(){
 const request=++sequence;
 try{
  await loadPdf();if(request!==sequence||!modal.open)return;
  if(mode!=='custom')zoom=fitScale();controls();
  const view=page.getViewport({scale:zoom});
  const ratio=Math.min(window.devicePixelRatio||1,2,4096/Math.max(view.width,view.height));
  const key=`${view.width}:${view.height}:${ratio}`;
  if(cached?.key===key){host.replaceChildren(cached.canvas);status.hidden=true;return}
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(view.width*ratio);canvas.height=Math.ceil(view.height*ratio);
  canvas.style.width=`${view.width}px`;canvas.style.height=`${view.height}px`;
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Amber Tang’s resume. Download the PDF for selectable text.');
  await page.render({canvasContext:canvas.getContext('2d'),viewport:view,transform:ratio!==1?[ratio,0,0,ratio,0,0]:null}).promise;
  if(request!==sequence||!modal.open)return;
  cached={key,canvas};host.replaceChildren(canvas);status.hidden=true;
 }catch(error){
  if(request!==sequence||!modal.open)return;
  // Keep the lightweight preview visible if the PDF engine fails.
  console.error('Full-resolution resume preview could not load:',error);
 }
}
function updateView(){if(mode!=='custom')zoom=fitScale();controls();preview();render()}
function changeZoom(value){mode='custom';zoom=Math.max(.25,Math.min(4,Math.round(value*100)/100));updateView()}
function warm(){const image=new Image();image.src=previewUrl;loadPdf().catch(()=>{})}
document.querySelectorAll('.resume-link,.experience-resume').forEach(link=>{
 link.addEventListener('pointerenter',warm,{once:true});link.addEventListener('focus',warm,{once:true});
 link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();trigger=link;previousOverflow=document.documentElement.style.overflow;mode='height';status.hidden=true;
  modal.showModal();document.documentElement.style.overflow='hidden';viewport.scrollTo(0,0);updateView();
 });
});
modal.querySelector('.resume-close').addEventListener('click',()=>modal.close());
modal.addEventListener('click',event=>{if(event.target!==modal)return;const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close()});
modal.addEventListener('close',()=>{++sequence;clearTimeout(resizeTimer);document.documentElement.style.overflow=previousOverflow;trigger?.focus({preventScroll:true})});
minus.addEventListener('click',()=>changeZoom(zoom-.15));plus.addEventListener('click',()=>changeZoom(zoom+.15));
fitWidth.addEventListener('click',()=>{mode='width';viewport.scrollTo(0,0);updateView()});
fitHeight.addEventListener('click',()=>{mode='height';viewport.scrollTo(0,0);updateView()});
viewport.addEventListener('wheel',event=>{if(!event.ctrlKey&&!event.metaKey)return;event.preventDefault();changeZoom(zoom+(event.deltaY<0?.1:-.1))},{passive:false});
new ResizeObserver(()=>{clearTimeout(resizeTimer);if(modal.open)resizeTimer=setTimeout(updateView,100)}).observe(viewport);
// Warm after initial page resources without competing with the portfolio's first load.
function idleWarm(){if(navigator.connection?.saveData)return;if('requestIdleCallback' in window)window.requestIdleCallback(warm,{timeout:5000});else setTimeout(warm,2000)}
if(document.readyState==='complete')idleWarm();else window.addEventListener('load',idleWarm,{once:true});
