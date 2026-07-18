// ---- audio (tiny WebAudio) ----------------------------------------------
let AC=null;
export function actx(){ if(!AC){try{AC=new(AudioContext||webkitAudioContext)();}catch(e){}} return AC; }
export function zap(f=520,d=0.18,type='sawtooth',v=0.13){
  const c=actx(); if(!c)return; const o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(f,c.currentTime);
  o.frequency.exponentialRampToValueAtTime(f*0.4,c.currentTime+d);
  g.gain.setValueAtTime(v,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d);
}
