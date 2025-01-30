import Bull, { ProcessCallbackFunction } from 'bull';
import { IEmailJobData, IEmailJobResult, IEmailJob } from './types';
import { EmailJobProcessor } from './email.processor';

class EmailQueueManager {
  private queue: Bull.Queue<IEmailJobData>;
  private processor: EmailJobProcessor;
  private static instance: EmailQueueManager;
  private readonly queueConfig: typeof CONFIG.queues.email;

  private constructor() {
    this.queueConfig = CONFIG.queues.email;
    this.queue = new Bull<IEmailJobData>(this.queueConfig.name, {
      redis: {
        host: CONFIG.redis.host,
        port: CONFIG.redis.port,
        password: CONFIG.redis.password,
        tls: CONFIG.redis.tls ? {} : undefined,
      },
      defaultJobOptions: this.queueConfig.defaultJobOptions,
      limiter: this.queueConfig.limiter,
      settings: {
        stalledInterval: this.queueConfig.monitoring.checkInterval,
        maxStalledCount: this.queueConfig.monitoring.maxStallCount,
      },
    });

    this.processor = new EmailJobProcessor();
    this.setupQueueProcessor();
    this.setupQueueEvents();
  }

  private setupQueueProcessor(): void {
    const processCallback: ProcessCallbackFunction<IEmailJobData> = async (
      job,
    ): Promise<IEmailJobResult> => {
      return this.processor.process(job as IEmailJob);
    };

    this.queue.process(
      this.queueConfig.concurrency.toString(),
      processCallback,
    );
  }

  private setupQueueEvents(): void {
    this.queue.on('completed', (job, result: IEmailJobResult) => {
      LOGGER.info(`Job ${job.id} completed successfully`, {
        messageId: result.messageId,
        template: job.data.template,
        metadata: job.data.metadata,
      });
    });

    this.queue.on('failed', (job, error: Error) => {
      LOGGER.error(`Job ${job.id} failed`, {
        error,
        attempts: job.attemptsMade,
        template: job.data.template,
        metadata: job.data.metadata,
      });
    });

    this.queue.on('stalled', (jobId: string) => {
      LOGGER.warn(`Job ${jobId} has stalled`);
    });

    this.queue.on('error', (error: Error) => {
      LOGGER.error('Queue error', error);
    });

    // Monitor queue health
    const monitoringInterval =
      this.queueConfig.monitoring?.checkInterval || 5 * 60 * 1000;

    setInterval(async () => {
      const metrics = await Promise.all([
        this.queue.getJobCounts(),
        this.queue.getActiveCount(),
        this.queue.getDelayedCount(),
      ]);

      LOGGER.info('Queue health metrics', {
        counts: metrics[0],
        active: metrics[1],
        delayed: metrics[2],
      });
    }, monitoringInterval);
  }

  public getQueue(): Bull.Queue<IEmailJobData> {
    return this.queue;
  }

  public static getInstance(): EmailQueueManager {
    if (!EmailQueueManager.instance) {
      EmailQueueManager.instance = new EmailQueueManager();
    }
    return EmailQueueManager.instance;
  }
}

export const emailQueue = EmailQueueManager.getInstance().getQueue();
