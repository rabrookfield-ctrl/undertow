const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function environment() {
  let nextFrame = 0, nextBlob = 0;
  const frames = new Map(), revoked = [], loaded = [];
  const context = new Proxy({createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]||(()=>{})});
  class Element {
    constructor(){this.events={};this.value='';this.style={};this.hidden=false;this.disabled=false;this.captures=new Set();const classes=new Set();this.classList={add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:(k,b)=>b?classes.add(k):classes.delete(k)};}
    addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
    fire(type,event={}){for(const fn of this.events[type]||[])fn(event);}
    getContext(){return context;}
    getBoundingClientRect(){return {left:0,top:0};}
    setPointerCapture(id){this.captures.add(id);}
    hasPointerCapture(id){return this.captures.has(id);}
    releasePointerCapture(id){this.captures.delete(id);}
    removeAttribute(name){delete this[name];}
    focus(){}
  }
  class Root {
    constructor(){this.elements=new Map();this.childNodes=[];}
    set innerHTML(value){this.html=value;this.childNodes=[{}];}
    querySelector(selector){if(!this.elements.has(selector))this.elements.set(selector,new Element());return this.elements.get(selector);}
    replaceChildren(){this.childNodes=[];}
  }
  class Host extends Element {
    constructor(){super();this.clientWidth=1200;this.clientHeight=800;this.shadowRoot=null;}
    attachShadow(){return this.shadowRoot=new Root();}
    dispatchEvent(event){this.fire(event.type,event);return true;}
  }
  class MockURL extends URL {
    static createObjectURL(){return 'blob:local-'+(++nextBlob);}
    static revokeObjectURL(url){revoked.push(url);}
  }
  class MockImage {
    naturalWidth=4000;naturalHeight=3000;
    set src(url){this.url=url;loaded.push(url);queueMicrotask(()=>url.includes('broken')?this.onerror():this.onload());}
  }
  class MockResizeObserver {constructor(callback){this.callback=callback;}observe(){}disconnect(){this.disconnected=true;}}
  const sandbox={URL:MockURL,Image:MockImage,AbortController,ResizeObserver:MockResizeObserver,
    document:{baseURI:'https://example.test/gallery/index.html',createElement:()=>new Element()},
    location:{protocol:'https:'},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},
    devicePixelRatio:1,performance:{now:()=>100},addEventListener(){},
    requestAnimationFrame:callback=>{frames.set(++nextFrame,callback);return nextFrame;},
    cancelAnimationFrame:id=>frames.delete(id)};
  const source=fs.readFileSync(path.join(__dirname,'../src/undertow.js'),'utf8');
  // Test access is inserted only in memory; the distributed engine has no test API.
  const instrumented=source.replace("this.version='0.1.0';", "this._test={photos:()=>photos,physics,stir};this.version='0.1.0';");
  vm.createContext(sandbox);vm.runInContext(instrumented,sandbox);
  const mount=options=>{const host=new Host();const gallery=new sandbox.Undertow(host,options);return {host,gallery,root:host.shadowRoot};};
  return {mount,loaded,revoked,frames};
}
const sample={src:'original.jpg',previewSrc:'preview.jpg',name:'Lake',alt:'Still water'};
function gesture(root,type,x,y,id=1,pointerType='mouse'){root.querySelector('#stage').fire(type,{clientX:x,clientY:y,pointerId:id,pointerType});}

test('independent visibility flags preserve the pile and configured settings', async()=>{
  const env=environment();const {gallery,root}=env.mount({photos:[sample],size:130,viscosity:55});await gallery.ready;
  const p=gallery._test.photos()[0];const before=JSON.stringify({x:p.x,y:p.y,a:p.a,z:p.z,card:p.card.width});
  for(const showControls of [false,true])for(const showAddPhotos of [false,true]){
    gallery.setOptions({showControls,showAddPhotos});
    assert.equal(root.querySelector('.panel').hidden,!showControls);
    assert.equal(root.querySelector('.upload').hidden,!showAddPhotos);
    assert.equal(root.querySelector('#files').disabled,!showAddPhotos);
    assert.equal(gallery.getOptions().size,130);assert.equal(gallery.getOptions().viscosity,55);
    assert.equal(JSON.stringify({x:p.x,y:p.y,a:p.a,z:p.z,card:p.card.width}),before);
  }
  assert.deepEqual(env.loaded,['https://example.test/gallery/preview.jpg']);
  assert.equal(gallery.getPhotos()[0].src,'https://example.test/gallery/original.jpg');
  gallery.destroy();assert.equal(env.frames.size,0);assert.equal(root.childNodes.length,0);
});

