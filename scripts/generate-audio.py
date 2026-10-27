"""Original procedural UI sound design; no sampled Pokemon audio."""
import math, random, wave, struct
from pathlib import Path
out = Path('public/assets/audio'); out.mkdir(parents=True, exist_ok=True)
random.seed(7)
for name, duration in [('tear', .62), ('flip', .25), ('reveal', .65), ('rare', 1.7), ('complete', 1.2), ('credit', .14)]:
    rate = 22050; samples = []
    prev = 0
    for i in range(int(duration * rate)):
        t = i / rate; x = t / duration
        if name in ('tear', 'flip'):
            noise = random.uniform(-1, 1)
            high = noise - prev; prev = noise
            envelope = math.sin(math.pi * x) ** (1.2 if name == 'tear' else 3)
            v = high * envelope * (.2 + .1 * math.sin(t*90))
        else:
            notes = [523.25, 659.25, 783.99, 1046.5] if name != 'rare' else [392, 587.33, 783.99, 1174.66, 1567.98]
            v = 0
            for j, freq in enumerate(notes):
                tt = t - j * (.09 if name == 'rare' else .06)
                if tt >= 0:
                    envelope = min(1, tt * 150) * math.exp(-tt * (3.5 if name == 'rare' else 6))
                    v += (math.sin(2*math.pi*freq*tt) + .18*math.sin(2*math.pi*freq*2*tt)) * envelope / len(notes) * .55
            v *= min(1, (duration-t)*15)
        samples.append(struct.pack('<h', int(max(-1, min(1, v))*28000)))
    with wave.open(str(out / (name + '.wav')), 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(rate); f.writeframes(b''.join(samples))
