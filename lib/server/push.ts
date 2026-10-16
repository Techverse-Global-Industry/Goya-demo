import webpush from 'web-push';
import { mutateDatabase, readDatabase } from './database';

export async function deliverPush(notificationIds: string[]): Promise<{ sent: number; failed: number }> {
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return { sent: 0, failed: 0 };
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:demo@example.com', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const { data } = await readDatabase();
  let sent = 0, failed = 0;
  const expired: string[] = [];
  await Promise.allSettled(data.subscriptions.map(async (subscription) => {
    const notices = data.notifications.filter((notice) => notice.userId === subscription.userId && notificationIds.includes(notice.id));
    for (const notice of notices) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify({ title: notice.title[subscription.locale], body: notice.body[subscription.locale], url: notice.url, tag: notice.id }), { TTL: 3600, timeout: 8000 });
        sent++;
      } catch (error) {
        failed++;
        if ([404, 410].includes((error as { statusCode: number }).statusCode)) expired.push(subscription.endpoint);
      }
    }
  }));
  if (expired.length) await mutateDatabase((db) => { db.subscriptions = db.subscriptions.filter((subscription) => !expired.includes(subscription.endpoint)); });
  return { sent, failed };
}
