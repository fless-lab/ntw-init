import { EmailQueueManager } from './email.queue';

// Initialize the queue manager at startup
EmailQueueManager.getInstance();

export { emailQueue } from './email.queue';
export { default as EmailQueueService } from './email.queue.service';
