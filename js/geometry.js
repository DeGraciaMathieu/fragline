// ---- geometry helpers (pure functions) ----------------------------------
export function circleRect(cx,cy,r,R){
  const nx=Math.max(R.x,Math.min(cx,R.x+R.w));
  const ny=Math.max(R.y,Math.min(cy,R.y+R.h));
  const dx=cx-nx,dy=cy-ny,d2=dx*dx+dy*dy;
  if(d2<r*r){ const d=Math.sqrt(d2)||0.001;
    if(d2>0)return{px:dx/d*(r-d),py:dy/d*(r-d)};
    // deep inside: push out shortest axis
    const l=cx-R.x,rr=R.x+R.w-cx,t=cy-R.y,b=R.y+R.h-cy;
    const m=Math.min(l,rr,t,b);
    if(m===l)return{px:-(l+r),py:0}; if(m===rr)return{px:rr+r,py:0};
    if(m===t)return{px:0,py:-(t+r)}; return{px:0,py:b+r};
  } return null;
}
// ray vs axis rect -> nearest t in [0,1] or Infinity
export function rayRect(x0,y0,dx,dy,len,R){
  let tmin=0,tmax=len;
  for(const [p,d,lo,hi] of [[x0,dx,R.x,R.x+R.w],[y0,dy,R.y,R.y+R.h]]){
    if(Math.abs(d)<1e-6){ if(p<lo||p>hi)return Infinity; }
    else{ let t1=(lo-p)/d,t2=(hi-p)/d; if(t1>t2)[t1,t2]=[t2,t1];
      tmin=Math.max(tmin,t1); tmax=Math.min(tmax,t2); if(tmin>tmax)return Infinity; }
  }
  return tmin>=0?tmin:Infinity;
}
export function rayCircle(x0,y0,dx,dy,cx,cy,r){
  const fx=x0-cx,fy=y0-cy;
  const b=2*(fx*dx+fy*dy), c=fx*fx+fy*fy-r*r;
  const disc=b*b-4*c; if(disc<0)return Infinity;
  const t=(-b-Math.sqrt(disc))/2; return t>=0?t:Infinity;
}
export function losClear(ax,ay,bx,by,walls){
  let dx=bx-ax,dy=by-ay; const len=Math.hypot(dx,dy)||1; dx/=len;dy/=len;
  for(const w of walls){ if(rayRect(ax,ay,dx,dy,len-2,w)<len-2) return false; }
  return true;
}
export function d2(ax,ay,bx,by){const dx=ax-bx,dy=ay-by;return dx*dx+dy*dy;}
