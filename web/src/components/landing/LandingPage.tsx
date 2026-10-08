import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import type { InstrumentSynth } from '../../audio/instrumentSynth';
import { Hero } from './Hero';
import { InstrumentIndex } from './InstrumentIndex';
import { InstrumentChapter } from './InstrumentChapter';
import { FinalCTA } from './ClosingSections';
import { chapters } from './instruments';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function LandingPage() {
  const root = useRef<HTMLElement>(null);
  const synth = useRef<InstrumentSynth | null>(null);
  const [sound, setSound] = useState(false);
  const [ready, setReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioPending, setAudioPending] = useState(false);
  const mounted = useRef(false);
  useEffect(() => {
    let alive = true; mounted.current = true;
    void import('../../audio/instrumentSynth').then(({ InstrumentSynth }) => { if (alive) { synth.current = new InstrumentSynth(); setReady(true); } });
    const stop = () => { if (document.hidden) synth.current?.stopAll(); };
    document.addEventListener('visibilitychange', stop);
    return () => { alive = false; mounted.current = false; synth.current?.dispose(); synth.current = null; document.removeEventListener('visibilitychange', stop); };
  }, []);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const elements = root.current?.querySelectorAll<HTMLElement>(
        '.lp-section-heading, .lp-index-preview, .lp-index-list > li, .lp-chapters-heading, .lp-chapter-meta, .lp-chapter-art, .lp-chapter-copy, .lp-quote h2, .lp-quote-body, .lp-final-copy'
      );
      const cleanups: (() => void)[] = [];
      elements?.forEach(element => {
        const tween = gsap.from(element, {
          y: 32, opacity: 0, duration: .85, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true },
        });
        // Keyboard navigation must never land on an invisible control.
        const revealOnFocus = () => tween.progress(1);
        element.addEventListener('focusin', revealOnFocus);
        cleanups.push(() => element.removeEventListener('focusin', revealOnFocus));
      });
      root.current?.querySelectorAll<HTMLElement>('.lp-chapter').forEach((section, index) => {
        const image = section.querySelector<HTMLImageElement>('.lp-chapter-art img');
        if (!image) return;
        const smallScreen = window.matchMedia('(max-width: 620px)').matches;
        const tilt = smallScreen ? 3 : 6;
        const travel = smallScreen ? 6 : 12;
        const direction = index % 2 === 0 ? 1 : -1;
        const baseRotation = Number(gsap.getProperty(image, 'rotation')) || 0;
        gsap.fromTo(image,
          { yPercent: travel, rotation: baseRotation - tilt * direction },
          { yPercent: -travel, rotation: baseRotation + tilt * direction, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: .7, invalidateOnRefresh: true } }
        );
      });
      let active = true;
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
      return () => { active = false; cleanups.forEach(cleanup => cleanup()); };
    });
    media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ duration: 1.05, anchors: { offset: -90 } });
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(tick);
      void document.fonts.ready.then(() => { if (mounted.current) ScrollTrigger.refresh(); });
      return () => { gsap.ticker.remove(tick); lenis.destroy(); };
    });
    return () => media.revert();
  }, { scope: root });
  const playNote = (id: string, note: string) => synth.current?.playNote(id, note);
  const toggleSound = async () => {
    setAudioPending(true);
    const enabled = await synth.current?.setEnabled(!sound);
    if (mounted.current) { setSound(Boolean(enabled)); setAudioError(!sound && !enabled); setAudioPending(false); }
  };
  return <main className="lp" ref={root} id="landing-content">
    <a className="lp-skip" href="#nhac-cu">Đến danh sách nhạc cụ</a>
    <Hero playNote={playNote} />
    <InstrumentIndex playNote={playNote} />
    <div className="lp-chapters-heading lp-wrap"><p className="lp-label">Nhạc cụ nổi bật</p><h2>Mỗi nhạc cụ,<br /><i>một khởi đầu</i></h2><p>Không cần biết chơi từ trước<br />Chỉ cần một thanh âm bạn yêu thích</p></div>
    {chapters.map(chapter => <InstrumentChapter key={chapter.id} chapter={chapter} />)}
    <FinalCTA />
    <div className="lp-sound-control"><span role="status">{audioError ? 'Trình duyệt chưa bật được âm thanh. Hãy thử lại' : ''}</span><button disabled={!ready || audioPending} aria-label={sound ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-pressed={sound} onClick={() => void toggleSound()}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}<span>Âm thanh {sound ? 'bật' : 'tắt'}</span></button></div>
  </main>;
}
