import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { SITE_LOCALES, knownStaticText, siteText } from '../lib/international';
import { siteTranslations } from '../lib/site-translations';

test('product drawers, bag, fitting tools, home rails and navigation have all seven static translations', () => {
  const files=['components/product-detail.tsx','components/cart.tsx','components/fit-guide.tsx','components/featured-products.tsx','lib/navigation.ts'];
  let checked=0;
  for(const file of files){
    const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
    const visit=(node:ts.Node)=>{
      if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)){
        const name=node.expression.text;
        const offset=name==='siteText'?1:['text','label','item','edit'].includes(name)?0:-1;
        const english=node.arguments[offset],french=node.arguments[offset+1];
        if(offset>=0&&english&&french&&ts.isStringLiteral(english)&&ts.isStringLiteral(french)){
          for(const language of SITE_LOCALES){const value=siteText(language,english.text,french.text);assert.ok(value.trim(),`${file}: ${language}: ${english.text}`);assert.doesNotMatch(value,/__GOYATOKEN|__ゴヤトークン|__جوياتوكين/);}
          checked++;
        }
      }
      ts.forEachChild(node,visit);
    };
    visit(source);
  }
  assert.ok(checked>75,'The regression must inspect the actual product and navigation label calls.');
});

test('the legacy text adapter preserves Goya brand names and currency codes in every language',()=>{
  for(const language of SITE_LOCALES)for(const value of ['Goya','GOYA','Maison Goya','EUR','USD','XOF'])assert.equal(knownStaticText(value,language),value);
});

test('translated catalogues contain complete placeholders and no unfinished brand markers',()=>{
  const tokens=(value:string)=>[...value.matchAll(/\{\w+\}/g)].map(match=>match[0]).sort();
  for(const[language,entries]of Object.entries(siteTranslations))for(const[source,value]of Object.entries(entries)){
    assert.doesNotMatch(value,/__[^_]+__/u,`${language}: ${source}`);
    assert.deepEqual(tokens(value),tokens(source),`${language}: ${source}`);
  }
});
