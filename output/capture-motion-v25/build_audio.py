#!/usr/bin/env python3
"""Original procedural score for the isolated 18.6 s Legendary Capture / Escape proof.

Run: uv run --with numpy --with scipy output/capture-motion-v25/build_audio.py
No downloaded samples, borrowed melodies, voices, or existing game audio.
"""
from pathlib import Path
import hashlib
import json
import wave

import numpy as np
from scipy import signal

SR = 48000
DURATION = 18.6
N = int(SR * DURATION)
OUT = Path(__file__).resolve().parent / "audio"
RNG = np.random.default_rng(526941)


def timeline(d):
    return np.arange(round(d * SR)) / SR


def edge(x, attack=.006, release=.04):
    x = x.copy()
    a, r = min(round(attack * SR), len(x)), min(round(release * SR), len(x))
    if a:
        x[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if r:
        x[-r:] *= np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return x


def noise(d, low, high):
    x = RNG.standard_normal(round(d * SR))
    sos = signal.butter(3, [low, high], btype="bandpass", fs=SR, output="sos")
    x = signal.sosfilt(sos, x)
    return x / max(np.std(x), 1e-9)


def tone(d, f, decay=1, harmonics=(1, .12, .025)):
    t = timeline(d)
    x = sum(a * np.sin(2 * np.pi * f * (i + 1) * t) for i, a in enumerate(harmonics))
    return edge(x * np.exp(-t / decay))


def sweep(d, f0, f1, decay=None):
    t = timeline(d)
    x = signal.chirp(t, f0, d, f1, method="logarithmic", phi=90)
    if decay:
        x *= np.exp(-t / decay)
    return edge(x, .01, .055)


def pan(x, position=0):
    """Equal-power pan; position can be scalar or time-varying vector."""
    p = (np.asarray(position) + 1) * np.pi / 4
    return np.column_stack([x * np.cos(p), x * np.sin(p)])


def room(x, wet=.18, tail=.65):
    """Sparse early reflections and filtered late reflections, no hard feedback."""
    y = np.zeros((len(x) + round(tail * SR), 2))
    y[:len(x)] = x
    taps = [(.043, .65), (.079, .46), (.127, .35), (.191, .27),
            (.283, .19), (.397, .13), (.541, .08)]
    filtered = signal.sosfilt(signal.butter(2, 5200, fs=SR, output="sos"), x, axis=0)
    for i, (delay, gain) in enumerate(taps):
        offset = round(delay * SR)
        end = min(len(y), offset + len(x))
        y[offset:end] += filtered[:end-offset, ::-1 if i % 2 else 1] * wet * gain
    return y


def combine(*parts):
    n = max(len(x) for x in parts)
    out = np.zeros(n)
    for x in parts:
        out[:len(x)] += x
    return out


def chime(d, f):
    t = timeline(d)
    x = (np.sin(2*np.pi*f*t) * np.exp(-t/.48)
         + .16*np.sin(2*np.pi*f*2.003*t) * np.exp(-t/.22)
         + .05*np.sin(2*np.pi*f*3.997*t) * np.exp(-t/.09))
    return edge(x, .004, .08)


def tick(weight=1):
    t = timeline(.10)
    return edge(weight * (noise(.10, 950, 6500)*np.exp(-t/.007)*.35
                         + np.sin(2*np.pi*1850*t)*np.exp(-t/.018)*.4), .001, .025)


def whoosh(d, rise=True):
    t = timeline(d)
    envelope = np.sin(np.pi*t/d)**2
    air = noise(d, 500, 7000) * envelope
    tonal = sweep(d, 290 if rise else 1100, 1500 if rise else 230) * envelope
    return .32*air + .1*tonal


def write_wav(path, x):
    """24-bit PCM stereo, little endian."""
    integers = np.round(np.clip(x, -1, 1-2**-23) * (2**23-1)).astype(np.int32)
    packed = np.empty((integers.size, 3), dtype=np.uint8)
    flat = integers.reshape(-1)
    for b in range(3):
        packed[:, b] = (flat >> (8*b)) & 255
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(3)
        wav.setframerate(SR)
        wav.writeframes(packed.tobytes())


def db(x):
    return float(20 * np.log10(max(float(x), 1e-12)))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cues = []
    shared = np.zeros((N, 2))
    branches = {"shared": shared}

    def add(name, start, x, description, gain=1, position=0, wet=.18, branch="shared"):
        if x.ndim == 1:
            x = pan(x, position)
        x = room(x * gain, wet=wet) if wet else x * gain
        first = round(start * SR)
        size = min(len(x), N-first)
        branches[branch][first:first+size] += x[:size]
        cues.append(dict(name=name, branch=branch, start_seconds=start,
                         dry_plus_tail_seconds=round(len(x)/SR, 6),
                         description=description, audio=x))

    def thump(d=.24, frequency=120, strength=.3):
        t = timeline(d)
        body = sweep(d, frequency*1.45, frequency*.55, decay=.055)*strength
        texture = noise(d, 220, 2400)*np.exp(-t/.018)*strength*.22
        return edge(body+texture, .001, .03)

    def latch(strength=1, bright=1400):
        t = timeline(.18)
        metal = noise(.18, 900, 6200)*np.exp(-t/.008)*.16
        metal += tone(.18, bright, .035, (1,.14,.04))*.12
        body = thump(.18, 235, .12)
        return edge((metal+body)*strength,.001,.025)

    # Shared atmosphere is synthesized once, not re-randomized per outcome.
    t = timeline(DURATION)
    left = noise(DURATION, 95, 1450)
    right = .65*left + .55*noise(DURATION, 140, 1700)
    wash = np.column_stack([left, right])*.009
    wash *= (.82+.12*np.sin(2*np.pi*.16*t)+.06*np.sin(2*np.pi*.37*t))[:, None]
    wash += pan(.005*np.sin(2*np.pi*73.416*t)+.0025*np.sin(2*np.pi*110*t), 0)
    wash *= np.minimum(t/.35, 1)[:, None] * np.minimum((DURATION-t)/.4, 1)[:, None]
    add("cave-water-bed", 0, wash, "Quiet filtered cave air and water resonance", wet=0)
    for i,(when,pitch,position) in enumerate([(2.9,1320,-.6),(4.4,990,.55),(9.25,1170,-.4),(16.1,1440,.6)]):
        add(f"water-drop-{i+1}",when,sweep(.18,pitch*1.35,pitch,decay=.035)*.021,
            "Quiet original water droplet",position=position,wet=.5)

    for i,when in enumerate([.55,1.15,1.75]):
        add(f"socket-latch-{i+1}",when,latch(.7+i*.23,1300+i*180),
            "Progressively stronger mechanical socket latch with bright confirmation",wet=.11,
            position=(i-1)*.22)
    add("all-sockets-unlocked",2.05,combine(latch(1.1,2100),chime(.45,880)*.10),
        "All three sockets unlock: substantial click plus clean high bell",wet=.16)
    add("encounter-transition",2.15,whoosh(.70),"Broad stereo encounter swish",gain=.65,
        position=np.linspace(-.6,.6,round(.70*SR)),wet=.21)
    add("encounter-low-sting",2.25,combine(tone(.6,146.832,.3)*.10,tone(.6,220,.3)*.07),
        "Restrained low suspended encounter interval",wet=.25)

    t2 = timeline(1.65)
    presence = sum(np.sin(2*np.pi*f*t2+.25*np.sin(2*np.pi*.7*t2))*a
                   for f,a in [(146.832,.045),(220,.03),(293.665,.025),(622.254,.015)])
    presence *= np.sin(np.pi*t2/1.65)**1.3
    add("mewtwo-entrance",3.05,presence,"Psychic presence with warm low weight and hovering upper partials",wet=.5)
    add("entrance-pulse",3.05,thump(.3,96,.13),"Soft physical arrival pulse beneath psychic presence",wet=.22)
    add("throw-swoosh",5.1,whoosh(.65),"Fast focused throw sweep accelerating across stereo",gain=.72,
        position=np.linspace(-.55,.4,round(.65*SR)),wet=.10)
    ct = timeline(.22)
    pop = edge(noise(.22,900,6200)*np.exp(-ct/.012)*.16,.001,.025)
    add("contact-body-hit",5.85,combine(thump(.26,118,.43),pop,sweep(.20,1300,400,decay=.027)*.14),
        "Punchy body impact with compact air pop; no old battle boom",wet=.09)
    # The impact has a short decay, followed by an intentional near-silent gap.
    # Global duck starts after the punch and ends before the resistance cue.
    duck = np.ones(N)
    ds,de = round(6.04*SR),round(6.30*SR)
    duck[ds:de] = .12
    ramp = round(.018*SR)
    duck[ds:ds+ramp] = np.linspace(1,.12,ramp)
    duck[de-ramp:de] = np.linspace(.12,1,ramp)

    rt = timeline(.6)
    resistance = (np.sin(2*np.pi*92.5*rt)+.38*np.sin(2*np.pi*98*rt))*.055
    resistance *= np.sin(np.pi*rt/.6)**.65 * (.8+.2*np.sin(2*np.pi*8*rt))
    add("psychic-resistance",6.4,resistance,"Low restrained tension, beating psychic resistance",wet=.27)
    ignition_t=timeline(.22)
    ignition=edge(noise(.22,180,2800)*np.exp(-ignition_t/.055)*.095
                  +tone(.22,196,.075,(1,.32,.06))*.075,.005,.045)
    add("conversion-ignition",7.0,ignition,
        "Rounded psychic ignition blooms into the connected capture beam without a digital chirp",wet=.11)
    pt = timeline(1.1)
    progress = pt/1.1
    acceleration = .12+.88*progress**1.65
    # Continuous airflow avoids amplitude chopping. The stereo field contracts
    # as the coherent, accelerating psychic core takes over at the ball.
    intake = edge(acceleration, .12, .028)
    # One connected stream: rounded pressure, fluid resonance and wide air.
    # The low harmonic core rises smoothly without separate ion chirps.
    phase=2*np.pi*(104*pt+230*pt**2/2+190*pt**3/3)
    core=(np.sin(phase)*.18+np.sin(phase*2)*.075+np.sin(phase*3)*.022)*intake
    liquid=noise(1.1,180,1250)
    liquid*=.86+.14*np.sin(2*np.pi*(1.4*pt+.8*pt**2))
    core+=liquid*intake*.105
    orbit=np.sin(2*np.pi*.6*pt)*.36*(1-progress)**1.5
    vacuum=pan(core,orbit)
    for side in [-1,1]:
        air=noise(1.1,420,3900)*intake*.052
        vacuum+=pan(air,side*.92*(1-progress)**1.35)
    add("accelerating-suction",7.0,vacuum,
        "Single smooth powerful liquid-wind stream; rounded coherent core accelerates and contracts into the ball",wet=.075)
    stream=(noise(1.1,110,620)*.055+np.sin(phase*.5)*.08)*intake
    add("energy-conversion-flow",7.0,stream,
        "Continuous low fluid pressure binds the silhouette conversion to the suction stream without particle chirps",
        wet=.10)
    add("final-absorption",8.05,combine(sweep(.16,2200,180,decay=.045)*.17,
        thump(.28,146,.25)),"Fast inward air snap and audible harmonic body as the last psychic stream enters",wet=.08)
    add("absorption-weight",8.08,combine(tone(.44,73.416,.13,(1,.58,.24))*.19,
        tone(.32,146.832,.095,(1,.24,.06))*.12),
        "Deep absorption weight with warm 147 and 220 Hz harmonics for phone speakers",wet=.11)
    add("ball-closure",8.2,combine(latch(1.35,1750),thump(.28,145,.25),
        tone(.35,146.832,.10,(1,.35,.10))*.13),"Heavy compact seal with mechanical click and warm harmonic thump",wet=.1)
    add("ball-landing",8.55,thump(.26,135,.33),"Grounded rounded landing thud",wet=.16)
    add("ball-bounce",8.9,thump(.20,195,.18),"Small higher second bounce",wet=.14)
    for i,when in enumerate([9.8,10.65,11.5]):
        rt=timeline(.25)
        rock=(np.sin(2*np.pi*(310*rt-150*rt**2))*np.exp(-rt/.065)*.13
              +noise(.25,550,2800)*np.exp(-rt/.025)*.065)
        add(f"ball-rock-{i+1}",when,edge(rock,.002),"Muted shell rattle and physical ball rock",
            position=(-.15 if i%2==0 else .15),wet=.13)
    add("return-transition",17.3,whoosh(1.0,False),"Shared soft descending return transition",gain=.40,
        position=np.linspace(.4,-.4,round(1.0*SR)),wet=.12)
    shared *= duck[:,None]
    # Keep the beam continuously audible until the 8.1 s conversion endpoint.
    branches["capture"] = shared.copy()
    branches["escape"] = shared.copy()

    # CAPTURE: lock -> gathering energy -> hush -> foil whip -> full card reveal.
    double_click=np.zeros(round(.24*SR))
    first=latch(1.8,1850)
    second=latch(1.05,2400)
    double_click[:len(first)] += first
    offset=round(.045*SR)
    double_click[offset:offset+len(second)] += second
    add("capture-final-lock",12.2,double_click,"Two-layer final mechanical lock, second click at +45 ms",
        wet=.12,branch="capture")
    add("capture-lock-weight",12.2,combine(thump(.38,110,.34),tone(.6,220,.20,(1,.3,.08))*.16),
        "Solid final lock body, followed by an affirmative ringing tail",wet=.19,branch="capture")
    add("capture-lock-star",12.265,chime(.85,1174.659)*.11,
        "Bright confirmation sparkle after the latch has seated",wet=.28,branch="capture")
    st=timeline(.95)
    swell=sum(np.sin(2*np.pi*f*st)*a for f,a in [(146.832,.052),(293.665,.043),(369.994,.032),(440,.027)])
    swell *= np.sin(np.pi*st/.95)**.8 * (.4+.6*st/.95)
    add("capture-confirm-swell",12.2,swell,"Warm affirmative harmony gathers under the final lock",wet=.30,branch="capture")
    for i,(when,pitch) in enumerate([(12.38,293.665),(12.61,440),(12.84,587.330)]):
        add(f"lock-ascent-{i+1}",when,chime(.55,pitch),"Three restrained ascending glass steps gather expectation",
            gain=.060+i*.012,position=(i-1)*.16,wet=.28,branch="capture")
    gt=timeline(1.15)
    gather=(sweep(1.15,145,1480)*.085+noise(1.15,400,4200)*.034)*(gt/1.15)**1.6
    add("reveal-energy-gather",12.45,edge(gather,.025,.06),"Long accelerating tonal and air rise carries anticipation through the rising card",
        position=np.linspace(-.18,.18,len(gt)),wet=.10,branch="capture")
    at=timeline(.62)
    anticipation=(np.sin(2*np.pi*220*at)+.58*np.sin(2*np.pi*293.665*at)
                  +.24*np.sin(2*np.pi*440*at))*.048
    anticipation*=np.sin(np.pi*at/.62)**.7*(.35+.65*at/.62)
    add("card-rise-tension",13.1,anticipation,"Warm suspended A–D tension swells beneath the rising card before its turn",
        wet=.32,branch="capture")
    ft=timeline(.15)
    foil=noise(.15,2200,8500)*np.sin(np.pi*ft/.15)**2*.022
    add("card-unfold-foil",13.0,foil,"Fine tactile foil rustle at the beginning of the card flip",position=-.25,
        wet=.10,branch="capture")
    wt=timeline(.37)
    whip=(noise(.37,1000,7600)*.12+sweep(.37,430,2700)*.095)*np.sin(np.pi*wt/.37)**1.4
    whip *= .45+.55*wt/.37
    add("card-foil-whip",13.68,whip,"Bright foil and air whip follows the actual card turn into the face-on reveal",
        position=np.linspace(-.65,.65,len(wt)),wet=.13,branch="capture")
    it=timeline(.26)
    reveal_air=edge(noise(.26,1900,7400)*np.exp(-it/.025)*.15,.001,.05)
    reveal=combine(thump(.60,98,.44),tone(.75,73.416,.22,(1,.75,.32,.12))*.23,
        tone(.60,146.832,.19,(1,.32,.09))*.20,reveal_air,
        chime(1.6,1174.659)*.13,chime(1.6,1760)*.045)
    add("card-reveal-impact",14.05,reveal,
        "Emphatic legendary impact: warm 147/220/294 Hz body, deep fundamental, air snap and gleaming glass crown",
        wet=.34,branch="capture")
    add("legendary-reveal-bloom",14.05,combine(sweep(.6,170,62,decay=.12)*.14,
        chime(1.8,2349.318)*.045,whoosh(.65,False)*.20),
        "Expanding low impact and high golden bloom at the face-up reveal",wet=.35,branch="capture")
    ht=timeline(3.15)
    harmony=np.zeros((len(ht),2))
    for i,f in enumerate([146.832,220,293.665,369.994,440,587.330]):
        # Quiet detuning and slow attack create a wide, rounded orchestral-like bloom.
        voice=(np.sin(2*np.pi*f*ht)+.12*np.sin(2*np.pi*f*2*ht)+.035*np.sin(2*np.pi*f*3*ht))
        voice+=.22*np.sin(2*np.pi*f*1.0018*ht+.35)
        voice*=.047*np.minimum(ht/.14,1)*np.exp(-ht/2.6)
        harmony+=pan(edge(voice,.055,.65),(i-2.5)*.22)
    add("payout-chord",14.15,harmony,"Wide warm D-major triumph blooms at the award and sustains majestically to the return",
        wet=.44,branch="capture")
    for i,(when,pitch) in enumerate([(14.18,293.665),(14.48,440),(14.84,587.330),(15.3,739.989),(15.88,1174.659)]):
        # A slow rounded voiced rise feels ceremonial instead of a rapid reward jingle.
        ceremonial=tone(1.4,pitch,.85,(1,.26,.06))*.80+chime(1.4,pitch*2)*.20
        add(f"reveal-resolution-{i+1}",when,edge(ceremonial,.055,.30),
            "Original measured D–A–D–F#–D ceremonial rise, resolving over sustained major harmony",
            gain=.083 if i<4 else .10,position=(i-2)*.19,wet=.42,branch="capture")
    gl=timeline(.68)
    gleam=(sweep(.68,1450,4100)*.026+noise(.68,3800,8500)*.012)*np.sin(np.pi*gl/.68)**1.8
    add("legendary-foil-gleam",14.34,gleam,"Delicate continuous foil glint sweeps above the reveal without a harsh jingle",
        position=np.linspace(-.7,.7,len(gl)),wet=.26,branch="capture")

    # Duck the whole capture mix, including previous reverb tails and ambience.
    # This is a deliberate anticipatory hush, not silence from missing sound.
    hush=np.ones(N)
    hs,he=round(13.94*SR),round(14.035*SR)
    hush[hs:he]=.07
    hr=round(.012*SR)
    hush[hs:hs+hr]=np.linspace(1,.07,hr)
    hush[he-hr:he]=np.linspace(.07,1,hr)
    branches["capture"]*=hush[:,None]

    # ESCAPE: pressure reverses, a body reforms, then vanishes in smoke.
    et=timeline(.55)
    release_envelope=np.exp(-et/.13)*(1-np.exp(-et/.003))
    release=(noise(.55,150,4400)*.32+sweep(.55,175,1050)*.13)*release_envelope
    release+=thump(.55,87,.34)
    add("escape-ball-release",12.2,edge(release,.001,.065),
        "Powerful reversed pressure burst: inward vacuum breaks outward with a deep shell impulse",wet=.19,branch="escape")
    bt=timeline(.34)
    burst=combine(thump(.34,105,.24),edge(noise(.34,250,3900)*np.exp(-bt/.07)*.13,.002,.06))
    add("escape-unfolded-burst",12.45,burst,
        "Rounded body-pressure expansion reinforces the fully reconstructed escape pose",wet=.19,branch="escape")
    mt=timeline(.65)
    material=sweep(.65,1050,220)*np.sin(np.pi*mt/.65)**.8*.13
    material+=noise(.65,260,2400)*np.sin(np.pi*mt/.65)**1.3*.055
    material+=sum(np.sin(2*np.pi*f*mt)*.035 for f in [110,164.814,220])*np.sin(np.pi*mt/.65)**.8
    add("mewtwo-rematerialize",12.25,material,
        "Continuous reconstruction gathers a tangible body from outward energy through 12.9 seconds",position=np.linspace(-.2,.2,len(mt)),wet=.24,branch="escape")
    add("escape-foot-landing",13.05,combine(thump(.30,114,.28),latch(.23,720)),
        "Firm two-foot landing with a short stone contact texture",wet=.16,branch="escape")
    gt=timeline(.25)
    reject=sweep(.25,690,330,decay=.09)*.15+noise(.25,500,3300)*np.sin(np.pi*gt/.25)**2*.045
    add("psychic-reject",13.45,combine(reject,thump(.22,155,.10)),
        "Defiant reaction pulse, with a compact physical gesture and low descending refusal",wet=.19,branch="escape")
    smoke_t=timeline(.35)
    smoke_env=edge((smoke_t/.35)**1.4,.025,.012)
    smoke_gather=(noise(.35,130,1900)*.10+tone(.35,110,.6,(1,.22,.04))*.035)*smoke_env
    add("escape-smoke-buildup",14.3,smoke_gather,
        "Local low air pressure gathers around the body before the magician smoke poof",wet=.06,branch="escape")
    poof_t=timeline(.38)
    poof_env=(1-np.exp(-poof_t/.004))*np.exp(-poof_t/.065)
    poof_air=(noise(.38,100,1600)*.29+noise(.38,800,4800)*.12)*poof_env
    poof=combine(edge(poof_air,.002,.07),thump(.38,92,.32))
    add("escape-smoke-poof",14.65,poof,
        "Explosive soft air thump and broad puff mark the instant the body vanishes in magician smoke",
        wet=.12,branch="escape")
    whisper_t=timeline(.80)
    whisper_env=edge(np.exp(-whisper_t/.23),.04,.16)
    whisper=(noise(.80,700,5900)*.055+noise(.80,150,1100)*.025)*whisper_env
    add("escape-smoke-whisper",14.7,whisper,
        "Dissipating smoke whisper spreads gently sideways and fades by 15.5 seconds",
        position=np.linspace(-.12,.35,len(whisper_t)),wet=0,branch="escape")
    failure=combine(tone(.95,220,.42,(1,.06,.01))*.055,tone(.95,261.626,.42,(1,.05,.01))*.04,
                    tone(.95,293.665,.4,(1,.04,.01))*.025)
    add("escape-failure-sting",15.55,edge(failure,.035,.12),
        "Restrained unresolved A–C–D sting after departure; no affirmative success chord",wet=.3,branch="escape")

    # Broad, weighted wing downbeats emphasize Lugia's scale. Synthesize the
    # entrance once so capture and escape retain byte-identical prefixes.
    def wing_downbeat(strength=1):
        wt=timeline(.48)
        wing_env=(1-np.exp(-wt/.018))*np.exp(-wt/.115)
        feather_env=np.sin(np.pi*wt/.48)**1.7
        wing=(noise(.48,65,1200)*.24*wing_env
              +noise(.48,750,4600)*.085*feather_env)
        return edge(wing+thump(.48,76,.19),.003,.10)*strength

    branches["lugia-shared"]=np.zeros((N,2))
    for i,when in enumerate([3.25,3.8]):
        add(f"lugia-entrance-wing-{i+1}",when,wing_downbeat(1 if i==0 else .88),
            "Strong majestic wing downbeat with deep displaced-air weight and a wide feather wake",
            position=(-.32 if i==0 else .32),wet=.22,branch="lugia-shared")
    branches["lugia-capture"]=branches["capture"].copy()+branches["lugia-shared"]
    branches["lugia-escape"]=branches["escape"].copy()+branches["lugia-shared"]
    for i,when in enumerate([12.9,13.45]):
        add(f"lugia-escape-wing-{i+1}",when,wing_downbeat(1.08 if i==0 else .95),
            "Powerful escape wing downbeat restores Lugia's full physical scale before the smoke departure",
            position=(-.32 if i==0 else .32),wet=.18,branch="lugia-escape")
    score_branches=["capture","escape","lugia-capture","lugia-escape"]

    # Master outcomes jointly using exactly the same gain and bounded transfer.
    # No branch-dependent normalization: the first 12.2 seconds stay identical.
    ceiling=10**(-2.05/20)
    end_envelope=np.ones((N,1))
    fade=round(.15*SR)
    end_envelope[-fade:]=np.cos(np.linspace(0,np.pi/2,fade))[:,None]**2
    low,high=0.,20.
    for _ in range(40):
        gain=(low+high)/2
        energy=0
        for branch in score_branches:
            trial=ceiling*np.tanh(branches[branch]*gain/ceiling)*end_envelope
            energy+=np.mean(trial**2)
        if np.sqrt(energy/len(score_branches))<10**(-22.5/20): low=gain
        else: high=gain
    master_gain=(low+high)/2
    scores={}
    results={}
    for branch in score_branches:
        score=ceiling*np.tanh(branches[branch]*master_gain/ceiling)*end_envelope
        scores[branch]=score
        path=OUT/f"{branch}-score.wav"
        write_wav(path,score)
        results[branch]=dict(file=path.name,peak_dbfs=db(np.max(np.abs(score))),
            rms_dbfs=db(np.sqrt(np.mean(score**2))),sha256=hashlib.sha256(path.read_bytes()).hexdigest())
    branch_frame=round(12.2*SR)
    assert np.array_equal(scores["capture"][:branch_frame],scores["escape"][:branch_frame])
    assert np.array_equal(scores["lugia-capture"][:branch_frame],scores["lugia-escape"][:branch_frame])
    for cue in cues:
        x=ceiling*np.tanh(cue.pop("audio")*master_gain/ceiling)
        folder=OUT/cue["branch"]
        folder.mkdir(exist_ok=True)
        filename=cue["name"]+".wav"
        write_wav(folder/filename,x)
        cue["file"]=f"{cue['branch']}/{filename}"
    # Remove obsolete cue exports left by earlier versions of this isolated build.
    current_cue_paths={OUT/cue["file"] for cue in cues}
    for branch in ["shared","capture","escape","lugia-shared","lugia-capture","lugia-escape"]:
        for path in (OUT/branch).glob("*.wav"):
            if path not in current_cue_paths:
                path.unlink()
    report=dict(title="Legendary Capture / Escape — original procedural scores v7 — Mewtwo and Lugia",
        duration_seconds=DURATION,sample_rate=SR,frames=N,channels=2,bit_depth=24,
        branch_seconds=12.2,shared_prefix_frames=branch_frame,shared_prefix_byte_identical=True,
        shared_prefix_sha256=hashlib.sha256((OUT/"capture-score.wav").read_bytes()[44:44+branch_frame*6]).hexdigest(),
        master_linear_gain=master_gain,soft_limit_ceiling_dbfs=-2.05,
        joint_rms_target_dbfs=-22.5,scores=results,seed=526941,cues=cues,
        impact_silence={"start_seconds":6.04,"end_seconds":6.30,"gain":.12,"ramps_seconds":.018},
        continuous_beam={"start_seconds":7.0,"end_seconds":8.1,"intake_hush":False},
        reveal_hush={"branch":"capture","start_seconds":13.94,"end_seconds":14.035,"gain":.07,"ramps_seconds":.012},
        cue_exports="Individual audition files with the same mastering transfer; do not sum exactly to the score because of shared impact ducking, capture reveal hush and nonlinear mastering.",
        provenance={"method":"Original mathematical synthesis using numpy and scipy. All waveforms, noise, envelopes, reverb and musical gestures composed in build_audio.py.",
                    "external_assets":[],"borrowed_melodies":False,"voices":False,
                    "license_note":"No third-party recordings or audio assets are included."})
    (OUT/"cues.json").write_text(json.dumps(report,indent=2)+"\n")

    # Independently inspect the encoded PCM, rather than just the float buffers.
    encoded={}
    decoded={}
    checks={}
    for branch in score_branches:
        with wave.open(str(OUT/f"{branch}-score.wav"),"rb") as wav:
            assert (wav.getnchannels(),wav.getsampwidth(),wav.getframerate(),wav.getnframes()) == (2,3,SR,N)
            raw=wav.readframes(N)
        encoded[branch]=raw
        triplets=np.frombuffer(raw,dtype=np.uint8).reshape(-1,3).astype(np.int32)
        pcm=triplets[:,0] | (triplets[:,1]<<8) | (triplets[:,2]<<16)
        pcm=np.where(pcm & 0x800000,pcm-0x1000000,pcm).reshape(-1,2)/(2**23)
        decoded[branch]=pcm
        true_peak=db(np.max(np.abs(signal.resample_poly(pcm,4,1,axis=0))))
        assert true_peak <= -2.0, (branch,true_peak)
        assert np.all(np.isfinite(pcm)) and np.max(np.abs(pcm[-1])) == 0
        checks[branch]={"duration_seconds":len(pcm)/SR,"pcm_peak_dbfs":db(np.max(np.abs(pcm))),
                        "true_peak_4x_dbtp":true_peak,"rms_dbfs":db(np.sqrt(np.mean(pcm**2))),
                        "stereo_difference_rms_dbfs":db(np.sqrt(np.mean((pcm[:,0]-pcm[:,1])**2))),
                        "final_frame_is_zero":True}
    assert encoded["capture"][:branch_frame*6] == encoded["escape"][:branch_frame*6]
    assert encoded["lugia-capture"][:branch_frame*6] == encoded["lugia-escape"][:branch_frame*6]
    # Inspect the encoded mix for the intended continuous energy ramp and
    # sufficient mono low-mid impact; these are actual audible-band measures.
    def segment_rms(start,end):
        segment=decoded["capture"][round(start*SR):round(end*SR)]
        return db(np.sqrt(np.mean(segment**2)))

    pull_rms=[segment_rms(a,b) for a,b in [(7,7.35),(7.35,7.7),(7.7,8.0)]]
    assert pull_rms[0] < pull_rms[1] < pull_rms[2]
    phone_body={}
    for name,start,end in [("absorption",8.05,8.2),("seal",8.2,8.4),("legendary_reveal",14.05,14.3)]:
        mono=decoded["capture"][round(start*SR):round(end*SR)].mean(axis=1)
        audible=signal.sosfilt(signal.butter(3,[100,700],btype="bandpass",fs=SR,output="sos"),mono)
        phone_body[name]=db(np.sqrt(np.mean(audible**2)))
        assert phone_body[name] > -25
    joint_rms=db(np.sqrt(np.mean([np.mean(pcm**2) for pcm in decoded.values()])))
    assert abs(joint_rms-(-22.5)) < .01
    schedule={cue["name"]:cue["start_seconds"] for cue in cues}
    expected={"socket-latch-1":.55,"socket-latch-2":1.15,"socket-latch-3":1.75,
              "all-sockets-unlocked":2.05,"encounter-transition":2.15,"throw-swoosh":5.1,
              "contact-body-hit":5.85,"psychic-resistance":6.4,"accelerating-suction":7.0,
              "final-absorption":8.05,"absorption-weight":8.08,
              "ball-closure":8.2,"ball-landing":8.55,"ball-rock-1":9.8,"ball-rock-2":10.65,
              "ball-rock-3":11.5,"capture-final-lock":12.2,"card-rise-tension":13.1,"card-foil-whip":13.68,
              "card-reveal-impact":14.05,"payout-chord":14.15,"escape-ball-release":12.2,
              "escape-unfolded-burst":12.45,"escape-foot-landing":13.05,"psychic-reject":13.45,
              "conversion-ignition":7.0,"escape-smoke-buildup":14.3,"escape-smoke-poof":14.65,"escape-smoke-whisper":14.7,
              "lugia-entrance-wing-1":3.25,"lugia-entrance-wing-2":3.8,
              "lugia-escape-wing-1":12.9,"lugia-escape-wing-2":13.45,"return-transition":17.3}
    assert all(schedule[name] == when for name,when in expected.items())
    verification={"version":7,"passed":True,"channels":2,"sample_rate":SR,"bit_depth":24,
                  "shared_prefix_bytes_compared":branch_frame*6,"shared_prefix_byte_identical":True,
                  "lugia_shared_prefix_byte_identical":True,
                  "encoded_pcm_validated":True,"true_peak_ceiling_dbtp":-2,
                  "joint_rms_dbfs":joint_rms,"continuous_pull_window_rms_dbfs":pull_rms,
                  "mono_100_to_700_hz_impact_rms_dbfs":phone_body,
                  "escape_has_award_cues":any(cue["branch"] in ("escape","lugia-escape") and cue["name"].startswith(("payout","reveal-resolution","card-reveal")) for cue in cues),
                  "timing_checks":expected,"scores":checks,"cue_exports_count":len(cues)}
    assert not verification["escape_has_award_cues"]
    (OUT/"verification.json").write_text(json.dumps(verification,indent=2)+"\n")
    print(json.dumps({k:v for k,v in report.items() if k not in ["cues","provenance"]},indent=2))


if __name__ == "__main__":
    main()
