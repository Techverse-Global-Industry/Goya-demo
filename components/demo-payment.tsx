'use client';
import { useState } from 'react';
import { useShop } from '@/context/shop-context';
import type { Country, PaymentMethod } from '@/lib/types';
import { Icon } from './icon';

export function DemoPayment({ method, country, total, busy, onApprove, onBack }: { method: PaymentMethod; country: Country; total: number; busy: boolean; onApprove: () => void; onBack: () => void }) {
  const { state, t, money } = useShop();
  const fr = state.locale === 'fr';
  const instalments = method === 'klarna' || method === 'scalapay';
  const provider = method === 'paypal' || instalments;
  const scheduled = [Math.ceil(total / 3), Math.floor(total / 3), total - Math.ceil(total / 3) - Math.floor(total / 3)];
  const operators = country === 'BJ' ? ['MTN MoMo', 'Moov Money'] : ['Orange Money', 'Wave', 'Free Money'];
  const [phone, setPhone] = useState('');
  const [requested, setRequested] = useState(method !== 'mobile');
  const [error, setError] = useState('');
  const [operator, setOperator] = useState(operators[0]);
  const [declined, setDeclined] = useState(false);
  const request = () => {
    if (!/^\+?[\d\s-]{8,20}$/.test(phone) || phone.replace(/\D/g, '').length < 8 || phone.replace(/\D/g, '').length > 15) { setError(t('invalidPhone')); return; }
    setError(''); setDeclined(false); setRequested(true);
  };
  return <section className="demo-payment" aria-label={t('payment')}>
    <span className="mini-badge">{t('demoLabel')}</span>
    <div className="payment-emblem"><Icon name={method === 'mobile' || method === 'apple' ? 'phone' : 'card'} width={32} height={32} /></div>
    <h3>{provider ? t(method) : t(method === 'mobile' ? 'momoTitle' : method === 'apple' ? 'walletTitle' : 'cardTitle')}</h3>
    <strong className="payment-amount">{money(total)}</strong>
    <p>{t(method === 'mobile' ? 'momoIntro' : 'cardDemoText')}</p>
    {provider && <div className="provider-demo"><p>{fr ? 'Environnement de démonstration Goya. Aucun compte de paiement externe ni crédit réel n’est ouvert.' : 'Goya demonstration environment. No external payment account or real credit is opened.'}</p>{instalments ? <ol>{scheduled.map((amount, index) => <li key={index}><span>{index === 0 ? fr ? 'Aujourd’hui' : 'Today' : fr ? `Dans ${index * 30} jours` : `In ${index * 30} days`}</span><strong>{money(amount)}</strong></li>)}</ol> : <div><Icon name="shield" width={20} /><span>{fr ? 'Portefeuille PayPal de démonstration' : 'Demo PayPal wallet'}</span></div>}</div>}
    {!requested && method === 'mobile' ? <div className="momo-fields">
      <label className="field"><span>{t('operator')}</span><select value={operator} onChange={(event) => setOperator(event.target.value)}>{operators.map((operator) => <option key={operator}>{operator}</option>)}</select></label>
      <label className="field"><span>{t('demoPhone')}</span><input type="tel" aria-label={t('demoPhone')} inputMode="tel" placeholder="01 00 00 00 00" value={phone} onChange={(event) => setPhone(event.target.value)} aria-describedby="momo-hint" maxLength={20} /><small id="momo-hint">{t('demoPhoneHint')}</small></label>
      {error && <p className="field-error" role="alert">{error}</p>}
      {declined && <p className="field-error" role="status">{t('paymentDeclined')}</p>}
      <button type="button" className="button button-gold button-full" onClick={request}>{t('paymentRequest')}<Icon name="arrow-right" /></button>
    </div> : <div className="payment-approval">
      {method === 'mobile' && <><p className="eyebrow">{operator} · {t('waitingApproval')}</p><p>{t('waitingApprovalText')}</p></>}
      <button type="button" className="button button-gold button-full" disabled={busy} onClick={onApprove}>{t(busy ? 'paymentProcessing' : 'approvePayment')}<Icon name="shield" /></button>
      <button type="button" className="quiet-link" disabled={busy} onClick={() => { setRequested(false); setDeclined(true); if (method !== 'mobile') onBack(); }}>{t('declinePayment')}</button>
    </div>}
    <button type="button" className="text-link centered-link" disabled={busy} onClick={onBack}>{t('back')}</button>
    <p className="fine-print">{t('demoOnly')}</p>
  </section>;
}
