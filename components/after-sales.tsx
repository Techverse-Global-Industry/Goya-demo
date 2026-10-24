'use client';

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { RequestError, shopRequest } from '@/lib/api';
import type { Order } from '@/lib/types';
import type { ReturnReason, ReturnRequest, ReturnStatus } from '@/lib/experience-types';
import { serviceRequestName } from '@/lib/experience-types';
import { Icon } from './icon';

const copy = {
  en: {
    lookup: 'Find your order', lookupIntro: 'Enter your order number and the email used at checkout.', reference: 'Order or tracking number', email: 'Email address', find: 'Find my order', searching: 'Finding your order…', noMatch: 'No matching order was found. Please check both details.', failed: 'We could not complete your request. Please try again.', found: 'Your order is available below.', returns: 'Returns & refunds', intro: 'Choose the pieces you wish to return and follow every stage of your demonstration return.', empty: 'Your return history will appear here.', request: 'Request a return', afterDelivery: 'Returns become available after delivery.', items: 'Choose your items', quantity: 'Quantity', reason: 'Reason for return', comment: 'Additional information (optional)', submit: 'Submit return request', saving: 'Saving your request…', cancel: 'Cancel', select: 'Select at least one item and choose a reason.', changed: 'The available return quantity changed. Please refresh and review your selection.', receivedMessage: 'Your demonstration return request has been received.', available: 'Available to return', itemValue: 'Item value', refund: 'Simulated refund', deliveryExcluded: 'This preview refunds the selected items. No real money, collection or shipment is involved.', requested: 'Requested', approved: 'Approved', received: 'Received', refunded: 'Refunded', rejected: 'Not approved', size: 'Size', details: 'Return details', instructions: 'Download demo return instructions', instructionsTitle: 'MAISON GOYA — DEMONSTRATION RETURN', instructionsBody: 'This document illustrates return instructions. Do not ship any products. No carrier label or actual collection has been created.', backShop: 'Continue shopping', ownOnly: 'Only the matching order is opened. Your account remains private.', requests: 'Your service requests', requestEmpty: 'Your appointments, availability alerts and service requests will appear here.', requestReference: 'Request reference', requestReceived: 'Received', requestReviewing: 'Under review', requestConfirmed: 'Confirmed', requestCompleted: 'Completed', requestClosed: 'Closed', note: 'Response from the Maison', noFurther: 'All available quantities are already included in a return.',
    sizeReason: 'Size or fit', styleReason: 'Style or colour', damagedReason: 'Item arrived damaged', wrongReason: 'Wrong item received', otherReason: 'Another reason',
  },
  fr: {
    lookup: 'Retrouver votre commande', lookupIntro: 'Saisissez votre numéro de commande et l’e-mail utilisé lors de l’achat.', reference: 'Numéro de commande ou de suivi', email: 'Adresse e-mail', find: 'Retrouver ma commande', searching: 'Recherche de votre commande…', noMatch: 'Aucune commande correspondante. Vérifiez les deux informations.', failed: 'Votre demande n’a pas pu être traitée. Veuillez réessayer.', found: 'Votre commande est disponible ci-dessous.', returns: 'Retours et remboursements', intro: 'Choisissez les articles à retourner et suivez chaque étape de votre retour de démonstration.', empty: 'L’historique de vos retours apparaîtra ici.', request: 'Demander un retour', afterDelivery: 'Les retours sont accessibles après la livraison.', items: 'Choisissez vos articles', quantity: 'Quantité', reason: 'Motif du retour', comment: 'Informations complémentaires (facultatif)', submit: 'Envoyer la demande de retour', saving: 'Enregistrement de votre demande…', cancel: 'Annuler', select: 'Sélectionnez un article et choisissez un motif.', changed: 'La quantité disponible a changé. Actualisez et vérifiez votre sélection.', receivedMessage: 'Votre demande de retour de démonstration a été reçue.', available: 'Quantité disponible au retour', itemValue: 'Valeur des articles', refund: 'Remboursement simulé', deliveryExcluded: 'Cet aperçu rembourse les articles sélectionnés. Aucun paiement, enlèvement ou envoi réel n’est effectué.', requested: 'Demandé', approved: 'Approuvé', received: 'Reçu', refunded: 'Remboursé', rejected: 'Non approuvé', size: 'Pointure', details: 'Détails du retour', instructions: 'Télécharger les instructions de retour démo', instructionsTitle: 'MAISON GOYA — RETOUR DE DÉMONSTRATION', instructionsBody: 'Ce document illustre les instructions de retour. N’envoyez aucun produit. Aucune étiquette transporteur ni collecte réelle n’a été créée.', backShop: 'Continuer mes achats', ownOnly: 'Seule la commande correspondante est accessible. Votre compte reste privé.', requests: 'Vos demandes de service', requestEmpty: 'Vos rendez-vous, alertes de disponibilité et demandes de service apparaîtront ici.', requestReference: 'Référence de la demande', requestReceived: 'Reçue', requestReviewing: 'En cours d’examen', requestConfirmed: 'Confirmée', requestCompleted: 'Terminée', requestClosed: 'Clôturée', note: 'Réponse de la Maison', noFurther: 'Toutes les quantités disponibles font déjà l’objet d’un retour.',
    sizeReason: 'Pointure ou chaussant', styleReason: 'Style ou couleur', damagedReason: 'Article reçu endommagé', wrongReason: 'Mauvais article reçu', otherReason: 'Autre motif',
  },
} as const;
const reasons: { value: ReturnReason; key: 'sizeReason' | 'styleReason' | 'damagedReason' | 'wrongReason' | 'otherReason' }[] = [{ value: 'size', key: 'sizeReason' }, { value: 'style', key: 'styleReason' }, { value: 'damaged', key: 'damagedReason' }, { value: 'wrong-item', key: 'wrongReason' }, { value: 'other', key: 'otherReason' }];

