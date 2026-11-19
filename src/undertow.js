/* Undertow — MIT License. No backend or framework required. */
(function(global){
'use strict';
const DEFAULTS=Object.freeze({showControls:true,showHint:true,showAddPhotos:true,showRescatter:true,showHeader:true,showCount:true,size:100,viscosity:40,strength:62,depth:85,maxPhotos:400,title:'Undertow',subtitle:'An unarranged collection'});
function normalize(input){
  const out={...DEFAULTS};
  for(const key of ['showControls','showHint','showAddPhotos','showRescatter','showHeader','showCount'])if(typeof input[key]==='boolean')out[key]=input[key];
  for(const [key,min,max] of [['size',35,200],['viscosity',0,100],['strength',0,100],['depth',0,100],['maxPhotos',1,2000]]){
    const n=Number(input[key]);if(input[key]!==undefined&&Number.isFinite(n))out[key]=Math.max(min,Math.min(max,n));
  }
  out.maxPhotos=Math.floor(out.maxPhotos);
  for(const key of ['title','subtitle'])if(typeof input[key]==='string')out[key]=input[key];
  return out;
}
const MARKUP="<style>:host{color-scheme:dark;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif}*{box-sizing:border-box}:host{display:block;position:relative;min-height:320px;margin:0;background:#101515;color:#e9e9e2;overflow:hidden}header{position:absolute;z-index:20;left:0;right:0;top:0;padding:17px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;pointer-events:none;background:linear-gradient(#0d1212d9,transparent)}.brand{font-family:Georgia,serif;font-size:24px;letter-spacing:.04em}.sub{font-size:10px;color:#b7c3be;letter-spacing:.19em;text-transform:uppercase}.actions{display:flex;gap:8px;pointer-events:auto}button,.upload{border:1px solid #9bada34a;background:#1e2929d9;color:#e6eee9;border-radius:24px;padding:10px 14px;font:inherit;font-size:12px;cursor:pointer}.upload{background:#d9e2d5;color:#17201c;border-color:transparent;font-weight:650}button:hover,.upload:hover{filter:brightness(1.14)}input[type=file]{display:none}canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}canvas:active{cursor:grabbing}.panel{position:absolute;z-index:20;left:18px;bottom:18px;width:min(340px,calc(100% - 36px));background:#182222e8;border:1px solid #a8c1b32d;backdrop-filter:blur(16px);border-radius:15px;padding:15px 17px}.panel h2{font:15px Georgia,serif;margin:0 0 11px}.setting{display:grid;grid-template-columns:110px 1fr 42px;align-items:center;gap:10px;margin:10px 0;font-size:11px;color:#c2d0c9}.setting output{text-align:right;font-variant-numeric:tabular-nums}input[type=range]{width:100%;accent-color:#b3cbb8}.foot{font-size:10px;color:#9baaa3;line-height:1.5;margin-top:10px}.count{font-size:11px;color:#b8c5bc}.viewer{position:absolute;inset:0;z-index:40;background:#07100fdb;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:70px 20px 50px;backdrop-filter:blur(16px)}.viewer.open{display:flex}.viewer img{max-width:min(88%,1150px);max-height:72%;object-fit:contain;box-shadow:0 24px 80px #000a;background:#f6f3e9;padding:9px 9px 24px}.viewer button{position:absolute;right:20px;top:18px}.viewer .name{color:#d7e2da;font-size:12px;max-width:90%;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.empty{position:absolute;top:46%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;color:#d5dfd8;width:min(450px,85vw)}.empty strong{font:clamp(27px,5vw,45px) Georgia,serif;font-weight:normal}.empty p{font-size:13px;line-height:1.6;color:#b5c6bd}.empty.hidden{display:none}@media(max-width:600px){header{padding:12px}.brand{font-size:20px}.sub{font-size:8px}.actions button,.actions .upload{padding:9px 11px}.panel{bottom:10px;left:10px;width:min(300px,calc(100% - 20px));padding:10px 13px}.setting{margin:6px 0}.foot{font-size:9px}}\n[hidden]{display:none!important}header{flex-wrap:wrap}.actions{align-items:center;flex-wrap:wrap}.brand{margin:0}canvas{position:absolute;inset:0}.viewer img{min-height:0}.status{position:absolute;z-index:25;top:76px;left:20px;right:20px;font-size:12px;color:#e6eee9;pointer-events:none}\n\n.interaction-hint{position:absolute;z-index:21;left:50%;bottom:var(--undertow-hint-bottom,max(20px,env(safe-area-inset-bottom)));transform:translateX(-50%);width:max-content;max-width:calc(100% - 32px);padding:10px 16px;border:1px solid #a8c1b32d;border-radius:24px;background:#101a1ae6;color:#e0e8e1;font-size:14px;line-height:1.5;text-align:center;pointer-events:none;opacity:0;visibility:hidden;transition:opacity .6s ease,visibility .6s ease}.interaction-hint.visible{opacity:1;visibility:visible}@media(prefers-reduced-motion:reduce){.interaction-hint{transition:none}}\n</style><header><div><div class=\"brand\">Undertow</div><div class=\"sub\">An unarranged collection</div></div><div class=\"actions\"><span class=\"count\" id=\"count\"></span><button id=\"shuffle\" title=\"Re-scatter the collection\">Rescatter</button><label class=\"upload\" for=\"files\">+ Add photos</label><input id=\"files\" type=\"file\" accept=\"image/*\" multiple></div></header><canvas tabindex=\"0\" id=\"stage\" aria-label=\"Interactive floating photographs\" aria-describedby=\"interaction-hint\"></canvas><div id=\"interaction-hint\" class=\"interaction-hint\"></div><div id=\"empty\" class=\"empty\"><strong>Let the photographs fall.</strong><p>Add a handful of images, then move through them. Stir the collection, pull one free, and discover what lies beneath.</p></div><aside class=\"panel\"><h2>The feeling of the water</h2><div class=\"setting\"><label for=\"size\">Photo size</label><input id=\"size\" type=\"range\" min=\"35\" max=\"200\" value=\"100\"><output id=\"sizeout\">100%</output></div><div class=\"setting\"><label for=\"viscosity\">Viscosity</label><input id=\"viscosity\" type=\"range\" min=\"0\" max=\"100\" value=\"40\"><output id=\"vout\">40</output></div><div class=\"setting\"><label for=\"strength\">Stir strength</label><input id=\"strength\" type=\"range\" min=\"0\" max=\"100\" value=\"62\"><output id=\"sout\">62</output></div><div class=\"setting\"><label for=\"depth\">Depth / overlap</label><input id=\"depth\" type=\"range\" min=\"0\" max=\"100\" value=\"85\"><output id=\"dout\">85</output></div><div class=\"foot\">Click a photo to view it. Drag to stir the pile or move a print. Prints slide over and under each other. The arrangement remembers your touch. Locally added photos stay in this browser session.</div></aside><div class=\"status\" id=\"status\" role=\"status\" aria-live=\"polite\"></div><div class=\"viewer\" id=\"viewer\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Selected photograph\"><button id=\"close\">Return to the collection ✕</button><img id=\"large\" alt=\"Selected photograph\"><div id=\"filename\" class=\"name\"></div></div>";
class Undertow{
  constructor(container,config={}){
    if(!container||typeof container.attachShadow!=='function')throw new TypeError('Pass a gallery container element.');
    if(container.shadowRoot&&container.shadowRoot.childNodes.length)throw new Error('This container already has content in its shadow root.');
    const root=container.shadowRoot||container.attachShadow({mode:'open'});
    root.innerHTML=MARKUP;
    const events=new AbortController();
    const hint=root.querySelector('#interaction-hint');
    let explored=false;
    function hintWording(touch){hint.textContent=touch?'Touch and drag to explore · Tap to look closer':'Drag to explore · Click a photo to look closer';}
    hintWording(!!global.matchMedia?.('(hover: none) and (pointer: coarse)').matches);
    function updateHint(){hint.classList.toggle('visible',options.showHint&&!options.showControls&&photos.length>0&&!explored&&!viewer.classList.contains('open'));}
    let options=normalize(config);
const canvas=root.querySelector('#stage'),ctx=canvas.getContext('2d',{alpha:false}),files=root.querySelector('#files'),viewer=root.querySelector('#viewer'),large=root.querySelector('#large'),filename=root.querySelector('#filename'),empty=root.querySelector('#empty'),count=root.querySelector('#count');const viscosity=root.querySelector('#viscosity'),strength=root.querySelector('#strength'),depth=root.querySelector('#depth'),size=root.querySelector('#size');for(const key of ['size','viscosity','strength','depth'])root.querySelector('#'+key).value=options[key];let animationFrame=0,destroyed=false,generation=0,queue=Promise.resolve(),ownedUrls=new Set();let W=0,H=0,dpr=1,photos=[],pointer=null,drag=null,hoverPhoto=null,topZ=1,frame=0,lastFrame=0;const rand=(a,b)=>a+Math.random()*(b-a);function resize(){dpr=Math.min(devicePixelRatio||1,2);W=Math.max(1,container.clientWidth);H=Math.max(1,container.clientHeight);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);fitCollection()}const resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;if(resizeObserver)resizeObserver.observe(container);else global.addEventListener('resize',resize,{signal:events.signal});resize();function update(){for(const key of ['size','viscosity','strength','depth'])options[key]=Number(root.querySelector('#'+key).value);root.querySelector('#sizeout').textContent=size.value+'%';root.querySelector('#vout').textContent=viscosity.value;root.querySelector('#sout').textContent=strength.value;root.querySelector('#dout').textContent=depth.value;count.textContent=photos.length?photos.length+' photos':'';empty.classList.toggle('hidden',!!photos.length);updateHint()}[viscosity,strength,depth].forEach(e=>e.addEventListener('input',update));size.addEventListener('input',()=>{fitCollection();update()});update();
// Keep a small preview in the animated scene; open the original only in the viewer.
function addImage(img,url,name,metadata={}){
  const aspect=img.naturalWidth/img.naturalHeight,long=rand(145,190);
  const w=aspect>=1?long:long*aspect,h=aspect>=1?long/aspect:long;
  const preview=document.createElement('canvas');
  const fit=Math.min(1,480/Math.max(img.naturalWidth,img.naturalHeight));
  preview.width=Math.max(1,Math.round(img.naturalWidth*fit));
  preview.height=Math.max(1,Math.round(img.naturalHeight*fit));
  preview.getContext('2d').drawImage(img,0,0,preview.width,preview.height);
  const pad=24,card=document.createElement('canvas');
  card.width=Math.ceil((w+pad*2)*2);card.height=Math.ceil((h+pad*2+16)*2);
  const c=card.getContext('2d');c.scale(2,2);
  c.shadowColor='#0008';c.shadowBlur=10;c.shadowOffsetY=5;c.fillStyle='#eeeae0';
  c.fillRect(pad-5,pad-5,w+10,h+23);c.shadowColor='transparent';
  c.drawImage(preview,pad,pad,w,h);
  photos.push({card,url,name,alt:metadata.alt||name,previewSrc:metadata.previewSrc||url,x:rand(w/2,W-w/2),y:rand(Math.max(100,h/2),Math.max(120,H-h/2)),
    vx:0,vy:0,a:rand(-.65,.65),va:0,w,h,baseW:w,baseH:h,scale:1,z:topZ++,mass:rand(.75,1.45),seed:rand(0,1000)});
}
function fitCollection(){
  const area=photos.reduce((sum,p)=>sum+p.baseW*p.baseH,0);
  // Leave room to sift even with hundreds of prints; retain a useful minimum size.
  const automatic=Math.max(.35,Math.min(1,Math.sqrt(W*H*1.65/Math.max(1,area))));
  const scale=automatic*Number(size.value)/100;
  for(const p of photos){p.scale=scale;p.w=p.baseW*scale;p.h=p.baseH*scale;}
}
files.addEventListener('change',async e=>{await append(Array.from(e.target.files||[]),true);files.value='';});

function scatter(){hoverPhoto=null;for(const p of photos){p.x=rand(p.w/2,Math.max(p.w/2+1,W-p.w/2));p.y=rand(Math.max(85,p.h/2),Math.max(86,H-p.h/2));p.a=rand(-.9,.9);p.vx=rand(-1.5,1.5);p.vy=rand(-1.5,1.5);p.va=rand(-.01,.01)}}root.querySelector('#shuffle').addEventListener('click',scatter);
function hit(p,x,y){const dx=x-p.x,dy=y-p.y,c=Math.cos(-p.a),s=Math.sin(-p.a),lx=dx*c-dy*s,ly=dx*s+dy*c;return Math.abs(lx)<p.w/2+5*p.scale&&ly>-p.h/2-5*p.scale&&ly<p.h/2+18*p.scale}function pick(x,y){return [...photos].sort((a,b)=>b.z-a.z).find(p=>hit(p,x,y))}function pos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}// Stirring follows the hand, with a small curl around its path. No positions snap to cells.
function stir(x,y,dx,dy){
  const power=Number(strength.value)/100;
  const length2=dx*dx+dy*dy;
  if(!length2||!power)return;
  const radius=170+power*180;
  const overlap=Number(depth.value)/100;
  for(const p of photos){
    if(drag?.p===p&&drag.moving)continue;
    // Measure from the swept segment, so fast gestures do not skip prints.
    const t=Math.max(0,Math.min(1,((p.x-x+dx)*dx+(p.y-y+dy)*dy)/length2));
    const rx=p.x-(x-dx+dx*t),ry=p.y-(y-dy+dy*t),d=Math.hypot(rx,ry);
    if(d>=radius)continue;
    const falloff=(1-d/radius);
    const layer=1-overlap*.3*(p.seed/1000);
    const flow=falloff*power*layer;
    // Carry the pile with the hand directly, then let momentum settle naturally.
    p.x+=dx*flow*.7;p.y+=dy*flow*.7;
    p.vx+=dx*flow*.09;p.vy+=dy*flow*.09;
    const curl=(dx*ry-dy*rx)/(radius*radius);
    p.va+=curl*flow*.08;
  }
}
canvas.addEventListener('pointerdown',e=>{
  if(viewer.classList.contains('open')||drag)return;
  hintWording(e.pointerType==='touch');
  canvas.setPointerCapture(e.pointerId);
  const q=pos(e);
  pointer={...q,id:e.pointerId};
  drag={p:pick(q.x,q.y),sx:q.x,sy:q.y,moving:false,down:performance.now()};
  hoverPhoto=null;
  if(drag.p){drag.p.vx=0;drag.p.vy=0;drag.p.va=0;}
});
canvas.addEventListener('pointermove',e=>{
  if(viewer.classList.contains('open'))return;
  if(pointer&&pointer.id!==e.pointerId)return;
  const q=pos(e);
  const dx=pointer?q.x-pointer.x:0,dy=pointer?q.y-pointer.y:0;
  // Hover only selects a stable target; stirring requires a deliberate drag.
  pointer={...q,id:e.pointerId};
  if(drag){
    if(!drag.moving&&Math.hypot(q.x-drag.sx,q.y-drag.sy)>8){
      drag.moving=true;
      if(photos.length&&(drag.p||Number(strength.value)>0)){explored=true;updateHint();}
      if(drag.p)drag.p.z=++topZ;
    }
    if(drag.moving&&drag.p){
      const p=drag.p;
      p.x+=dx;
      p.y+=dy;
      p.vx=Math.max(-18,Math.min(18,dx*.45));
      p.vy=Math.max(-18,Math.min(18,dy*.45));
      p.va=Math.max(-.04,Math.min(.04,p.va+dx*.00025));
    }
    if(drag.moving)stir(q.x,q.y,dx,dy);
  }else{
    hoverPhoto=(e.pointerType==='mouse'||e.pointerType==='pen')?pick(q.x,q.y):null;
    if(hoverPhoto){hoverPhoto.vx=0;hoverPhoto.vy=0;hoverPhoto.va=0;}
    canvas.style.cursor=hoverPhoto?'pointer':'grab';
  }
});
function end(e){
  if(!pointer||pointer.id!==e.pointerId)return;
  if(drag&&!drag.moving&&drag.p)show(drag.p);
  drag=null;pointer=null;hoverPhoto=null;canvas.style.cursor='grab';
  if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
}
function cancel(e){
  if(pointer&&pointer.id!==e.pointerId)return;
  if(drag?.p){drag.p.vx=0;drag.p.vy=0;drag.p.va=0;}
  drag=null;pointer=null;hoverPhoto=null;canvas.style.cursor='grab';
}
canvas.addEventListener('pointerup',end);
canvas.addEventListener('pointercancel',cancel);
canvas.addEventListener('lostpointercapture',cancel);
canvas.addEventListener('pointerleave',()=>{if(!drag){pointer=null;hoverPhoto=null;canvas.style.cursor='grab'}});
global.addEventListener('blur',()=>cancel({pointerId:pointer?.id}),{signal:events.signal});

function show(p){hoverPhoto=null;large.src=p.url;large.alt=p.alt;filename.textContent=p.name;viewer.classList.add('open');updateHint();root.querySelector('#close').focus();container.dispatchEvent(new CustomEvent('undertow:select',{detail:{photo:describe(p)}}));p.z=++topZ}function close(){viewer.classList.remove('open');updateHint();large.removeAttribute('src');canvas.focus({preventScroll:true})}root.querySelector('#close').addEventListener('click',close);viewer.addEventListener('click',e=>{if(e.target===viewer)close()});global.addEventListener('keydown',e=>{if(e.key==='Escape'&&viewer.classList.contains('open'))close()},{signal:events.signal});
function physics(dt=1){const damp=Math.pow(.985-Number(viscosity.value)/100*.065,dt);const overlap=Number(depth.value)/100;for(const p of photos){if(drag?.p===p||(!drag&&hoverPhoto===p))continue;p.vx*=damp;p.vy*=damp;p.va*=Math.pow(.955,dt);const speed=Math.hypot(p.vx,p.vy);if(speed>24){p.vx*=24/speed;p.vy*=24/speed}p.x+=p.vx*dt;p.y+=p.vy*dt;p.a+=p.va*dt;// Soft screen edges slow a departing print rather than clamping it back in one frame.
const margin=12,minX=p.w*.35+margin,maxX=Math.max(minX,W-minX),minY=(options.showHeader?75:12)+p.h*.25,maxY=Math.max(minY,H-p.h*.25-margin);
if(p.x<minX)p.vx+=(minX-p.x)*.012*dt;
if(p.x>maxX)p.vx-=(p.x-maxX)*.012*dt;
if(p.y<minY)p.vy+=(minY-p.y)*.012*dt;
if(p.y>maxY)p.vy-=(p.y-maxY)*.012*dt;
}
// Prints occupy separate depth layers. Pairwise repulsion is deliberately absent:
// dense collections must slide across one another rather than settle into a lattice.
}

function draw(now=0){if(destroyed)return;const dt=lastFrame?Math.min(2,Math.max(.25,(now-lastFrame)/16.667)):1;lastFrame=now;frame++;physics(dt);ctx.fillStyle='#111b1b';ctx.fillRect(0,0,W,H);const grd=ctx.createRadialGradient(W*.5,H*.43,20,W*.5,H*.5,Math.max(W,H)*.75);grd.addColorStop(0,'#34423c');grd.addColorStop(.55,'#1d2b29');grd.addColorStop(1,'#0c1414');ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);const ordered=[...photos].sort((a,b)=>a.z-b.z);for(const p of ordered){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.drawImage(p.card,(-p.baseW/2-24)*p.scale,(-p.baseH/2-24)*p.scale,p.card.width*.5*p.scale,p.card.height*.5*p.scale);ctx.restore()}animationFrame=requestAnimationFrame(draw)}draw();

function describe(p){return {src:p.url,previewSrc:p.previewSrc,name:p.name,alt:p.alt};}
function changed(){container.dispatchEvent(new CustomEvent('undertow:change',{detail:{count:photos.length}}));}
function applyOptions(next={}){
  if(destroyed)return;
  options=normalize({...options,...next});
  for(const key of ['size','viscosity','strength','depth'])root.querySelector('#'+key).value=options[key];
  root.querySelector('.panel').hidden=!options.showControls;
  root.querySelector('.upload').hidden=!options.showAddPhotos;
  files.hidden=!options.showAddPhotos;files.disabled=!options.showAddPhotos;
  root.querySelector('#shuffle').hidden=!options.showRescatter;
  root.querySelector('header').hidden=!options.showHeader;
  count.hidden=!options.showCount;
  root.querySelector('.brand').textContent=options.title;
  root.querySelector('.sub').textContent=options.subtitle;
  root.querySelector('#empty p').textContent=options.showAddPhotos?'Add images, then drag through the collection. Click a photograph to look closer.':'This collection has no photographs yet.';
  fitCollection();update();
}
function clear(){
  generation++;drag=null;pointer=null;hoverPhoto=null;close();
  for(const url of ownedUrls)URL.revokeObjectURL(url);
  ownedUrls.clear();photos=[];root.querySelector('#status').textContent='';update();changed();
}
function imageUrl(value){
  if(typeof value!=='string'||!value.trim())throw new Error('A photo needs a src URL.');
  const parsed=new URL(value,document.baseURI);
  const allowed=['http:','https:','blob:'].includes(parsed.protocol)||(parsed.protocol==='data:'&&/^data:image\//i.test(value))||(parsed.protocol==='file:'&&global.location.protocol==='file:');
  if(!allowed)throw new Error('Use an image URL or a relative image path.');
  return parsed.href;
}
function append(items,local=false){
  if(!Array.isArray(items))return Promise.reject(new TypeError('Pass an array of photos or files.'));
  const token=generation;
  queue=queue.catch(()=>{}).then(async()=>{
    const report={added:0,failed:[],skipped:0};
    if(destroyed||token!==generation)return report;
    const status=root.querySelector('#status');
    for(let i=0;i<items.length;i++){
      if(destroyed||token!==generation){report.skipped+=items.length-i;break;}
      if(photos.length>=options.maxPhotos){report.skipped+=items.length-i;break;}
      let owned;
      try{
        let entry;
        if(local){
          const file=items[i];if(!file.type.startsWith('image/'))throw new Error('Not an image file.');
          owned=URL.createObjectURL(file);ownedUrls.add(owned);entry={src:owned,name:file.name,alt:file.name};
        }else entry=typeof items[i]==='string'?{src:items[i]}:items[i];
        const src=imageUrl(entry.src),previewSrc=imageUrl(entry.previewSrc||entry.src);
        status.textContent='Loading photographs… '+(i+1)+' / '+items.length;
        const img=new Image();img.decoding='async';
        await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Image could not be loaded.'));img.src=previewSrc;});
        if(destroyed||token!==generation){if(owned){URL.revokeObjectURL(owned);ownedUrls.delete(owned);}break;}
        addImage(img,src,entry.name||entry.alt||'Photograph',{alt:entry.alt,previewSrc});
        fitCollection();update();report.added++;
      }catch(error){
        if(owned){URL.revokeObjectURL(owned);ownedUrls.delete(owned);}
        report.failed.push({index:i,message:error.message});
      }
    }
    if(!destroyed&&token===generation){
      status.textContent=report.failed.length?report.failed.length+' photograph(s) could not be loaded.':report.skipped?'Collection limit reached; '+report.skipped+' photograph(s) skipped.':'';
      changed();
    }
    return report;
  });
  return queue;
}
this.version='0.1.1';
this.setOptions=applyOptions;
this.getOptions=()=>({...options});
this.getPhotos=()=>photos.map(describe);
this.addPhotos=items=>append(items);
this.addFiles=items=>append(Array.from(items),true);
this.setPhotos=items=>{if(!Array.isArray(items))return Promise.reject(new TypeError('Pass an array of photos.'));clear();return append(items);};
this.clear=clear;
this.rescatter=scatter;
this.destroy=()=>{if(destroyed)return;clear();destroyed=true;cancelAnimationFrame(animationFrame);resizeObserver?.disconnect();events.abort();root.replaceChildren();};
applyOptions(config);
this.ready=append(config.photos||[]);
  }
}
Undertow.defaults=DEFAULTS;
global.Undertow=Undertow;
if(typeof module!=='undefined'&&module.exports)module.exports=Undertow;
})(typeof window!=='undefined'?window:globalThis);
