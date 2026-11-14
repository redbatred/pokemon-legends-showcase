import Foundation
import AVFoundation
let engine=AVAudioEngine(), rate=48000.0
let format=AVAudioFormat(standardFormatWithSampleRate:rate,channels:2)!
let bank=URL(fileURLWithPath:"/System/Library/Components/CoreAudio.component/Contents/Resources/gs_instruments.dls")
var parts:[AVAudioUnitSampler]=[]
// Strings, brass, picked bass, rock organ, orchestral percussion.
for program:UInt8 in [48,61,34,18,0] {
 let s=AVAudioUnitSampler(); engine.attach(s);engine.connect(s,to:engine.mainMixerNode,format:format)
 try s.loadSoundBankInstrument(at:bank,program:program,bankMSB:parts.count==4 ? 120 : 121,bankLSB:0)
 s.masterGain = parts.count==0 ? -9 : parts.count==1 ? -8 : parts.count==2 ? -7 : parts.count==3 ? -18 : -7
 parts.append(s)
}
struct Event {var at:Double;var part:Int;var note:UInt8;var velocity:UInt8;var on:Bool}
var events:[Event]=[]
func note(_ part:Int,_ n:Int,_ at:Double,_ duration:Double,_ velocity:Int){events.append(Event(at:at,part:part,note:UInt8(n),velocity:UInt8(velocity),on:true));events.append(Event(at:at+duration,part:part,note:UInt8(n),velocity:0,on:false))}
let beat=60.0/160.0, start=6.15
let roots=[50,46,53,48,50,46,43,45]
let melody=[[74,77,81,79,77,74,72,74],[70,74,77,79,77,74,70,72],[77,81,84,81,79,77,76,74],[72,76,79,81,79,76,72,69]]
for bar in 0..<16 {
 let b=start+Double(bar)*beat*4; let root=roots[bar%8];let minor=[0,3,7,12]
 for step in 0..<16 {let at=b+Double(step)*beat/4;note(0,root+12+minor[[0,2,1,3][step%4]],at,beat*0.21,step%4==0 ? 89 : 65)}
 for step in 0..<8 {let at=b+Double(step)*beat/2;note(2,root-12+(step==6 ? 7 : 0),at,beat*0.39,step%2==0 ? 102 : 78);note(4,step%2==0 ? 42 : 44,at,0.08,step%2==0 ? 58 : 43)}
 for step in [0,2,3] {note(4,36,b+Double(step)*beat,0.13,105)}
 for step in [1,3] {note(4,38,b+Double(step)*beat,0.14,100);note(4,39,b+Double(step)*beat+0.014,0.09,65)}
 if bar%4==0 {note(4,49,b,beat*1.7,91)}
 for n in [root+12,root+19,root+24] {note(3,n,b,beat*3.8,53)}
 for step in 0..<8 {if step==3||step==7{continue};note(1,melody[bar%4][step],b+Double(step)*beat/2,beat*(step==6 ? 0.85:0.4),step%2==0 ? 95:75)}
 if bar%4==3 {for k in 0..<4 {note(4,45-k,b+3*beat+Double(k)*beat/4,0.1,78+k*6)}}
}
events.sort{$0.at<$1.at}
try engine.enableManualRenderingMode(.offline,format:format,maximumFrameCount:256)
try engine.start()
let out=URL(fileURLWithPath:CommandLine.arguments[1]);let file=try AVAudioFile(forWriting:out,settings:format.settings)
let buffer=AVAudioPCMBuffer(pcmFormat:format,frameCapacity:256)!
var cursor=0
while engine.manualRenderingSampleTime<Int64(rate*32) {
 let time=Double(engine.manualRenderingSampleTime)/rate
 while cursor<events.count && events[cursor].at<=time {
  let e=events[cursor];if e.on {parts[e.part].startNote(e.note,withVelocity:e.velocity,onChannel:e.part==4 ? 9:0)}else{parts[e.part].stopNote(e.note,onChannel:e.part==4 ? 9:0)};cursor+=1
 }
 let result=try engine.renderOffline(256,to:buffer)
 if result == .success {try file.write(from:buffer)}
}
engine.stop();print(out.path)
