import { emailQueue } from './email.queue';
import {
  IEmailQueueService,
  IAddToQueueOptions,
  IQueueResponse,
  IEmailJobStatus,
  IQueueMetrics,
  EmailJobPriority,
  IEmailJobData,
  IEmailJob,
  IEmailQueueOptions,
} from './types';

class EmailQueueService implements IEmailQueueService {
  async addToQueue(
    options: IAddToQueueOptions,
  ): Promise<IQueueResponse<string>> {
    try {
      const jobData: IEmailJobData = {
        to: options.to,
        template: options.template,
        data: options.data,
        metadata: {
          ...options.metadata,
          timestamp: Date.now(),
          version: '1.0',
        },
      };

      const jobOptions: IEmailQueueOptions = {
        ...CONFIG.queues.email.defaultJobOptions,
        priority: options.priority || EmailJobPriority.NORMAL,
      };

      const job = (await emailQueue.add(jobData, jobOptions)) as IEmailJob;

      LOGGER.info(`Email job ${job.id} added to queue`, {
        template: options.template,
        priority: options.priority,
      });

      return {
        success: true,
        data: job.id.toString(),
      };
    } catch (error) {
      LOGGER.error('Failed to add email job to queue', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async getJobStatus(jobId: string): Promise<IQueueResponse<IEmailJobStatus>> {
    try {
      const job = (await emailQueue.getJob(jobId)) as IEmailJob | null;
      if (!job) {
        return {
          success: false,
          error: new Error('Job not found'),
        };
      }

      const state = await job.getState();
      const progress = await job.progress();

      return {
        success: true,
        data: {
          id: job.id,
          state,
          progress,
          attempts: job.attemptsMade,
          failedReason: job.failedReason,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          data: job.data,
        },
      };
    } catch (error) {
      LOGGER.error('Failed to get job status', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async removeJob(jobId: string): Promise<IQueueResponse<void>> {
    try {
      const job = (await emailQueue.getJob(jobId)) as IEmailJob | null;
      if (!job) {
        return {
          success: false,
          error: new Error('Job not found'),
        };
      }

      await job.remove();
      return { success: true };
    } catch (error) {
      LOGGER.error('Failed to remove job', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async getQueueMetrics(): Promise<IQueueMetrics> {
    const [waiting, active, completed, failed, delayed, paused] =
      await Promise.all([
        emailQueue.getWaitingCount(),
        emailQueue.getActiveCount(),
        emailQueue.getCompletedCount(),
        emailQueue.getFailedCount(),
        emailQueue.getDelayedCount(),
        emailQueue.getPausedCount(),
      ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
    };
  }
}

export default new EmailQueueService();
