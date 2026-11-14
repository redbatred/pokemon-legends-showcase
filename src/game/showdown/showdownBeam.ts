import {vaultWard} from './vaultPresentation';
import {FLIGHT_TIME,smooth,type Point,type showdownLayout} from './showdownModel';
/** The shield is fixed in arena space. A recoil must never drag the collision point. */
export function guardContact(l:ReturnType<typeof showdownLayout>):Point{
 const ward=vaultWard(l);return {x:ward.x-ward.radius,y:ward.y};
}
/** A pressure jet extends along one axis, then extinguishes from mouth to guard. */
export function showdownBeam(mouth:Point,contact:Point,age:number){
 const flight=smooth(age/FLIGHT_TIME),collapse=smooth((age-FLIGHT_TIME)/.34);
 const along=(u:number)=>({x:mouth.x+(contact.x-mouth.x)*u,y:mouth.y+(contact.y-mouth.y)*u});
 return {start:along(collapse*.94),end:flight===1?{...contact}:along(flight),alpha:1-collapse,visible:age>=0&&age<FLIGHT_TIME+.34};
}
