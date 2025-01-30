import { IEmailJob, IEmailJobResult } from './types';
import { MailServiceUtilities } from 'modules/shared/notificator';

export class EmailJobProcessor {
  async process(job: IEmailJob): Promise<IEmailJobResult> {
    const startTime = Date.now();
    const { to, template, data, metadata } = job.data;

    try {
      LOGGER.info(`Processing email job ${job.id}`, {
        template,
        to,
        metadata,
      });

      await job.progress(10);

      const result = await MailServiceUtilities.sendMail({
        to,
        template,
        data,
      });

      await job.progress(100);

      if (!result.success) {
        throw result.error;
      }

      const processingTime = Date.now() - startTime;
      LOGGER.info(`Email sent successfully for job ${job.id}`, {
        processingTime,
        template,
        metadata,
      });

      return {
        success: true,
        messageId: result.messageId,
        timestamp: Date.now(),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      LOGGER.error(`Failed to process email job ${job.id}`, {
        error,
        processingTime,
        template,
        metadata,
      });
      LOGGER.file('EMAIL_JOB_PROCESSING_ERROR', {
        error,
        processingTime,
        template,
        metadata,
      });

      throw error;
    }
  }
}
