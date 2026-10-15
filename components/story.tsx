'use client';

import { useRef, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { scrollToSection } from '@/lib/browser';
import type { TranslationKey } from '@/lib/i18n';
import { STORY_IMAGES } from '@/lib/assets';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function Story() {
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const { state, t } = useShop();

  const { contextSafe } = useGSAP(() => {
    const section = root.current;
    if (!section) return;
    const panels = gsap.utils.toArray<HTMLElement>('.story-panel', section);
    const media = gsap.matchMedia();
    media.add('(min-width: 900px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)', () => {
      section.dataset.motion = 'horizontal';
      let activeIndex = 0;
      const updateAccess = (index: number) => {
        panels.forEach((panel, i) => {
          panel.inert = i !== index;
          if (i === index) panel.removeAttribute('aria-hidden');
          else panel.setAttribute('aria-hidden', 'true');
        });
      };
      updateAccess(0);
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'maison-goya-story', trigger: section, start: 'top top',
          end: () => `+=${section.clientWidth * (panels.length - 1)}`,
          pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
            if (index !== activeIndex) { activeIndex = index; updateAccess(index); setActive(index); }
          },
        },
      });
      trigger.current = timeline.scrollTrigger ?? null;
      timeline.to(panels, { xPercent: -100 * (panels.length - 1), duration: panels.length - 1 }, 0);
      timeline.fromTo('.story-progress-fill', { scaleX: 0 }, { scaleX: 1, duration: panels.length - 1 }, 0);
      panels.forEach((panel, index) => {
        const background = panel.querySelector('.story-image-layer');
        const title = panel.querySelector('.story-title');
        const subtitle = panel.querySelector('.story-subtitle');
        const body = panel.querySelector('.story-body');
        const frame = panel.querySelector('.story-image-frame');
        if (index > 0) {
          timeline.fromTo(background, { xPercent: -12, scale: 1.14 }, { xPercent: 0, scale: 1.04, duration: 1 }, index - 1);
          timeline.fromTo(frame, { skewY: 1.7, scale: 0.96 }, { skewY: 0, scale: 1, duration: 0.85 }, index - 0.85);
          timeline.fromTo(title, { x: 110, skewY: 2.4, opacity: 0.2 }, { x: 0, skewY: 0, opacity: 1, duration: 0.9 }, index - 0.9);
          timeline.fromTo(subtitle, { x: 55, opacity: 0.2 }, { x: 0, opacity: 1, duration: 0.8 }, index - 0.8);
          timeline.fromTo(body, { x: 34, opacity: 0.1 }, { x: 0, opacity: 1, duration: 0.7 }, index - 0.7);
        }
        if (index < panels.length - 1) {
          timeline.to(background, { xPercent: 9, duration: 1 }, index);
          timeline.to(title, { x: -130, duration: 1 }, index);
          timeline.to(subtitle, { x: -65, duration: 1 }, index);
          timeline.to(body, { x: -35, duration: 1 }, index);
        }
      });
      gsap.from('.story-panel:first-child .intro-reveal', { y: 28, opacity: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out', delay: 0.1 });
      return () => {
        trigger.current = null;
        delete section.dataset.motion;
        panels.forEach((panel) => { panel.inert = false; panel.removeAttribute('aria-hidden'); });
      };
    });
    let alive = true;
    document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); }).catch(() => undefined);
    return () => { alive = false; media.revert(); };
  }, { scope: root });

  useGSAP(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, { scope: root, dependencies: [state.locale] });

  const goToChapter = (index: number) => contextSafe(() => {
      const current = trigger.current;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (current) window.scrollTo({ top: current.start + (current.end - current.start) * index / 3, behavior: reduce ? 'auto' : 'smooth' });
      else root.current?.querySelectorAll<HTMLElement>('.story-panel')[index]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setActive(index);
    })();

  return <section id="story" ref={root} className="story-root" tabIndex={-1} aria-label={t('story')}>
    <div className="story-track">
      {STORY_IMAGES.map((image, index) => {
        const n = index + 1;
        const key = (part: 'Title' | 'Accent' | 'Subtitle' | 'Body' | 'Alt') => `story${part}${n}` as TranslationKey;
        const Heading = index === 0 ? 'h1' : 'h2';
        return <article key={image} className={`story-panel story-panel--${n}`}>
          <div className="story-image-frame">
            <div className="story-image-layer"><MaisonImage index={image} alt={t(key('Alt'))} sizes="(min-width: 900px) 67vw, 100vw" preload={index === 0} className="story-photo" /></div>
          </div>
          <span className="story-outline-number" aria-hidden="true">0{n}</span>
          <div className="story-copy">
            <p className="eyebrow story-eyebrow intro-reveal"><span className="tiny-rule" />{t('storyEyebrow')}<span className="story-chapter-label"> / 0{n}</span></p>
            <Heading className="story-title intro-reveal">{t(key('Title'))}<em>{t(key('Accent'))}</em></Heading>
            <p className="story-subtitle intro-reveal">{t(key('Subtitle'))}</p>
            <p className="story-body intro-reveal">{t(key('Body'))}</p>
            <div className="story-cta intro-reveal">
              {index === 0 ? <a href="#collection" className="button button-gold" onClick={(event) => { event.preventDefault(); scrollToSection('collection'); }}>{t('explore')}<Icon name="arrow-up-right" /></a>
                : <a href={index === 3 ? '#atelier' : '#collection'} className="text-link" onClick={(event) => { event.preventDefault(); scrollToSection(index === 3 ? 'atelier' : 'collection'); }}>{t(index === 3 ? 'bookService' : 'explore')}<Icon name="arrow-up-right" /></a>}
            </div>
          </div>
          <p className="story-location">{t('madeBetween')}</p>
        </article>;
      })}
    </div>
    <div className="story-controls">
      <span className="scroll-cue"><Icon name="arrow-down" width={15} height={15} />{t('scrollHint')}</span>
      <div className="story-timeline">
        <span className="timeline-index" aria-label={t('storyCounter', { current: active + 1, total: 4 })}>0{active + 1}</span>
        <nav className="chapter-navigation" aria-label={t('chapters')}>
          <div className="story-progress-track" aria-hidden="true"><div className="story-progress-fill" /></div>
          {STORY_IMAGES.map((_, index) => <button key={index} type="button" onClick={() => goToChapter(index)} aria-label={`${t('chapter')} ${index + 1}`} aria-current={index === active ? 'step' : undefined}><span /></button>)}
        </nav>
        <span className="timeline-end">04</span>
      </div>
      <a className="story-skip" href="#collection" onClick={(event) => { event.preventDefault(); scrollToSection('collection'); }}>{t('skipStory')}<Icon name="arrow-right" width={16} height={16} /></a>
    </div>
  </section>;
}
