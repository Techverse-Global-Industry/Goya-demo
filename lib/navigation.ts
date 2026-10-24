import { ACCESSORY_LABELS, MEN_SHOE_STYLES, SHOE_STYLE_LABELS, WOMEN_SHOE_STYLES } from './catalog-edits';
import { CURATED_EDITS } from './curated-edits';
import { storefrontCopy } from './storefront';
import type { Locale } from './types';
export type MainMenu = 'new'|'men'|'women'|'accessories'|'gifts'|'personalization'|'culture';
export type NavigationGroup = { title:string; href:string; items:{label:string;href:string}[] };
export function navigationGroups(menu:MainMenu,locale:Locale):NavigationGroup[] {
 const c=storefrontCopy[locale];const fr=locale==='fr';
 const accessories=['bags-backpacks','small-leather-goods','belts','gloves-scarves','hats','socks','tassels','lifestyle'] as const;
 const shoeCare=['shoe-care','trees-horns','travel-kits','laces'] as const;
 const edits=CURATED_EDITS.map(edit=>({label:edit.title[locale],href:`/edits/${edit.slug}`}));
 if(menu==='men'||menu==='women') return [
  {title:c.shoes,href:`/${menu}`,items:(menu==='men'?MEN_SHOE_STYLES:WOMEN_SHOE_STYLES).map(style=>({label:SHOE_STYLE_LABELS[style][locale],href:`/${menu}/${style}`}))},
  {title:c.accessories,href:`/accessories?audience=${menu}`,items:accessories.filter(kind=>menu==='men'||kind!=='belts').map(kind=>({label:ACCESSORY_LABELS[kind][locale],href:`/accessories/${kind}?audience=${menu}`}))},
  {title:fr?'À découvrir':'Highlights',href:'/edits/signature',items:edits},
 ];
 if(menu==='accessories')return [
  ...(['men','women'] as const).map(gender=>({title:gender==='men'?c.man:c.woman,href:`/accessories?audience=${gender}`,items:accessories.filter(kind=>gender==='men'||kind!=='belts').map(kind=>({label:ACCESSORY_LABELS[kind][locale],href:`/accessories/${kind}?audience=${gender}`}))})),
  {title:c.care,href:'/shoe-care',items:shoeCare.map(kind=>({label:ACCESSORY_LABELS[kind][locale],href:`/accessories/${kind}`}))},
 ];
 if(menu==='new')return [{title:c.man,href:'/new-arrivals/men',items:[{label:fr?'Tous les nouveaux souliers':'All new shoes',href:'/new-arrivals/men'},{label:c.accessories,href:'/new-arrivals/accessories'}]},{title:c.woman,href:'/new-arrivals/women',items:[{label:fr?'Tous les nouveaux souliers':'All new shoes',href:'/new-arrivals/women'},{label:c.accessories,href:'/new-arrivals/accessories'}]},{title:fr?'Les sélections':'The edits',href:'/new-arrivals',items:edits.slice(0,4)}];
 if(menu==='gifts')return [{title:c.gifts,href:'/gifts',items:[{label:c.forHim,href:'/gifts/men'},{label:c.forHer,href:'/gifts/women'},{label:fr?'Précieux cadeaux':'Precious gifts',href:'/gifts/accessories'}]},{title:fr?'Un cadeau personnel':'A personal gift',href:'/personalization',items:[{label:fr?'Vos initiales':'Your initials',href:'/personalization/on-time'},{label:fr?'Votre création':'Your creation',href:'/personalization/made-to-order'}]}];
 if(menu==='personalization')return [{title:fr?'L’art de faire vôtre':'Make it your own',href:'/personalization',items:[{label:fr?'Sur mesure':'Bespoke',href:'/personalization/bespoke'},{label:fr?'Commande personnalisée':'Made to order',href:'/personalization/made-to-order'},{label:fr?'Personnalisation immédiate':'On-time personalization',href:'/personalization/on-time'},{label:fr?'Soin & restauration':'Caring & restoration',href:'/personalization/caring'}]}];
 return [{title:c.culture,href:'/maison',items:[{label:c.maison,href:'/maison'},{label:fr?'Le savoir-faire':'Craftsmanship',href:'/craftsmanship'},{label:fr?'La transmission du geste':'Passing on the craft',href:'/culture/le-geste-et-la-transmission'},{label:fr?'Les collaborations':'Collaborations',href:'/collaborations'},{label:fr?'Le journal Goya':'Goya journal',href:'/journal'},{label:c.stores,href:'/stores'}]}];
}
