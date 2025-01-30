import Bull, { ProcessCallbackFunction } from 'bull';
import { IEmailJobData, IEmailJobResult, IEmailJob } from './types';
import { EmailJobProcessor } from './email.processor';

export class EmailQueueManager {
  private queue: Bull.Queue<IEmailJobData>;
  private processor: EmailJobProcessor;
  private static instance: EmailQueueManager;
  private readonly queueConfig: typeof CONFIG.queues.email;

  private constructor() {
    LOGGER.info('Initializing EmailQueueManager');
    this.queueConfig = CONFIG.queues.email;

    LOGGER.info('Creating Bull queue with config', {
      queueName: this.queueConfig.name,
      redis: {
        host: CONFIG.redis.host,
        port: CONFIG.redis.port,
        tls: CONFIG.redis.tls,
      },
      concurrency: this.queueConfig.concurrency,
    });

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
    LOGGER.info('EmailQueueManager initialized successfully');
  }

  private setupQueueProcessor(): void {
    LOGGER.info('Setting up queue processor');
    const processCallback: ProcessCallbackFunction<IEmailJobData> = async (
      job,
    ): Promise<IEmailJobResult> => {
      LOGGER.info(`Processing email job ${job.id}`, {
        jobId: job.id,
        template: job.data.template,
        attempt: job.attemptsMade + 1,
      });
      return this.processor.process(job as IEmailJob);
    };

    this.queue.process(this.queueConfig.concurrency, processCallback);
    LOGGER.info(
      `Queue processor setup complete with concurrency ${this.queueConfig.concurrency}`,
    );
  }

  private setupQueueEvents(): void {
    LOGGER.info('Setting up queue event handlers');

    this.queue.on('completed', (job, result: IEmailJobResult) => {
      LOGGER.info(`Job ${job.id} completed successfully`, {
        messageId: result.messageId,
        template: job.data.template,
        metadata: job.data.metadata,
      });
    });

    this.queue.on('failed', (job, error: Error) => {
      LOGGER.error(`Job ${job.id} failed`, {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        attempts: job.attemptsMade,
        template: job.data.template,
        metadata: job.data.metadata,
      });
    });

    this.queue.on('stalled', (jobId: string) => {
      LOGGER.warn(`Job ${jobId} has stalled`);
    });

    this.queue.on('error', (error: Error) => {
      LOGGER.error('Queue error', {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
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

    LOGGER.info('Queue event handlers setup complete');
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
