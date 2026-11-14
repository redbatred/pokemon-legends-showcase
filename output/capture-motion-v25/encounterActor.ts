import {createLugiaActor} from './lugiaActor';
import {createCaptureActor} from './characterActor';
import type {EncounterProfile} from './encounter';
const adapters={winged:createLugiaActor,humanoid:createCaptureActor};
export function createEncounterActor(profile:EncounterProfile){return adapters[profile.rig](profile);}
