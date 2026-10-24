'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { knownStaticText } from '@/lib/international';

type TextRecord = { source: string; applied: string };
const attributeNames = ['aria-label', 'title', 'placeholder', 'alt'] as const;
const excluded = '[translate="no"],[data-no-translate],[data-user-content],[data-personal-data],[contenteditable],script,style,noscript,textarea,svg,math,code,pre,address,dd,.admin-app,.admin-login,.account-identity,.account-avatar,.address-info,.address-summary,.experience-request-note,.experience-uploaded-photos,.customer-request-details';

/** Compatibility for static literals left in legacy components. React keeps
 * ownership of every node: only Text.data and four textual attributes change. */
export function LegacyTranslation() {
  const { state } = useShop();
  const pathname = usePathname();
  const texts = useRef(new WeakMap<Text, TextRecord>());
  const attributes = useRef(new WeakMap<Element, Map<string, TextRecord>>());
  const trackedTexts = useRef(new Set<Text>());
  const trackedElements = useRef(new Set<Element>());

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const currentTexts = texts.current;
    const currentAttributes = attributes.current;
    const currentTrackedTexts = trackedTexts.current;
    const currentTrackedElements = trackedElements.current;
    let disposed = false;
    let scheduled = false;
    const blocked = (element: Element | null) => !element || !!element.closest(excluded);
    const translated = (source: string) => {
      const phrase = source.trim();
      if (!phrase) return null;
      const result = knownStaticText(phrase, state.language);
      if (result === null) return null;
      const start = source.indexOf(phrase);
      return source.slice(0, start) + result + source.slice(start + phrase.length);
    };
    const textNode = (node: Text) => {
      if (blocked(node.parentElement)) return;
      const current = node.data;
      const previous = texts.current.get(node);
      if (previous && current === previous.applied) return;
      const result = translated(current);
      if (result === null) return;
      texts.current.set(node, { source: current, applied: result });
      trackedTexts.current.add(node);
      if (current !== result) node.data = result;
    };
    const element = (node: Element) => {
      if (blocked(node)) return;
      let records = attributes.current.get(node);
      for (const name of attributeNames) {
        const current = node.getAttribute(name);
        if (current === null) continue;
        const previous = records?.get(name);
        if (previous && current === previous.applied) continue;
        const result = translated(current);
        if (result === null) continue;
        if (!records) { records = new Map(); attributes.current.set(node, records); }
        records.set(name, { source: current, applied: result });
        trackedElements.current.add(node);
        if (current !== result) node.setAttribute(name, result);
      }
    };
    const scan = () => {
      if (disposed) return;
      scheduled = false;
      for (const node of trackedTexts.current) if (!node.isConnected) { trackedTexts.current.delete(node); texts.current.delete(node); }
      for (const node of trackedElements.current) if (!node.isConnected) { trackedElements.current.delete(node); attributes.current.delete(node); }
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) textNode(walker.currentNode as Text);
      document.body.querySelectorAll('[aria-label],[title],[placeholder],[alt]').forEach(element);
    };
    const observer = new MutationObserver(records => {
      const changed = records.some(record => record.type === 'childList'
        || record.type === 'characterData' && (record.target as Text).data !== texts.current.get(record.target as Text)?.applied
        || record.type === 'attributes' && record.target instanceof Element && record.target.getAttribute(record.attributeName!) !== attributes.current.get(record.target)?.get(record.attributeName!)?.applied);
      if (changed && !scheduled) { scheduled = true; queueMicrotask(scan); }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...attributeNames] });
    scan();
    return () => {
      disposed = true; observer.disconnect();
      for (const node of currentTrackedTexts) {
        const record = currentTexts.get(node);
        if (record && node.isConnected && node.data === record.applied) node.data = record.source;
        currentTexts.delete(node);
      }
      for (const node of currentTrackedElements) {
        const records = currentAttributes.get(node);
        if (records && node.isConnected) for (const [name, record] of records) if (node.getAttribute(name) === record.applied) node.setAttribute(name, record.source);
        currentAttributes.delete(node);
      }
      currentTrackedTexts.clear(); currentTrackedElements.clear();
    };
  }, [state.language, pathname]);
  return null;
}
