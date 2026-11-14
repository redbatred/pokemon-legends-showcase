#!/usr/bin/env python3
"""Reproducible original psychic-vault sound design; Python standard library only.

No downloaded samples or copyrighted recordings. All layers are oscillator,
filtered-noise, frequency-modulation, and delay-network synthesis. PCM WAV keeps
sample-accurate attacks (no encoder delay). Run from any working directory.
"""
import array
import hashlib
import json
import math
from pathlib import Path
import random
import sys
import wave

RATE = 48000
TAU = 2 * math.pi
OUT = Path(__file__).resolve().parents[1] / 'public/assets/audio-showdown-v8'
RNG = random.Random(81065)


class Mix:
    def __init__(self, duration):
        self.n = round(duration * RATE)
        self.channels = [[0.0] * self.n, [0.0] * self.n]

    def add(self, values, at=0, gain=1, pan=0):
        start = round(at * RATE)
        levels = (math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4))
        for channel, level in zip(self.channels, levels):
            for i, value in enumerate(values[:max(0, self.n-start)]):
                channel[start+i] += value * gain * level

    def room(self, wet=.18):
        # Asymmetric, non-feedback reflections keep low-frequency punch centered
        # while stretching only the upper resonance into a wide stone chamber.
        dry = [channel[:] for channel in self.channels]
        for ch in range(2):
            for seconds, amount in ((.043,.52),(.079,.39),(.131,.31),(.211,.23),(.337,.15)):
                delay = round((seconds + ch * .009) * RATE)
                source = dry[1-ch]
                smooth = 0.0
                for i in range(self.n-delay):
                    smooth += .26 * (source[i]-smooth)
                    self.channels[ch][i+delay] += smooth * amount * wet


def tone(duration, hz, end=None, attack=.005, decay=.35, fm=0, mod=2.01, rising=False):
    result = []
    phase = 0.0
    end = hz if end is None else end
    for i in range(round(duration * RATE)):
        t = i/RATE
        u = t/duration
        freq = hz * (end/hz)**u
        phase += TAU*freq/RATE
        envelope = min(1, t/max(attack,1/RATE)) * (u**1.35 if rising else math.exp(-t/decay))
        envelope *= min(1, max(0,duration-t)/.025)
        result.append(math.sin(phase + fm * math.sin(phase*mod)*math.exp(-t/.4))*envelope)
    return result


def air(duration, low=200, high=4500, attack=.005, decay=.2, rising=False):
    result=[]
    lower=upper=0.0
    a=1-math.exp(-TAU*low/RATE)
    b=1-math.exp(-TAU*high/RATE)
    for i in range(round(duration*RATE)):
        t=i/RATE
        white=RNG.uniform(-1,1)
        lower+=a*(white-lower)
        upper+=b*(white-upper)
        envelope=min(1,t/max(attack,1/RATE))*( (t/duration)**1.8 if rising else math.exp(-t/decay))
        envelope*=min(1,max(0,duration-t)/.012)
        result.append((upper-lower)*envelope)
    return result


def sparkle(mix, at, frequencies, gain=.14, spacing=.045, decay=.24):
    for j,hz in enumerate(frequencies):
        mix.add(tone(.9,hz,attack=.002,decay=decay,fm=.6,mod=2.73),at+j*spacing,gain,(-.65 if j%2 else .65))


def enter():
    m=Mix(1.6)
    m.add(air(.7,100,1400,attack=.12,decay=.4),gain=.65)
    m.add(tone(1.55,58,43,attack=.04,decay=.55),gain=.66)
    for hz,pan in ((174,-.6),(261,.6),(348,-.25)):
        m.add(tone(1.45,hz,hz*.985,attack=.13,decay=.6,fm=.2),at=.04,gain=.16,pan=pan)
    sparkle(m,.18,[1046.5,1568,2093],.055,.12,.25)
    m.room(.26)
    return m


def charge():
    m=Mix(1.0)
    # A low rising power bed, beating FM pair, and narrow shimmering air crest.
    m.add(tone(.99,66,132,attack=.05,rising=True),gain=.5)
    for hz,pan in ((176,-.55),(179,.55)):
        m.add(tone(.99,hz,hz*3,attack=.07,fm=1.2,mod=1.5,rising=True),gain=.28,pan=pan)
    m.add(air(.99,700,7000,attack=.12,rising=True),gain=.7)
    sparkle(m,.59,[1396.9,1760,2093,2793.8],.045,.09,.12)
    return m


def hit(heavy=False):
    m=Mix(.88 if heavy else .74)
    m.add(tone(.58,148 if heavy else 195,47 if heavy else 70,decay=.095,fm=.8),gain=.9)
    m.add(air(.16,750,8500,attack=.001,decay=.022),gain=.85)
    for hz,pan in ((330,-.35),(527,.4),(883,-.6),(1361,.6)):
        m.add(tone(.66,hz*(.82 if heavy else 1),attack=.001,decay=.17,fm=1.9,mod=1.414),gain=.18,pan=pan)
    # The second hit adds a low double crack and falling crystal stress.
    if heavy:
        m.add(air(.12,1500,10000,attack=.001,decay=.018),at=.045,gain=.48,pan=.3)
        m.add(tone(.63,1700,560,attack=.002,decay=.14,fm=1.1),at=.027,gain=.12,pan=-.45)
    m.room(.18)
    return m


