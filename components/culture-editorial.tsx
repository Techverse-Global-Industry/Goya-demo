'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { CULTURE_STORIES, CULTURE_STORY_BY_SLUG } from '@/lib/culture-stories';
import type { CultureStory } from '@/lib/culture-stories';
import { cultureEditorialCopy } from '@/lib/culture-editorial-copy';
import { presentationCopy } from '@/lib/presentation-copy';
import { localizedText, siteText, translatedCopy } from '@/lib/international';
import { gsap, useGSAP } from '@/lib/gsap';
import { Header } from './header';
import { Footer } from './editorial';
import { Overlays } from './overlays';
import { Toast } from './controls';
import { CampaignMedia } from './campaign-media';
import { Icon } from './icon';

const storyFor=(slug:string)=>CULTURE_STORY_BY_SLUG.get(slug)!;

function CultureShell({children,className=''}:{children:ReactNode;className?:string}) {
  const root=useRef<HTMLElement>(null);const pathname=usePathname();
  useGSAP(()=>{const media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{gsap.utils.toArray<HTMLElement>('.exact-editorial-reveal').forEach(element=>gsap.from(element,{y:18,opacity:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:element,start:'top 90%',once:true}}));});return()=>media.revert();},{scope:root,dependencies:[pathname],revertOnUpdate:true});
  return <><Header/><main id="public-content" className={'exact-culture-page '+className} ref={root}>{children}</main><Footer/><Overlays/><Toast/></>;
}

