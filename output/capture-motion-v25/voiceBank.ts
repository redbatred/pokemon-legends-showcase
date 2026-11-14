/** Team Rocket are the rivals here, never on the player's side: they announce themselves when the legendary appears,
 * dare the player at the throw, jeer while the ball shakes, gloat over an escape and lose their temper over a catch. */
export type TauntPhase='arrive'|'throw'|'knock'|'escape'|'caught';
export const TAUNT_PHASES:TauntPhase[]=['arrive','throw','knock','escape','caught'];
export interface Taunt{id:string;phase:TauntPhase;character:'Jessie'|'James';pose:'challenge'|'smug'|'laugh'|'angry';text:string;duration:number;}
export const TAUNTS:Taunt[]=[
 {
  "id": "jessie-ready",
  "phase": "throw",
  "character": "Jessie",
  "pose": "challenge",
  "text": "You\u2019d better be ready for this!",
  "duration": 1.8190416666666667
 },
 {
  "id": "jessie-guts",
  "phase": "throw",
  "character": "Jessie",
  "pose": "challenge",
  "text": "Come on! Show some guts!",
  "duration": 2.44825
 },
 {
  "id": "jessie-ready-short",
  "phase": "arrive",
  "character": "Jessie",
  "pose": "challenge",
  "text": "Get ready!",
  "duration": 1.0945833333333332
 },
 {
  "id": "james-watch",
  "phase": "knock",
  "character": "James",
  "pose": "challenge",
  "text": "Watch and learn!",
  "duration": 1.2327916666666667
 },
 {
  "id": "james-plan",
  "phase": "arrive",
  "character": "James",
  "pose": "challenge",
  "text": "Put the plan into action!",
  "duration": 2.0345416666666667
 },
 {
  "id": "james-surrender",
  "phase": "throw",
  "character": "James",
  "pose": "challenge",
  "text": "Surrender now, or prepare to fight!",
  "duration": 2.534875
 },
 {
  "id": "jessie-trouble",
  "phase": "knock",
  "character": "Jessie",
  "pose": "smug",
  "text": "Prepare for trouble!",
  "duration": 1.7585833333333334
 },
 {
  "id": "jessie-laugh",
  "phase": "escape",
  "character": "Jessie",
  "pose": "smug",
  "text": "Ha ha ha!",
  "duration": 1.255375
 },
 {
  "id": "james-chuckle",
  "phase": "escape",
  "character": "James",
  "pose": "laugh",
  "text": "Heh heh\u2026",
  "duration": 0.9674166666666667
 },
 {
  "id": "james-laugh",
  "phase": "escape",
  "character": "James",
  "pose": "laugh",
  "text": "Ha ha ha!",
  "duration": 1.20375
 },
 {
  "id": "james-double",
  "phase": "knock",
  "character": "James",
  "pose": "challenge",
  "text": "Make it double!",
  "duration": 1.7095
 },
 {
  "id": "jessie-scene",
  "phase": "arrive",
  "character": "Jessie",
  "pose": "smug",
  "text": "Team Rocket on the scene!",
  "duration": 1.8967916666666667
 },
 {
  "id": "james-scene",
  "phase": "arrive",
  "character": "James",
  "pose": "challenge",
  "text": "Team Rocket on the scene!",
  "duration": 1.9349375
 },
 {
  "id": "jessie-notgood",
  "phase": "caught",
  "character": "Jessie",
  "pose": "angry",
  "text": "Not good, not good!",
  "duration": 1.7739583333333333
 },
 {
  "id": "james-nerve",
  "phase": "caught",
  "character": "James",
  "pose": "angry",
  "text": "The nerve!",
  "duration": 1.7514166666666666
 },
 {
  "id": "james-ohno",
  "phase": "caught",
  "character": "James",
  "pose": "angry",
  "text": "Oh no!",
  "duration": 1.1241666666666668
 }
];
/** Suspense selection has no outcome input; verdict reactions are separate. */
export function pickTaunt(phase:TauntPhase,previous?:string,random=Math.random):Taunt{const pool=TAUNTS.filter(c=>c.phase===phase&&c.id!==previous);return pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];}