def fracture():
    m=Mix(1.52)
    # Silence after the 180 ms inward inhale makes the 200 ms transient read.
    m.add(air(.18,240,6500,attack=.005,rising=True),gain=.8)
    m.add(tone(.18,950,110,attack=.004,rising=True,fm=.8),gain=.3)
    m.add(tone(1.25,103,33,attack=.002,decay=.24,fm=.3),at=.2,gain=1.22)
    m.add(tone(.35,230,48,attack=.001,decay=.06,fm=2.5,mod=1.73),at=.2,gain=.65)
    m.add(air(.7,180,9000,attack=.001,decay=.085),at=.2,gain=1.1)
    sparkle(m,.212,[2349,3136,4186,2637,3520,4699],.22,.031,.31)
    m.add(air(.95,1800,9000,attack=.02,decay=.3),at=.32,gain=.24,pan=.6)
    # Apply the chamber only to the burst, so no pre-impact echo fills the gap.
    burst=Mix(1.52)
    for ch in range(2):
        burst.channels[ch][round(.2*RATE):]=m.channels[ch][round(.2*RATE):]
    burst.room(.23)
    for ch in range(2):
        m.channels[ch][round(.2*RATE):]=burst.channels[ch][round(.2*RATE):]
    return m


def reward():
    m=Mix(2.2)
    m.add(air(.5,350,5000,attack=.06,decay=.16),gain=.42)
    m.add(tone(1.65,130.81,attack=.02,decay=.46),gain=.4)
    # Cmaj(add9): broad, warm arrival with an ascending glass signature.
    for hz,pan in ((261.63,-.4),(329.63,.4),(392,-.2),(587.33,.2)):
        m.add(tone(1.95,hz,attack=.08,decay=.63,fm=.2),at=.04,gain=.17,pan=pan)
    sparkle(m,.03,[1046.5,1318.5,1568,2349.3],.23,.085,.5)
    sparkle(m,.52,[2093,3136],.065,.15,.38)
    m.room(.28)
    return m


RECIPES={
    'vault-enter': (enter,.42,'Low chamber pressure, violet harmonic resonance, distant glass',0),
    'vault-charge': (charge,.44,'Rising sub bed, beating FM voices, widening filtered air',0),
    'vault-hit': (lambda:hit(False),.49,'Dry shield crack, short low punch, tuned glass stress',0),
    'vault-hit-heavy': (lambda:hit(True),.51,'Lower shield punch, double crack, falling crystal stress',0),
    'vault-break': (fracture,.58,'180 ms inward suction, 20 ms gap, bass fracture and stereo shards',.2),
    'vault-reward': (reward,.43,'Warm Cmaj(add9) arrival, ascending glass bells and chamber decay',0),
}


def write(name,mix,gain,intent,impact):
    # Shared gentle saturation, -3.5 dBFS ceiling, and 12 ms end fade.
    channels=[[math.tanh(v*1.1) for v in ch] for ch in mix.channels]
    scale=10**(-3.5/20)/max(abs(v) for ch in channels for v in ch)
    pcm=array.array('h')
    for i in range(mix.n):
        fade=min(1,i/48,(mix.n-1-i)/(RATE*.012))
        for ch in channels:
            pcm.append(round(ch[i]*scale*fade*32767))
    if sys.byteorder!='little':pcm.byteswap()
    path=OUT/f'{name}.wav'
    with wave.open(str(path),'wb') as out:
        out.setnchannels(2);out.setsampwidth(2);out.setframerate(RATE);out.writeframes(pcm.tobytes())
    samples=[v/32768 for v in pcm]
    peak=max(abs(v) for v in samples)
    rms=math.sqrt(sum(v*v for v in samples)/len(samples))
    return {'files':{'wav':f'/assets/audio-showdown-v8/{name}.wav'},'duration':mix.n/RATE,'gain':gain,
            'peakDbfs':round(20*math.log10(peak),3),'rmsDbfs':round(20*math.log10(rms),3),
            'channels':2,'sampleRate':RATE,'impactOffset':impact,'intent':intent,
            'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}


if __name__=='__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    manifest={name:write(name,build(),gain,intent,impact) for name,(build,gain,intent,impact) in RECIPES.items()}
    (OUT/'cues.json').write_text(json.dumps(manifest,indent=2)+'\n')
    (OUT/'provenance.json').write_text(json.dumps({'authoring':'Original procedural synthesis; no external samples',
        'generator':'scripts/generate-vault-audio-v8.py','seed':81065,'format':'48 kHz stereo PCM16 WAV',
        'timelineSeconds':{'entry':0,'shieldHits':[3,5.8,8.6],'breakCue':8.6,'breakTransient':8.8,'reward':10.65},
        'processing':'Layered oscillator/FM and filtered noise; asymmetric chamber delays; tanh saturation; -3.5 dBFS peak ceiling'},indent=2)+'\n')
    for name,cue in manifest.items():
        print(f"{name:18} {cue['duration']:4.2f}s  peak {cue['peakDbfs']:6.2f} dBFS  RMS {cue['rmsDbfs']:6.2f} dBFS  gain {cue['gain']}")