function EditorialGallery({images,video}:{images:readonly string[];video?:boolean}) {
  const {state}=useShop();const c=translatedCopy(cultureEditorialCopy[state.locale],state.language);const rail=useRef<HTMLDivElement>(null);const [edges,setEdges]=useState({previous:false,next:true});
  const update=()=>{const node=rail.current;if(node)setEdges({previous:Math.abs(node.scrollLeft)>2,next:Math.abs(node.scrollLeft)<node.scrollWidth-node.clientWidth-2});};
  const move=(direction:number)=>{const node=rail.current;if(node)node.scrollBy({left:direction*node.clientWidth/4*(state.language==='ar'?-1:1),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
  return <section className="exact-editorial-gallery" aria-label={c.gallery}><div className="exact-editorial-gallery-rail" ref={rail} tabIndex={0} onScroll={update} onKeyDown={event=>{if(event.key==='Home'){event.preventDefault();rail.current?.scrollTo({left:0});}if(event.key==='End'){event.preventDefault();rail.current?.scrollTo({left:state.language==='ar'?-rail.current.scrollWidth:rail.current.scrollWidth});}}}>{images.map((src,index)=><figure key={src}>{video&&index===0?<CampaignMedia src="/videos/goya-craft.mp4" poster={src} alt={c.photograph}/>:<Image src={src} alt={c.photograph} fill sizes="(min-width:800px) 24vw,45vw"/>}</figure>)}</div><div className="exact-editorial-gallery-controls"><button type="button" aria-label={siteText(state.language,'Previous image','Image précédente')} disabled={!edges.previous} onClick={()=>move(-1)}><Icon name="chevron-left" width={18}/></button><button type="button" aria-label={siteText(state.language,'Next image','Image suivante')} disabled={!edges.next} onClick={()=>move(1)}><Icon name="chevron-right" width={18}/></button></div></section>;
}

export function MaisonEditorial() {
  const {state}=useShop();const c=translatedCopy(cultureEditorialCopy[state.locale],state.language);const presentation=translatedCopy(presentationCopy[state.locale],state.language);
  const heritage=storyFor('l-heritage-croise'),roots=storyFor('des-racines-et-des-horizons'),craft=storyFor('le-geste-et-la-transmission'),encounter=storyFor('une-rencontre-creative');
  const panels=[{title:c.signature,image:heritage.image,body:[presentation.maisonBody,presentation.maisonSecond],alt:heritage.alt},{title:c.roots,image:roots.image,body:[localizedText(roots.paragraphs[0],state.language),localizedText(roots.paragraphs[1],state.language)],alt:roots.alt},{title:c.gesture,image:craft.image,body:[localizedText(craft.paragraphs[0],state.language),localizedText(craft.paragraphs[1],state.language)],alt:craft.alt,film:true},{title:c.encounter,image:encounter.image,body:[localizedText(encounter.paragraphs[0],state.language),localizedText(encounter.paragraphs[1],state.language)],alt:encounter.alt,source:encounter.source}];
  return <CultureShell className="exact-maison-page">{panels.map((panel,index)=><section key={panel.title} className={'exact-maison-panel'+(index%2?' exact-maison-panel--reverse':'')}><div className={'exact-maison-panel-media'+(index===0||index===3?' exact-maison-panel-media--monochrome':'')}>{panel.film?<CampaignMedia src="/videos/goya-craft.mp4" poster={panel.image} alt={localizedText(panel.alt,state.language)}/>:<Image src={panel.image} alt={localizedText(panel.alt,state.language)} fill preload={index===0} sizes="(min-width:800px) 50vw,100vw"/>}</div><div className="exact-maison-panel-copy"><div className="exact-editorial-reveal">{index===0?<h1 className="exact-editorial-kicker">{c.goyaIs}</h1>:<p className="exact-editorial-kicker">{c.goyaIs}</p>}<h2>{panel.title}</h2>{panel.body.map((paragraph,position)=><p key={position}>{paragraph}</p>)}{panel.source&&<a className="exact-editorial-source" href={panel.source.url} target="_blank" rel="noreferrer">{localizedText(panel.source.label,state.language)}<Icon name="arrow-up-right" width={13}/></a>}</div></div></section>)}</CultureShell>;
}

export function CraftsmanshipEditorial() {
  const {state}=useShop();const c=translatedCopy(cultureEditorialCopy[state.locale],state.language);const presentation=translatedCopy(presentationCopy[state.locale],state.language);const story=storyFor('le-geste-et-la-transmission');
  return <CultureShell className="exact-atelier-page"><header className="exact-editorial-opening"><div className="exact-editorial-opening-media"><Image src={story.image} alt={localizedText(story.alt,state.language)} fill preload sizes="(min-width:800px) 50vw,100vw"/></div><div className="exact-editorial-opening-copy exact-editorial-reveal"><h1>{c.atelier}</h1><h2>{c.knowledge}</h2><p>{localizedText(story.intro,state.language)}</p></div></header><blockquote className="exact-editorial-quotation exact-editorial-reveal">{presentation.craftCaption}</blockquote><EditorialGallery images={['/images/campaign/goya-craft-poster.webp','/images/campaign/goya-signature.webp','/images/img1.jpg','/images/archive/goya-12.jpg','/images/campaign/goya-care-poster.webp']} video/><div className="exact-editorial-paragraph-band exact-editorial-paragraph-band--three">{story.paragraphs.map((paragraph,index)=><p key={index}>{localizedText(paragraph,state.language)}</p>)}</div><div className="exact-editorial-full-image"><Image src="/images/img1.jpg" alt={localizedText(story.alt,state.language)} fill sizes="100vw"/></div><blockquote className="exact-editorial-quotation exact-editorial-reveal">{presentation.maisonSecond}</blockquote><div className="exact-editorial-ending"><Link className="fashion-link" href="/personalization/caring">{c.care}</Link></div></CultureShell>;
}

export function CollaborationsEditorial() {
  const {state}=useShop();const c=translatedCopy(cultureEditorialCopy[state.locale],state.language);const presentation=translatedCopy(presentationCopy[state.locale],state.language);const story=storyFor('une-rencontre-creative');
  return <CultureShell className="exact-encounter-page"><header className="exact-editorial-opening"><div className="exact-editorial-opening-media"><CampaignMedia src="/videos/goya-movement.mp4" poster={story.image} alt={localizedText(story.alt,state.language)} priority/></div><div className="exact-editorial-opening-copy exact-editorial-reveal"><p className="exact-editorial-kicker">{localizedText(story.kicker,state.language)}</p><h1>{localizedText(story.title,state.language)}</h1><p>{localizedText(story.intro,state.language)}</p></div></header><div className="exact-editorial-paragraph-band">{story.paragraphs.slice(0,2).map((paragraph,index)=><p key={index}>{localizedText(paragraph,state.language)}</p>)}</div><h2 className="exact-editorial-gallery-heading">{c.archive}</h2><EditorialGallery images={['/images/archive/goya-16.jpg','/images/archive/goya-08.jpg','/images/campaign/goya-signature.webp','/images/archive/goya-09.jpg','/images/archive/goya-12.jpg']}/><blockquote className="exact-editorial-quotation exact-editorial-reveal">{presentation.maisonSecond}</blockquote><div className="exact-editorial-diptych"><figure><Image src="/images/archive/goya-16.jpg" alt={localizedText(story.alt,state.language)} fill sizes="(min-width:800px) 50vw,100vw"/></figure><figure><Image src="/images/archive/goya-08.jpg" alt={c.photograph} fill sizes="(min-width:800px) 50vw,100vw"/></figure></div>{story.source&&<div className="exact-editorial-ending"><a className="exact-editorial-source" href={story.source.url} target="_blank" rel="noreferrer">{localizedText(story.source.label,state.language)}<Icon name="arrow-up-right" width={14}/></a></div>}</CultureShell>;
}

export function JournalEditorial({story}:{story:CultureStory}) {
  const {state}=useShop();const c=translatedCopy(cultureEditorialCopy[state.locale],state.language);const related=CULTURE_STORIES.filter(item=>item.slug!==story.slug).slice(0,3);
  return <CultureShell className="exact-journal-page"><header className="exact-journal-hero"><Image src={story.image} alt={localizedText(story.alt,state.language)} fill preload sizes="100vw"/><div className="exact-editorial-reveal"><p className="exact-editorial-kicker">{localizedText(story.kicker,state.language)}</p><h1>{localizedText(story.title,state.language)}</h1></div></header><section className="exact-journal-introduction exact-editorial-reveal"><h2>{localizedText(story.intro,state.language)}</h2></section><div className="exact-journal-prose">{story.paragraphs.map((paragraph,index)=><p key={index}>{localizedText(paragraph,state.language)}</p>)}</div><div className="exact-editorial-full-image exact-journal-second-image"><Image src={story.image} alt={localizedText(story.alt,state.language)} fill sizes="100vw"/></div>{story.source&&<div className="exact-editorial-ending"><a className="exact-editorial-source" href={story.source.url} target="_blank" rel="noreferrer">{localizedText(story.source.label,state.language)}<Icon name="arrow-up-right" width={14}/></a></div>}<section className="exact-editorial-related"><h2>{c.more}</h2><div>{related.map(item=><Link key={item.slug} href={'/culture/'+item.slug}><figure><Image src={item.image} alt={localizedText(item.alt,state.language)} fill sizes="(min-width:800px) 33vw,70vw"/></figure><h3>{localizedText(item.title,state.language)}</h3><span>{c.story}</span></Link>)}</div></section></CultureShell>;
}
