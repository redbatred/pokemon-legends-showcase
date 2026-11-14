// Virtual 60 fps clock for lab pages: the whole game (Pixi ticker, GSAP, three.js preparation) advances
// only when stepped, so captures stay deterministic even while the preview pane is throttled or hidden.
(()=>{const realNow=performance.now.bind(performance),origin=realNow(),dateOrigin=Date.now();let virtual=origin,handle=0;const queue=[];
performance.now=()=>virtual;Date.now=()=>dateOrigin+(virtual-origin);
window.requestAnimationFrame=cb=>{queue.push([++handle,cb]);return handle;};window.cancelAnimationFrame=id=>{const i=queue.findIndex(q=>q[0]===id);if(i>=0)queue.splice(i,1);};
const step=(ms=1000/60)=>{virtual+=ms;for(const [,cb] of queue.splice(0)){try{cb(virtual);}catch(error){console.error(error);}}};
let pump=setInterval(step,16);window.virtualClock={step,realNow,manual(){clearInterval(pump);pump=0;},auto(){if(!pump)pump=setInterval(step,16);},get now(){return virtual;}};})();
// A tab that is not being painted defers image decodes indefinitely, which stalls the game's start-up.
// Lab pages resolve on the load event instead, which still fires in the background.
HTMLImageElement.prototype.decode=function(){return this.complete&&this.naturalWidth?Promise.resolve():new Promise((resolve,reject)=>{this.addEventListener('load',()=>resolve(),{once:true});this.addEventListener('error',()=>reject(new Error('Image failed to load')),{once:true});});};
