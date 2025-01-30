import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue } from './email/email.queue';

const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [new BullAdapter(emailQueue)],
  serverAdapter,
});

serverAdapter.setBasePath('/checker/admin/queues');

export { serverAdapter };
