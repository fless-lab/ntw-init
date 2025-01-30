import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue } from './email/email.queue';

const BullServerAdapter = new ExpressAdapter();

const emailQueueAdapter = new BullAdapter(emailQueue, {
  description:
    'Queue de gestion des emails (notifications, vérifications, etc.)',
});

emailQueueAdapter.setFormatter('data', (data) => {
  if (data && typeof data === 'object') {
    const sanitized = { ...data };
    if (sanitized.email)
      sanitized.email = '****@' + sanitized.email.split('@')[1];
    if (sanitized.code) sanitized.code = '******';
    return sanitized;
  }
  return data;
});

createBullBoard({
  queues: [emailQueueAdapter],
  serverAdapter: BullServerAdapter,
  options: {
    uiConfig: {
      boardTitle: CONFIG.app + ' Queue Manager',
      // boardLogo: {
      //   path: '/static/images/logo.svg',
      //   width: '40px',
      //   height: '40px',
      // },
      // favIcon: {
      //   default: '/static/images/logo.svg',
      //   alternative: '/static/favicon-32x32.png',
      // },
    },
  },
});

BullServerAdapter.setBasePath('/checker/admin/queues');

export { BullServerAdapter };