export function GuestOrderLookup({ onFound }: { onFound?: (order: Order) => void } = {}) {
  const { state, refresh } = useShop(); const c = copy[state.locale];
  const [reference, setReference] = useState(''); const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy) return; setBusy(true); setMessage('');
    try { const { order } = await shopRequest<{ order: Order }>('lookupOrder', { reference: reference.trim(), email: email.trim() }); await refresh(true); onFound?.(order); setError(false); setMessage(c.found); }
    catch (failure) { setError(true); setMessage(failure instanceof RequestError && failure.code === 'orderNotFound' ? c.noMatch : c.failed); }
    finally { setBusy(false); }
  };
  return <section className="after-sales-lookup"><h2>{c.lookup}</h2><p>{c.lookupIntro}</p><form method="post" onSubmit={submit} aria-busy={busy}><label>{c.reference}<input name="order-reference" required maxLength={80} autoComplete="off" value={reference} onChange={event => setReference(event.target.value)} /></label><label>{c.email}<input name="order-email" required maxLength={254} type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label><button type="submit" className="reference-button" disabled={busy}>{busy ? c.searching : c.find}<Icon name="arrow-right" width={17} /></button></form><small>{c.ownOnly}</small>{message && <p className={error ? 'after-sales-error' : 'after-sales-success'} role={error ? 'alert' : 'status'}>{message}</p>}</section>;
}

