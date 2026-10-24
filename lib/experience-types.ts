import type { Currency, Locale } from './types';

export type ReturnStatus = 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';
export type ReturnReason = 'size' | 'style' | 'damaged' | 'wrong-item' | 'other';
export interface ReturnLine { productId: string; size: string; quantity: number; reason: ReturnReason }
export interface ReturnRequest {
  id: string; orderId: string; customerId: string | null; lines: ReturnLine[];
  status: ReturnStatus; refundAmount: number; currency: Currency;
  createdAt: string; updatedAt: string; comment: string; note?: string;
  events: { status: ReturnStatus; at: string }[];
}
export type ServiceRequestKind = 'availability' | 'contact' | 'newsletter' | 'bespoke' | 'made-to-order' | 'on-time' | 'personalization' | 'care' | 'consultation';
export type ServiceRequestStatus = 'received' | 'reviewing' | 'confirmed' | 'completed' | 'closed';
export interface RequestAttachment { name: string; type: 'image/jpeg' | 'image/png' | 'image/webp'; size: number; dataUrl: string }
export interface ServiceRequest {
  id: string; kind: ServiceRequestKind; name: string; email: string; locale: Locale;
  details: Record<string, string>; productId?: string; attachments?: RequestAttachment[];
  status: ServiceRequestStatus; createdAt: string; updatedAt: string; customerId: string | null; note?: string;
}

const requestNames: Record<Locale, Record<ServiceRequestKind, string>> = {
  en: { availability: 'Availability alert', contact: 'Contact enquiry', newsletter: 'Newsletter subscription', bespoke: 'Bespoke', 'made-to-order': 'Made to order', 'on-time': 'On-time service', personalization: 'Personalization', care: 'Shoe care', consultation: 'Consultation' },
  fr: { availability: 'Alerte de disponibilité', contact: 'Demande de contact', newsletter: 'Inscription à la newsletter', bespoke: 'Sur mesure', 'made-to-order': 'Fabrication à la demande', 'on-time': 'Service On-time', personalization: 'Personnalisation', care: 'Entretien des chaussures', consultation: 'Consultation' },
};
export function serviceRequestName(kind: ServiceRequestKind, locale: Locale) { return requestNames[locale][kind]; }
export function returnReasonName(reason: ReturnReason, locale: Locale) {
  const names: Record<Locale, Record<ReturnReason, string>> = {
    en: { size: 'Size or fit', style: 'Style or colour', damaged: 'Item arrived damaged', 'wrong-item': 'Wrong item received', other: 'Another reason' },
    fr: { size: 'Pointure ou chaussant', style: 'Style ou couleur', damaged: 'Article reçu endommagé', 'wrong-item': 'Mauvais article reçu', other: 'Autre raison' },
  };
  return names[locale][reason];
}
