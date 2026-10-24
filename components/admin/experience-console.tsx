'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { shopRequest } from '@/lib/api';
import type { StoreSnapshot } from '@/lib/types';
import type { ReturnRequest, ReturnStatus, ServiceRequest, ServiceRequestStatus } from '@/lib/experience-types';
import { returnReasonName, serviceRequestName } from '@/lib/experience-types';
import { Icon } from '../icon';

type Action = (action: string, body: Record<string, unknown>) => Promise<void>;
const copy = {
  en: { title: 'Customer service', intro: 'Manage demonstration enquiries, availability alerts and returns in one place.', requests: 'Service requests', returns: 'Returns & refunds', empty: 'No records yet.', details: 'Details', status: 'Request status', returnStatus: 'Return status', note: 'Response note', save: 'Save update', saving: 'Saving…', failed: 'This update could not be saved.', received: 'Received', reviewing: 'Under review', confirmed: 'Confirmed', completed: 'Completed', closed: 'Closed', requested: 'Requested', approved: 'Approved', refunded: 'Refunded', rejected: 'Rejected', photos: 'Attached photos', refund: 'Simulated item refund', demo: 'All service responses, return handling and refunds are simulated. No email, shipment or money transfer is triggered.' },
  fr: { title: 'Service client', intro: 'Gérez les demandes, alertes de disponibilité et retours de démonstration.', requests: 'Demandes de service', returns: 'Retours et remboursements', empty: 'Aucune demande pour le moment.', details: 'Détails', status: 'Statut de la demande', returnStatus: 'Statut du retour', note: 'Note de réponse', save: 'Enregistrer la mise à jour', saving: 'Enregistrement…', failed: 'Cette mise à jour n’a pas pu être enregistrée.', received: 'Reçu', reviewing: 'En cours d’examen', confirmed: 'Confirmé', completed: 'Terminé', closed: 'Clôturé', requested: 'Demandé', approved: 'Approuvé', refunded: 'Remboursé', rejected: 'Refusé', photos: 'Photos jointes', refund: 'Remboursement simulé des articles', demo: 'Les réponses, les retours et les remboursements sont simulés. Aucun e-mail, envoi ni transfert d’argent n’est lancé.' },
} as const;

function RequestCard({ record, busy, onAction }: { record: ServiceRequest; busy: boolean; onAction: Action }) {
  const { state } = useShop(); const c = copy[state.locale];
  const [status, setStatus] = useState(record.status); const [note, setNote] = useState(record.note ?? '');
  const [detail, setDetail] = useState<ServiceRequest | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const load = async () => { if (detail) { setDetail(null); return; } setLoading(true); setError(''); try { const result = await shopRequest<{ request: ServiceRequest }>('requestDetail', { id: record.id }); setDetail(result.request); } catch { setError(c.failed); } finally { setLoading(false); } };
  const save = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); try { await onAction('requestStatus', { id: record.id, status, note }); } catch { setError(c.failed); } };
  return <article className="experience-request admin-panel" data-request-id={record.id}><header><div><p className="eyebrow">{record.id}</p><h2>{serviceRequestName(record.kind, state.locale)}</h2><p>{record.name} · {record.email}</p></div><span>{c[record.status]}</span></header><button type="button" className="text-link" disabled={loading} onClick={() => void load()}>{c.details}<Icon name="chevron" width={15} /></button>{detail && <div className="experience-request-details"><dl>{Object.entries(detail.details).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>{detail.attachments?.length ? <div className="experience-attachments" aria-label={c.photos}>{detail.attachments.map((attachment, index) => <figure key={`${attachment.name}-${index}`}><Image src={attachment.dataUrl} alt={attachment.name} width={400} height={280} unoptimized /><figcaption>{attachment.name}</figcaption></figure>)}</div> : null}</div>}<form onSubmit={save}><label className="field"><span>{c.status}</span><select aria-label={c.status} value={status} onChange={event => setStatus(event.target.value as ServiceRequestStatus)}>{(['received', 'reviewing', 'confirmed', 'completed', 'closed'] as const).map(value => <option key={value} value={value}>{c[value]}</option>)}</select></label><label className="field"><span>{c.note}</span><textarea maxLength={1000} rows={3} value={note} onChange={event => setNote(event.target.value)} /></label><button type="submit" className="button button-gold" disabled={busy}>{busy ? c.saving : c.save}<Icon name="check" width={16} /></button></form>{error && <p role="alert" className="field-error">{error}</p>}</article>;
}

function ReturnCard({ record, busy, onAction }: { record: ReturnRequest; busy: boolean; onAction: Action }) {
  const { state, money } = useShop(); const c = copy[state.locale];
  const [status, setStatus] = useState(record.status); const [note, setNote] = useState(record.note ?? ''); const [error, setError] = useState('');
  const transitions: Record<ReturnStatus, ReturnStatus[]> = { requested: ['requested', 'approved', 'rejected'], approved: ['approved', 'received', 'rejected'], received: ['received', 'refunded'], refunded: ['refunded'], rejected: ['rejected'] };
  const save = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); try { await onAction('returnStatus', { id: record.id, status, note }); } catch { setError(c.failed); } };
  return <article className="experience-return admin-panel" data-return-id={record.id}><header><div><p className="eyebrow">{record.id}</p><h2>{record.orderId}</h2><p>{c.refund}: {money(record.refundAmount, record.currency)}</p></div><span>{c[record.status]}</span></header><ul>{record.lines.map(line => <li key={`${line.productId}:${line.size}`}>{line.productId} · {line.size} × {line.quantity} · {returnReasonName(line.reason, state.locale)}</li>)}</ul>{record.comment && <p>{record.comment}</p>}<form onSubmit={save}><label className="field"><span>{c.returnStatus}</span><select aria-label={c.returnStatus} value={status} onChange={event => setStatus(event.target.value as ReturnStatus)}>{transitions[record.status].map(value => <option key={value} value={value}>{c[value]}</option>)}</select></label><label className="field"><span>{c.note}</span><textarea maxLength={1000} rows={3} value={note} onChange={event => setNote(event.target.value)} /></label><button type="submit" className="button button-gold" disabled={busy}>{busy ? c.saving : c.save}<Icon name="check" width={16} /></button></form>{error && <p role="alert" className="field-error">{error}</p>}</article>;
}

export function ExperienceConsole({ data, busy, onAction }: { data: StoreSnapshot; busy: boolean; onAction: Action }) {
  const { state } = useShop(); const c = copy[state.locale]; const [tab, setTab] = useState<'requests' | 'returns'>('requests');
  const records = tab === 'requests' ? data.requests ?? [] : data.returns ?? [];
  return <div className="experience-console"><p className="fine-print">{c.intro}</p><div className="admin-order-filters"><button type="button" aria-pressed={tab === 'requests'} onClick={() => setTab('requests')}>{c.requests} ({data.requests?.length ?? 0})</button><button type="button" aria-pressed={tab === 'returns'} onClick={() => setTab('returns')}>{c.returns} ({data.returns?.length ?? 0})</button></div>{!records.length && <p className="admin-empty">{c.empty}</p>}{tab === 'requests' ? (data.requests ?? []).map(record => <RequestCard key={`${record.id}:${record.updatedAt}`} record={record} busy={busy} onAction={onAction} />) : (data.returns ?? []).map(record => <ReturnCard key={`${record.id}:${record.updatedAt}`} record={record} busy={busy} onAction={onAction} />)}<p className="fine-print">{c.demo}</p></div>;
}
