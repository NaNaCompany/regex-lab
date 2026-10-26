import {runRegex} from './core.js';
self.onmessage=event=>{try{self.postMessage({ok:true,result:runRegex(event.data)});}catch(error){self.postMessage({ok:false,error:error.message});}};
