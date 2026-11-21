// Body Hop sound: code-generated sound effects (ZzFX) and one calm generative music track.
// No audio files and nothing downloaded: every sound is synthesized in the browser.
//
// window.BodyHopAudio:
//   unlock()       create/resume the AudioContext (also done automatically on the first key or pointer press)
//   play(name)     play a cue from CUES below ("step:G", "hop:C", "gate-open", "win", ...)
//   setBody(t)     t is "S", "G" or "C": cross-fades the music to that body's layer (about 2 s)
//   levelChange()  a new level: dips the music briefly without cutting it
//   setSfx(on), setMusic(on), sfx, music   on/off flags, saved in localStorage
//   log            the last 100 cue names requested by the game, plus "body:X" music changes (for tools/bot.js)
//   ctx, master    the AudioContext and the last node before the speakers (read-only, for diagnostics)
// Before the first user gesture every call is a silent no-op (the log still records it) and nothing throws.
(function () {
  "use strict";

  // ---------- sound effects ----------
  // Every sound is a ZzFX parameter array. To tune one, paste it into the ZzFX designer
  // (https://killedbyapixel.github.io/ZzFX) as zzfx(...[ ... ]), adjust, and copy the array back.
  // Parameter order: volume, randomness, frequency, attack, sustain, release, shape, shapeCurve,
  //   slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise, modulation, bitCrush, delay,
  //   sustainVolume, decay, tremolo, filter (shape: 0 sine, 1 triangle, 2 saw, 3 tan, 4 noise;
  //   filter < 0 is low-pass, > 0 high-pass; the cutoff is about twice the number, in Hz).
  // Randomness is applied at play time as a small pitch change (the buffers are rendered once).
  // Repeated sounds (steps, blocked) are quieter than rare ones. The music is in D, so tones sit on D and A.
  const SOUNDS = {
    stepS:     [.28,.08,700,.03,0,.1,4,1,0,0,0,0,0,0,0,0,0,1,0,0,-900],          // airy breath (soft noise)
    stepG:     [.25,.06,72,.004,.03,.12,1,1,-.4,0,0,0,0,0,0,0,0,1,0,0,-220],     // low, heavy thud
    stepC:     [.35,.1,1300,0,0,.025,1,1,0,0,0,0,0,0,0,0,.04,1,0,0,-1800],       // light double patter
    whoosh:    [.6,0,300,.07,.03,.14,4,1,4,0,0,0,0,0,0,0,0,1,0,0,-1100],         // rising air, start of a hop
    landG:     [.75,0,146.8,.01,.06,.45,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],          // hop lands low: D3
    landGBack: [.75,0,146.8,.01,.06,.45,0,1,0,0,73.2,.09,0,0,0,0,0,1,0,0,0],     // back in a guard: D3 up to A3
    landC:     [.6,0,587.3,.005,.04,.35,1,1,0,0,0,0,0,0,0,0,0,1,0,0,-1300],      // hop lands high: D5
    landCBack: [.6,0,587.3,.005,.04,.35,1,1,0,0,293.4,.07,0,0,0,0,0,1,0,0,-1300],// back in a cat: D5 up to A5
    blocked:   [.22,0,130,.004,.02,.08,1,1,-.4,0,0,0,0,0,0,0,0,1,0,0,-280],      // soft dull bump
    gateOpen:  [.95,0,293.7,.03,.12,.35,1,1,0,0,146.3,.1,0,0,0,0,.08,1,0,0,-1100],// rising D4 to A4, echoing
    gateShut:  [.95,0,440,.03,.12,.35,1,1,0,0,-146.3,.1,0,0,0,0,.12,1,0,0,-800], // falling A4 to D4
    plateDown: [.5,0,220,.004,.04,.14,1,1,-.6,0,0,0,0,0,0,0,0,1,0,0,-450],       // plate sinks: soft thunk
    plateUp:   [.45,0,180,.004,.04,.14,1,1,.6,0,0,0,0,0,0,0,0,1,0,0,-450],       // plate springs back up
    plateGhost:[.25,0,880,0,0,.04,0,1,0,0,0,0,0,0,0,0,.05,1,0,0,0],              // spirit on a plate: hollow tick
    shimmer:   [.4,0,1760,.03,.1,.3,0,1,0,0,0,0,.035,0,0,0,0,1,0,.6,0],          // walking into an unseen block
    bell:      [.6,0,293.7,.005,.05,.9,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],           // D4 bell, pitched for win and start
    undo:      [.3,0,660,0,.02,.07,0,1,-4,0,0,0,0,0,0,0,0,1,0,0,0],              // quick descending blip
    restart:   [.35,0,900,.04,.12,.22,1,1,-3,0,0,0,0,0,0,0,0,1,0,0,-800],        // soft rewind sweep
    ui:        [.1,0,1600,0,0,.015,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],               // very quiet tick
  };

  // Cue name -> parts: [sound, delay in s, pitch in semitones, gain].
  const CUES = {
    "step:S": [["stepS"]], "step:G": [["stepG"]], "step:C": [["stepC"]],
    "hop:G": [["whoosh"], ["landG", .12]], "hop:G:back": [["whoosh"], ["landGBack", .12]],
    "hop:C": [["whoosh"], ["landC", .12]], "hop:C:back": [["whoosh"], ["landCBack", .12]],
    "blocked": [["blocked"]],
    "gate-open": [["gateOpen"]], "gate-shut": [["gateShut"]],
    "plate-down": [["plateDown"]], "plate-up": [["plateUp"]], "plate-ghost": [["plateGhost"]],
    "shimmer": [["shimmer"]],
    "win": [["bell", 0, -12], ["bell", .16, -8], ["bell", .32, -5], ["bell", .48, 0, .8]], // D3 F#3 A3 D4, with a music swell
    "start": [["bell", 0, -5, .3], ["bell", .18, 0, .25]],                                // soft A3 then D4
    "undo": [["undo"]], "restart": [["restart"]], "ui": [["ui"]],
  };

  /*
    ZzFX - Zuper Zmall Zound Zynth v1.4.0 by Frank Force
    https://github.com/KilledByAPixel/ZzFX
    (buildSamples only, vendored unchanged apart from being a standalone function)

    ZzFX MIT License

    Copyright (c) 2019 - Frank Force

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
  */
  const ZZFX_RATE = 44100, ZZFX_VOLUME = .3;
  function zzfxBuildSamples
  (
      volume = 1,
      randomness = .05,
      frequency = 220,
      attack = 0,
      sustain = 0,
      release = .1,
      shape = 0,
      shapeCurve = 1,
      slide = 0,
      deltaSlide = 0,
      pitchJump = 0,
      pitchJumpTime = 0,
      repeatTime = 0,
      noise = 0,
      modulation = 0,
      bitCrush = 0,
      delay = 0,
      sustainVolume = 1,
      decay = 0,
      tremolo = 0,
      filter = 0
  )
  {
      // init parameters
      let sampleRate = ZZFX_RATE,
          PI2 = Math.PI*2,
          abs = Math.abs,
          sign = v => v<0?-1:1,
          startSlide = slide *= 500 * PI2 / sampleRate / sampleRate,
          startFrequency = frequency *=
              (1 + randomness*2*Math.random() - randomness) * PI2 / sampleRate,
          modOffset = 0, // modulation offset
          repeat = 0,    // repeat offset
          crush = 0,     // bit crush offset
          jump = 1,      // pitch jump timer
          length,        // sample length
          b,             // sample buffer
          t = 0,         // sample time
          i = 0,         // sample index
          s = 0,         // sample value
      f,             // wave frequency

      // biquad LP/HP filter
      quality = 2, w = PI2 * abs(filter) * 2 / sampleRate,
      cos = Math.cos(w), alpha = Math.sin(w) / 2 / quality,
      a0 = 1 + alpha, a1 = -2*cos / a0, a2 = (1 - alpha) / a0,
      b0 = (1 + sign(filter) * cos) / 2 / a0,
      b1 = -(sign(filter) + cos) / a0, b2 = b0,
      x2 = 0, x1 = 0, y2 = 0, y1 = 0;

      // scale by sample rate
      const minAttack = 9; // prevent pop if attack is 0
      attack = attack * sampleRate || minAttack;
      decay *= sampleRate;
      sustain *= sampleRate;
      release *= sampleRate;
      delay *= sampleRate;
      deltaSlide *= 500 * PI2 / sampleRate**3;
      modulation *= PI2 / sampleRate;
      pitchJump *= PI2 / sampleRate;
      pitchJumpTime *= sampleRate;
      repeatTime = repeatTime * sampleRate | 0;

      // allocate the full sample buffer up front, much faster than growing an array
      length = attack + decay + sustain + release + delay | 0;
      b = new Float32Array(length > 0 ? length : 0);

      // generate waveform
      for(; i < length; b[i++] = s * volume)                 // sample
      {
          if (!(++crush%(bitCrush*100|0)))                   // bit crush
          {
              s = shape? shape>1? shape>2? shape>3? shape>4? // wave shape
                  (t/PI2%1 < shapeCurve/2? 1 : -1) :         // 5 square duty
                  Math.sin(t**3) :                           // 4 noise
                  Math.max(Math.min(Math.tan(t),1),-1):      // 3 tan
                  1-(2*t/PI2%2+2)%2:                         // 2 saw
                  1-4*abs(Math.round(t/PI2)-t/PI2):          // 1 triangle
                  Math.sin(t);                               // 0 sin

              s = (repeatTime ?
                      1 - tremolo + tremolo*Math.sin(PI2*i/repeatTime) // tremolo
                      : 1) *
                  (shape>4?s:sign(s)*abs(s)**shapeCurve) * // shape curve
                  (i < attack ? i/attack :                 // attack
                  i < attack + decay ?                     // decay
                  1-((i-attack)/decay)*(1-sustainVolume) : // decay falloff
                  i < attack  + decay + sustain ?          // sustain
                  sustainVolume :                          // sustain volume
                  i < length - delay ?                     // release
                  (length - i - delay)/release *           // release falloff
                  sustainVolume :                          // release volume
                  0);                                      // post release

              s = delay ? s/2 + (delay > i ? 0 :           // delay
                  (i<length-delay? 1 : (length-i)/delay) * // release delay
                  b[i-delay|0]/2/volume) : s;              // sample delay

              if (filter)                                  // apply filter
                  s = y1 = b2*x2 + b1*(x2=x1) + b0*(x1=s) - a2*y2 - a1*(y2=y1);
          }

          f = (frequency += slide += deltaSlide) *// frequency
              Math.cos(modulation*modOffset++);   // modulation
          t += f + f*noise*(i*i*PI2%2-1);         // noise

          if (jump && ++jump > pitchJumpTime)     // pitch jump
          {
              frequency += pitchJump;             // apply pitch jump
              startFrequency += pitchJump;        // also apply to start
              jump = 0;                           // stop pitch jump time
          }

          if (repeatTime && !(++repeat % repeatTime)) // repeat
          {
              frequency = startFrequency;   // reset frequency
              slide = startSlide;           // reset slide
              jump ||= 1;                   // reset pitch jump time
          }
      }

      return b; // return sample buffer
  }
  // ---------- end of ZzFX ----------

  // ---------- music ----------
  // One generative ambient track in D major pentatonic at 72 bpm, synthesized live (no loop, no seam).
  // It stays low and soft: sines, or triangles through a low-pass, slow attacks, nothing above MAX_NOTE.
  // Each body has its own layer (a pad plus sparse notes) in about the same register; they differ mainly
  // in colour (the guard darkest, the cat brightest). A hop drifts between layers over about 2 s.
  const ROOT = 146.83;            // D3
  const SCALE = [0, 2, 4, 7, 9];  // D E F# A B
  const BEAT = 60 / 72;
  const MAX_NOTE = 800;           // Hz: higher notes are folded down an octave
  const hz = (oct, semi) => ROOT * 2 ** (oct - 3 + semi / 12);
  const LAYERS = {
    // spirit: thin and open, plain sines on D3/A3/D4, lots of reverb and space between notes
    S: { pad: [["sine", hz(3, 0), .03, 0], ["sine", hz(3, 7), .05, 3], ["sine", hz(4, 0), .03, -3]], cutoff: 1200, dry: .45, wet: 1,
         notes: { oct: [4, 4], every: [4, 8], type: "sine", attack: .6, release: 4, gain: .1, cutoff: 1200 } },
    // guard (red): warm and darkest, triangles on D3/A3 under a low low-pass, a hint of sub bass, slow notes
    G: { pad: [["sine", hz(2, 0), .006, 0], ["triangle", hz(3, 0), .03, -4], ["triangle", hz(3, 7), .06, 5]], cutoff: 700, dry: .9, wet: .45,
         notes: { oct: [3, 4], every: [5, 9], type: "triangle", attack: .3, release: 3.5, gain: .09, cutoff: 900 } },
    // cat (blue): the brightest but still mellow, triangles on A3/D4/F#4 and a more open low-pass
    C: { pad: [["sine", hz(3, 7), .035, 0], ["triangle", hz(4, 0), .04, 6], ["sine", hz(4, 4), .025, -6]], cutoff: 1500, dry: .7, wet: .7,
         notes: { oct: [4, 5], every: [3, 6], type: "triangle", attack: .15, release: 2.5, gain: .08, cutoff: 1500 } },
  };
  const MUSIC_LEVEL = .42, SFX_LEVEL = 1, FADE = .6; // FADE: setTargetAtTime constant, ~95% after 1.8 s

  // ---------- state ----------
  const log = [];
  const pushLog = (name) => { log.push(name); if (log.length > 100) log.shift(); };
  const load = (k) => { try { return localStorage.getItem(k) !== "0"; } catch (e) { return true; } };
  const save = (k, on) => { try { localStorage.setItem(k, on ? "1" : "0"); } catch (e) { /* storage unavailable */ } };
  let sfxOn = load("bodyhop-sfx"), musicOn = load("bodyhop-music");
  let ctx = null, master = null, sfxBus = null, musicBus = null, musicShape = null, buffers = null, layers = null;
  let body = "S", nextNote = 0, degree = 2, timer = null;

  function unlock() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        build();
      }
      if (ctx.state !== "running" && !document.hidden && (sfxOn || musicOn)) ctx.resume().catch(() => {});
    } catch (e) { ctx = null; /* audio unavailable: stay silent */ }
  }

  function build() {
    // Master chain: sfx bus + music bus -> master gain -> compressor (gentle, limits peaks) -> speakers.
    const mix = ctx.createGain(); mix.gain.value = .9;
    master = ctx.createDynamicsCompressor();
    master.threshold.value = -12; master.knee.value = 6; master.ratio.value = 12;
    master.attack.value = .003; master.release.value = .25;
    mix.connect(master).connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxOn ? SFX_LEVEL : 0; sfxBus.connect(mix);
    // musicBus is the on/off switch; musicShape dips the music on a level change and swells it on a win.
    musicBus = ctx.createGain(); musicBus.gain.value = 0;
    musicShape = ctx.createGain(); musicShape.gain.value = 1;
    musicBus.connect(musicShape).connect(mix);

    buffers = {};
    for (const [name, p] of Object.entries(SOUNDS)) {
      const params = p.slice(); params[1] = 0; // render without randomness; it is applied as pitch on play
      const data = zzfxBuildSamples(...params);
      const buf = ctx.createBuffer(1, Math.max(1, data.length), ZZFX_RATE);
      for (let i = 0; i < data.length; i++) data[i] *= ZZFX_VOLUME;
      buf.getChannelData(0).set(data);
      buffers[name] = { buf, rnd: p[1] || 0 };
    }

    buildMusic();
    if (musicOn) musicBus.gain.setTargetAtTime(MUSIC_LEVEL, ctx.currentTime, 1);
    nextNote = ctx.currentTime + BEAT * 2;
    timer = setInterval(schedule, 100);
  }

  function impulse(seconds, decay) {
    const n = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** decay;
    }
    return buf;
  }

  function buildMusic() {
    const reverb = ctx.createConvolver();
    reverb.buffer = impulse(3.5, 3);
    reverb.connect(musicBus);
    layers = {};
    for (const [t, def] of Object.entries(LAYERS)) {
      const out = ctx.createGain(); out.gain.value = t === body ? 1 : 0;
      const dry = ctx.createGain(); dry.gain.value = def.dry; out.connect(dry).connect(musicBus);
      const wet = ctx.createGain(); wet.gain.value = def.wet; out.connect(wet).connect(reverb);
      // The pad: a few soft oscillators through a low-pass, breathing with a slow LFO.
      const filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = def.cutoff; filt.Q.value = .3;
      const pad = ctx.createGain(); pad.gain.value = .8;
      pad.connect(filt).connect(out);
      const lfo = ctx.createOscillator(); lfo.frequency.value = .05 + Math.random() * .04;
      const depth = ctx.createGain(); depth.gain.value = .2; lfo.connect(depth).connect(pad.gain); lfo.start();
      for (const [type, f, g, detune] of def.pad) {
        const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = detune;
        const og = ctx.createGain(); og.gain.value = g;
        o.connect(og).connect(pad); o.start();
      }
      layers[t] = { out, def };
    }
  }

  // Sparse notes for the current body, scheduled a little ahead on a shared beat grid.
  function schedule() {
    if (!ctx || ctx.state !== "running" || !musicOn) return;
    const now = ctx.currentTime;
    if (nextNote < now) nextNote = now + .05;
    while (nextNote < now + .5) {
      const { def } = layers[body], n = def.notes;
      degree = Math.max(0, Math.min(SCALE.length * 2 - 1, degree + [-2, -1, 1, 2][Math.random() * 4 | 0]));
      const oct = n.oct[0] + Math.min(n.oct[1] - n.oct[0], degree / SCALE.length | 0);
      let f = hz(oct, SCALE[degree % SCALE.length]);
      while (f > MAX_NOTE) f /= 2;
      note(layers[body].out, f, nextNote, n);
      nextNote += BEAT * (n.every[0] + Math.floor(Math.random() * (n.every[1] - n.every[0] + 1)));
    }
  }

  function note(dest, f, at, n) {
    const o = ctx.createOscillator(); o.type = n.type; o.frequency.value = f;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = n.cutoff;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(n.gain, at + n.attack);
    env.gain.setTargetAtTime(0, at + n.attack, n.release / 4);
    o.connect(lp).connect(env).connect(dest);
    o.start(at); o.stop(at + n.attack + n.release * 1.5);
  }

  // Move the music's level shaper: [gain, seconds to get there] steps, starting from where it is now.
  function shape(steps) {
    const g = musicShape.gain, now = ctx.currentTime;
    const cur = g.value; g.cancelScheduledValues(now); g.setValueAtTime(cur, now);
    let t = now;
    for (const [v, dt] of steps) g.linearRampToValueAtTime(v, t += dt);
  }

  // A new level (load, restart, next, skip): never cut the music, just dip it about 6 dB and bring it back.
  function levelChange() {
    if (ctx) shape([[.5, .4], [1, 1.5]]);
  }

  function play(name) {
    if (!CUES[name]) return;
    pushLog(name);
    if (!ctx || ctx.state !== "running") return;
    if (name === "win") shape([[1.35, .6], [1.35, 2], [1, 1.5]]); // a gentle swell (+2.6 dB) under the arpeggio
    if (!sfxOn) return;
    try {
      const now = ctx.currentTime;
      for (const [sound, delay = 0, semis = 0, gain = 1] of CUES[name]) {
        const { buf, rnd } = buffers[sound];
        const src = ctx.createBufferSource(); src.buffer = buf;
        src.playbackRate.value = 2 ** (semis / 12) * (1 + rnd * (Math.random() * 2 - 1));
        const g = ctx.createGain(); g.gain.value = gain;
        src.connect(g).connect(sfxBus);
        src.start(now + delay);
      }
    } catch (e) { /* never let sound break the game */ }
  }

  function setBody(t) {
    if (!LAYERS[t] || t === body) return;
    body = t;
    pushLog("body:" + t);
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const [k, l] of Object.entries(layers)) l.out.gain.setTargetAtTime(k === t ? 1 : 0, now, FADE);
  }

  // Suspend the context when nothing can be heard (tab hidden, or both sounds off).
  function wake() {
    if (!ctx) return;
    if (document.hidden || (!sfxOn && !musicOn)) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  }

  function setSfx(on) {
    sfxOn = !!on; save("bodyhop-sfx", sfxOn);
    if (ctx) sfxBus.gain.setTargetAtTime(sfxOn ? SFX_LEVEL : 0, ctx.currentTime, .02);
    wake();
  }

  function setMusic(on) {
    musicOn = !!on; save("bodyhop-music", musicOn);
    if (ctx) {
      musicBus.gain.setTargetAtTime(musicOn ? MUSIC_LEVEL : 0, ctx.currentTime, musicOn ? .5 : .2);
      nextNote = ctx.currentTime + .2;
    }
    wake();
  }

  addEventListener("keydown", unlock, true);
  addEventListener("pointerdown", unlock, true);
  document.addEventListener("visibilitychange", wake);

  window.BodyHopAudio = Object.freeze({
    unlock, play, setBody, levelChange, setSfx, setMusic, log,
    get sfx() { return sfxOn; }, get music() { return musicOn; },
    get ctx() { return ctx; }, get master() { return master; },
  });
})();
