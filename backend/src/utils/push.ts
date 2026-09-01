import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:swapifhy.official@gmail.com',
  process.env.VAPID_PUBLIC_KEY || 'BEOJSVZHbTW5emyIBcvb9zEFaSAPjYniGwSDDOOV_3JX7CxPTlD4B1WKo8WmZT3-PR0TYglb1HSyTNdmxun-ed8',
  process.env.VAPID_PRIVATE_KEY || 'qJKQOR3XPy6F4a8jY3lrEyj7FPcrZJJXUjdwSm-AD9E'
);

export const sendWebPush = async (subscription: any, payload: object) => {
    try {
        if (!subscription) return false;
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        return true;
    } catch (e: any) {
        if (e.statusCode === 404 || e.statusCode === 410) {
            return "EXPIRED";
        }
        return false;
    }
};
