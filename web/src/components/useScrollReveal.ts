import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Reveal once per visit; reduced-motion and keyboard users see content immediately. */
export function useScrollReveal(selector: string, contentKey: string | number = '') {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const cleanups: (() => void)[] = [];
      root.current?.querySelectorAll<HTMLElement>(selector).forEach(element => {
        const tween = gsap.from(element, {
          opacity: 0, y: 32, duration: .85, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true },
        });
        const reveal = () => tween.progress(1);
        element.addEventListener('focusin', reveal);
        cleanups.push(() => element.removeEventListener('focusin', reveal));
      });
      let active = true;
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
      // Course loading/error notices can change the catalogue's position.
      const resize = new ResizeObserver(() => ScrollTrigger.refresh());
      if (root.current) resize.observe(root.current);
      return () => { active = false; resize.disconnect(); cleanups.forEach(cleanup => cleanup()); };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [selector, contentKey], revertOnUpdate: true });
  return root;
}