function ReturnHistory({ request }: { request: ReturnRequest }) {
  const { state, money, productById } = useShop(); const c = copy[state.locale];
  const stages: ReturnStatus[] = ['requested', 'approved', 'received', 'refunded'];
  const download = () => {
    const text = `${c.instructionsTitle}\n\n${request.id}\n${request.orderId}\n\n${c.instructionsBody}\n\n${request.lines.map(line => `${productById.get(line.productId)?.name[state.locale] ?? line.productId} · ${line.size} × ${line.quantity}`).join('\n')}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = `${request.id.toLowerCase()}-demo.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <article className="return-record" data-return-id={request.id}><header><div><p>{request.id}</p><small>{request.orderId}</small></div><strong>{c[request.status]}</strong></header>{request.status !== 'rejected' && <ol className="return-progress" aria-label={c.details}>{stages.map(stage => <li key={stage} className={request.events.some(event => event.status === stage) ? 'is-complete' : ''}><span aria-hidden="true" /><span>{c[stage]}</span></li>)}</ol>}<ul>{request.lines.map(line => <li key={`${line.productId}:${line.size}`}><span>{productById.get(line.productId)?.name[state.locale] ?? line.productId}<small>{c.size} {line.size} · × {line.quantity}</small></span><span>{c[reasons.find(reason => reason.value === line.reason)!.key]}</span></li>)}</ul><p className="return-value"><span>{c.refund}</span><strong>{money(request.refundAmount, request.currency)}</strong></p>{request.note && <p className="return-note">{request.note}</p>}{['approved', 'received', 'refunded'].includes(request.status) && <button className="reference-text-link" type="button" onClick={download}>{c.instructions}<Icon name="download" width={16} /></button>}<small className="after-sales-demo">{c.deliveryExcluded}</small></article>;
}

function ReturnForm({ order, close }: { order: Order; close: () => void }) {
  const { state, refresh } = useShop(); const c = copy[state.locale];
  const [selected, setSelected] = useState<Record<string, { quantity: number; reason: ReturnReason | '' }>>({});
  const [comment, setComment] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const key = useRef(crypto.randomUUID()); const submitting = useRef(false);
  const prior = (state.returns ?? []).filter(request => request.orderId === order.id && request.status !== 'rejected').flatMap(request => request.lines);
  const available = order.lines.map(line => ({ ...line, available: line.quantity - prior.filter(value => value.productId === line.productId && value.size === line.size).reduce((sum, value) => sum + value.quantity, 0) }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (submitting.current) return;
    const lines = Object.entries(selected).map(([variant, value]) => { const index = Number(variant); return { productId: order.lines[index].productId, size: order.lines[index].size, ...value }; });
    if (!lines.length || lines.some(line => !line.reason)) { setMessage(c.select); return; }
    submitting.current = true; setBusy(true); setMessage('');
    try { await shopRequest('requestReturn', { orderId: order.id, lines, comment, idempotencyKey: key.current }); await refresh(true); close(); }
    catch (failure) { setMessage(failure instanceof RequestError && failure.code === 'returnQuantity' ? c.changed : c.failed); await refresh(true); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <form className="return-form" method="post" onSubmit={submit} aria-busy={busy}><h3>{c.items}</h3><fieldset disabled={busy}>{available.map((line, index) => <div className="return-line" key={`${line.productId}:${line.size}`}><label className="return-item-choice"><input type="checkbox" disabled={line.available <= 0} checked={!!selected[index]} onChange={event => setSelected(current => { const next = { ...current }; if (event.target.checked) next[index] = { quantity: 1, reason: '' }; else delete next[index]; return next; })} /><span>{line.product?.name[state.locale] ?? line.productId}<small>{c.size}: {line.size} · {c.available}: {Math.max(0, line.available)}</small></span></label>{selected[index] && <div className="return-line-options"><label>{c.quantity}<select value={selected[index].quantity} onChange={event => setSelected(current => ({ ...current, [index]: { ...current[index], quantity: Number(event.target.value) } }))}>{Array.from({ length: line.available }, (_, offset) => <option key={offset + 1} value={offset + 1}>{offset + 1}</option>)}</select></label><label>{c.reason}<select required value={selected[index].reason} onChange={event => setSelected(current => ({ ...current, [index]: { ...current[index], reason: event.target.value as ReturnReason } }))}><option value="">—</option>{reasons.map(reason => <option key={reason.value} value={reason.value}>{c[reason.key]}</option>)}</select></label></div>}</div>)}<label className="return-comment">{c.comment}<textarea maxLength={1000} rows={3} value={comment} onChange={event => setComment(event.target.value)} /></label></fieldset>{message && <p className="after-sales-error" role="alert">{message}</p>}<div className="return-actions"><button type="submit" className="reference-button" disabled={busy}>{busy ? c.saving : c.submit}<Icon name="arrow-right" width={16} /></button><button type="button" className="reference-text-link" onClick={close} disabled={busy}>{c.cancel}</button></div><small className="after-sales-demo">{c.deliveryExcluded}</small></form>;
}

export function OrdersAndReturns({ orderId }: { orderId?: string } = {}) {
  const { state } = useShop(); const c = copy[state.locale];
  const [open, setOpen] = useState<string | null>(null);
  const orders = state.orders.filter(order => !orderId || order.id === orderId);
  const requests = (state.returns ?? []).filter(request => !orderId || request.orderId === orderId);
  return <section className="after-sales-returns"><header><h2>{c.returns}</h2><p>{c.intro}</p></header>{!orders.length && <p className="after-sales-empty">{c.empty}</p>}{orders.map(order => {
    const prior = requests.filter(request => request.orderId === order.id && request.status !== 'rejected').flatMap(request => request.lines);
    const hasItems = order.lines.some(line => prior.filter(value => value.productId === line.productId && value.size === line.size).reduce((sum, value) => sum + value.quantity, 0) < line.quantity);
    return <div className="return-order" key={order.id}><div><p>{order.id}</p>{order.status === 'delivered' ? hasItems && open !== order.id ? <button type="button" className="reference-text-link" onClick={() => setOpen(order.id)}>{c.request}<Icon name="arrow-right" width={16} /></button> : !hasItems && <small>{c.noFurther}</small> : <small>{c.afterDelivery}</small>}</div>{open === order.id && <ReturnForm order={order} close={() => setOpen(null)} />}{requests.filter(request => request.orderId === order.id).map(request => <ReturnHistory key={request.id} request={request} />)}</div>;
  })}</section>;
}

export function CustomerRequests() {
  const { state } = useShop(); const c = copy[state.locale];
  const status = { received: c.requestReceived, reviewing: c.requestReviewing, confirmed: c.requestConfirmed, completed: c.requestCompleted, closed: c.requestClosed };
  const requests = state.requests ?? [];
  return <section className="customer-request-history"><h2>{c.requests}</h2>{requests.length ? requests.map(request => <article key={request.id}><header><span>{request.id}</span><strong>{status[request.status]}</strong></header><p>{serviceRequestName(request.kind, state.locale)}</p>{request.note && <p><span>{c.note}: </span>{request.note}</p>}<time dateTime={request.createdAt}>{new Intl.DateTimeFormat(state.locale, { dateStyle: 'medium' }).format(new Date(request.createdAt))}</time></article>) : <p>{c.requestEmpty}</p>}<Link href="/collections" className="reference-text-link">{c.backShop}<Icon name="arrow-right" width={16} /></Link></section>;
}
