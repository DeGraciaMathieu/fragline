// ---- tunables -----------------------------------------------------------
export const CFG = {
  W:1120, H:720,                         // arena size (px)
  MOVE:185, ACCEL:8, FRICTION:7, STOP:40, // movement (px/s) — deliberate, readable pace
  DASH:400, DASH_CD:1.4,                  // dash impulse + cooldown (s)
  R:15,                                   // actor radius
  MAX_HP:100, RESPAWN:2.2,
  BOT_VIEW:380,                           // px detection range
  BOT_REACT:0.45, BOT_AIM_LERP:5.0,       // reaction delay (s) + aim tracking speed
  GRAB:26, CAPTURE:40, FLAG_RETURN:12, WIN:3,
};
export const BLUE=0, RED=1;
export const COLS={0:'#3b9dff',1:'#ff4d4d'};
export const COLD={0:'#1c4f7a',1:'#7a2a2a'};    // dim variants
