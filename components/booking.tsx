'use client';

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { LOCATIONS, SERVICES, TIME_SLOTS } from '@/lib/catalog';
import { bookingDateRange, formatDate, isTimeAvailable, validateBooking } from '@/lib/commerce';
import type { FieldErrors } from '@/lib/commerce';
import type { AtelierLocation, AtelierService, BookingDetails } from '@/lib/types';
import { shopRequest } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { Auth } from './auth';
import { gsap, useGSAP } from '@/lib/gsap';
import { DemoNote, InlineNotice, SelectField, TextField } from './controls';
import { Icon } from './icon';

export function BookingModal({ close }: { close: () => void }) {
  const { state, dispatch, t, refresh } = useShop();
  const root = useRef<HTMLDivElement>(null);
  const [details, setDetails] = useState<BookingDetails>({ name: state.user?.name ?? '', email: state.user?.email ?? '', service: 'polish', location: 'cotonou', date: '', time: '' });
  const [errors, setErrors] = useState<FieldErrors<BookingDetails>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bookingId = state.overlay?.kind === 'booking' ? state.overlay.bookingId : undefined;
  const booking = state.bookings.find((value) => value.id === bookingId);
  const range = bookingDateRange(details.location);

  useGSAP(() => {
    if (bookingId && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.from('.booking-confirmed > *', { y: 14, opacity: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out' });
    const frame = requestAnimationFrame(() => { if (bookingId) root.current?.querySelector<HTMLElement>('[data-booking-heading]')?.focus({ preventScroll: true }); });
    return () => cancelAnimationFrame(frame);
  }, { scope: root, dependencies: [bookingId], revertOnUpdate: true });

  const update = <K extends keyof BookingDetails>(key: K, value: BookingDetails[K]) => {
    setDetails((current) => ({ ...current, [key]: value, ...(key === 'location' || key === 'date' ? { time: '' } : {}) }));
    setErrors((current) => ({ ...current, [key]: undefined, ...(key === 'location' || key === 'date' ? { time: undefined } : {}) }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date();
    const validation = validateBooking(details, state.bookedSlots, now);
    setErrors(validation);
    const firstError = Object.keys(validation)[0];
    if (firstError) { document.getElementById(`atelier-${firstError}`)?.focus(); return; }
    if (busy) return;
    setBusy(true); setError('');
    try {
      const { booking } = await shopRequest<{ booking: Booking }>('book', { details });
      dispatch({ type: 'bookingComplete', booking }); await refresh();
    } catch { setError(t('slotTaken')); }
    finally { setBusy(false); }
  };

  if (!state.user) return <Auth />;
  return <div className="booking-root" ref={root}>
    {error && <p className="field-error" role="alert">{error}</p>}
    {booking ? <div className="booking-confirmed confirmation">
      <div className="confirmation-mark"><Icon name="calendar" width={28} height={28} /></div>
      <p className="eyebrow">L’Atelier · {t('demoLabel')}</p>
      <h2 className="modal-display-title" tabIndex={-1} data-booking-heading>{t('bookingConfirmed')}</h2>
      <p className="confirmation-intro">{t('bookingConfirmedText')}</p>
      <dl className="booking-summary">
        <div><dt>{t('bookingReference')}</dt><dd>{booking.id}</dd></div>
        <div><dt>{t('service')}</dt><dd>{t(booking.service)}</dd></div>
        <div><dt>{t('boutique')}</dt><dd>{t(booking.location)}</dd></div>
        <div><dt>{t('date')}</dt><dd>{formatDate(booking.date, state.locale, true)} · {booking.time}</dd></div>
        <div><dt>{t('name')}</dt><dd>{booking.name}</dd></div>
      </dl>
      <button type="button" className="button button-gold button-full" onClick={close}>{t('myAppointments')}<Icon name="arrow-up-right" /></button>
      <DemoNote variant="bookingDemo" />
    </div> : <>
      <p className="eyebrow">{t('atelierEyebrow')}</p>
      <h2 className="modal-display-title">{t('bookingTitle')}</h2>
      <p className="modal-intro">{t('bookingIntro')}</p>
      <form className="booking-form" noValidate onSubmit={submit}>
        <div className="form-row"><TextField id="atelier-name" label={t('name')} name="name" autoComplete="name" required maxLength={100} value={details.name} error={errors.name} onChange={(event) => update('name', event.target.value)} data-initial-focus />
          <TextField id="atelier-email" label={t('email')} name="email" type="email" autoComplete="email" required maxLength={254} value={details.email} error={errors.email} onChange={(event) => update('email', event.target.value)} />
        </div>
        <div className="form-row"><SelectField id="atelier-service" label={t('service')} value={details.service} error={errors.service} onChange={(event) => update('service', event.target.value as AtelierService)}>{SERVICES.map((service) => <option key={service} value={service}>{t(service)}</option>)}</SelectField>
          <SelectField id="atelier-location" label={t('boutique')} value={details.location} error={errors.location} onChange={(event) => update('location', event.target.value as AtelierLocation)}>{LOCATIONS.map((location) => <option key={location} value={location}>{t(location)}</option>)}</SelectField>
        </div>
        <div className="form-row"><TextField id="atelier-date" label={t('appointmentDate')} type="date" name="date" required min={range.min} max={range.max} value={details.date} error={errors.date} onChange={(event) => update('date', event.target.value)} />
          <SelectField id="atelier-time" label={t('appointmentTime')} value={details.time} error={errors.time} onChange={(event) => update('time', event.target.value)} required>
            <option value="">{t('selectTime')}</option>
            {TIME_SLOTS.map((time) => <option key={time} value={time} disabled={!details.date || !isTimeAvailable({ ...details, time }, state.bookedSlots)}>{time}</option>)}
          </SelectField>
        </div>
        <p className="fine-print">{t('bookingDateHint')}</p><InlineNotice />
        <button type="submit" className="button button-gold button-full" disabled={busy}>{t(busy ? 'saving' : 'reserve')}<Icon name="calendar" /></button>
      </form>
      <DemoNote variant="bookingDemo" />
    </>}
  </div>;
}