test('instances are isolated and slider edits are reflected in options',async()=>{
  const env=environment();const a=env.mount({photos:[sample]});const b=env.mount({showControls:false,size:80});await Promise.all([a.gallery.ready,b.gallery.ready]);
  a.root.querySelector('#size').value='175';a.root.querySelector('#size').fire('input');
  assert.equal(a.gallery.getOptions().size,175);assert.equal(b.gallery.getOptions().size,80);
  assert.equal(a.gallery.getPhotos().length,1);assert.equal(b.gallery.getPhotos().length,0);
  a.gallery.clear();assert.equal(b.gallery.getOptions().size,80);
  a.gallery.destroy();b.gallery.destroy();
});

test('hover catches a moving print; click views it; dragging still stirs',async()=>{
  const {gallery,root}=environment().mount({photos:[sample]});await gallery.ready;
  const p=gallery._test.photos()[0];Object.assign(p,{x:500,y:350,a:0,vx:8,vy:4,va:.04});
  gesture(root,'pointermove',490,350);for(let i=0;i<60;i++)gallery._test.physics();
  assert.equal(p.x,500);assert.equal(p.y,350);assert.equal(p.a,0);
  gesture(root,'pointerdown',490,350);gallery._test.physics();gesture(root,'pointerup',490,350);
  assert(root.querySelector('#viewer').classList.contains('open'));
  assert.equal(root.querySelector('#large').src,'https://example.test/gallery/original.jpg');
  root.querySelector('#close').fire('click');
  gesture(root,'pointerdown',500,350);gesture(root,'pointermove',530,360);gesture(root,'pointermove',560,380);gesture(root,'pointerup',560,380);
  assert.equal(p.x,560);assert.equal(p.y,380);gallery._test.physics();assert(p.x>560);
  Object.assign(p,{x:500,y:350,a:0,vx:0,vy:0,va:0});
  gesture(root,'pointerdown',300,350);gesture(root,'pointermove',350,350);gesture(root,'pointermove',400,350);gesture(root,'pointerup',400,350);
  assert(p.x>500&&p.vx>0);gallery.destroy();
});

test('failed images, capacity limits, replacement and local URL cleanup',async()=>{
  const env=environment();const {gallery}=env.mount({maxPhotos:2});await gallery.ready;
  const report=await gallery.addPhotos(['broken.jpg',sample,'second.jpg','third.jpg']);
  assert.equal(report.added,2);assert.equal(report.failed.length,1);assert.equal(report.skipped,1);
  const stale=gallery.addPhotos(['old.jpg']);const newer=gallery.setPhotos(['new.jpg']);await Promise.all([stale,newer]);
  assert.equal(gallery.getPhotos().length,1);assert(gallery.getPhotos()[0].src.endsWith('/new.jpg'));
  await gallery.setPhotos([]);await gallery.addFiles([{type:'image/jpeg',name:'Local photo'}]);
  assert.equal(gallery.getPhotos()[0].src,'blob:local-1');gallery.clear();assert(env.revoked.includes('blob:local-1'));
  const pending=gallery.addPhotos(['late.jpg']);gallery.destroy();await pending;assert.equal(gallery.getPhotos().length,0);
});

test('dense stacks remain free to overlap when controls are hidden',async()=>{
  const {gallery}=environment().mount({showControls:false,showAddPhotos:false,photos:Array.from({length:400},()=>sample)});await gallery.ready;
  for(const p of gallery._test.photos())Object.assign(p,{x:600,y:400,vx:0,vy:0,va:0});
  for(let i=0;i<60;i++)gallery._test.physics();
  assert(gallery._test.photos().every(p=>p.x===600&&p.y===400));
  gallery._test.stir(620,400,100,0);assert(gallery._test.photos().every(p=>p.x>620));gallery.destroy();
});
