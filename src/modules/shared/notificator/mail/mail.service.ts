import { Transporter, createTransport } from 'nodemailer';
import nunjucks from 'nunjucks';
import path from 'path';
import {
  IEmailOptions,
  IEmailResponse,
  IEmailTemplate,
  EmailError,
  EmailErrorCode,
  IEmailRecipient,
  ITemplateData,
} from './types';

class MailService {
  private transporter!: Transporter;
  private templateEngine!: typeof nunjucks;
  private static instance: MailService | null = null;

  private constructor() {
    this.initializeTemplateEngine();
    this.initializeTransporter();
  }

  private initializeTemplateEngine(): void {
    this.templateEngine = nunjucks;
    this.templateEngine.configure(
      path.join(process.cwd(), CONFIG.mail.templates.path),
      {
        autoescape: true,
        noCache: !CONFIG.runningProd,
        watch: !CONFIG.runningProd,
      },
    );
  }

  private initializeTransporter(): void {
    this.transporter = createTransport({
      host: CONFIG.mail.host,
      port: CONFIG.mail.port,
      secure: CONFIG.runningProd && CONFIG.mail.port === 465,
      auth: CONFIG.runningProd
        ? {
            user: CONFIG.mail.user,
            pass: CONFIG.mail.pass,
          }
        : undefined,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
    });
  }

  private async validateConnection(): Promise<void> {
    try {
      await this.transporter.verify();
    } catch (error) {
      throw new EmailError(
        'Failed to connect to email server',
        EmailErrorCode.PROVIDER_ERROR,
        true,
      );
    }
  }

  private formatRecipient(recipient: string | IEmailRecipient): string {
    if (typeof recipient === 'string') {
      return recipient;
    }
    return recipient.name
      ? `${recipient.name} <${recipient.email}>`
      : recipient.email;
  }

  private formatRecipients(
    recipients: string | IEmailRecipient | Array<string | IEmailRecipient>,
  ): string {
    if (Array.isArray(recipients)) {
      return recipients.map((r) => this.formatRecipient(r)).join(', ');
    }
    return this.formatRecipient(recipients);
  }

  private async renderTemplate(
    template: string,
    data: ITemplateData,
  ): Promise<IEmailTemplate> {
    try {
      const enrichedData = {
        ...data,
        appName: CONFIG.app,
        expiresIn: Math.floor(CONFIG.otp.expiration / 60000), // Converted to minutes
      };
      const [subject, text, html] = await Promise.all([
        this.templateEngine.render(`${template}/subject.njk`, enrichedData),
        this.templateEngine.render(`${template}/text.njk`, enrichedData),
        this.templateEngine.render(`${template}/html.njk`, enrichedData),
      ]);

      return { subject, text, html };
    } catch (error) {
      throw new EmailError(
        `Failed to render template ${template}`,
        EmailErrorCode.TEMPLATE_RENDERING_ERROR,
        false,
      );
    }
  }

  public async sendMail(options: IEmailOptions): Promise<IEmailResponse> {
    try {
      await this.validateConnection();
      console.log('options', options);
      const { subject, text, html } = await this.renderTemplate(
        options.template,
        options.data as ITemplateData,
      );
      console.log('subject', subject);
      console.log('text', text);
      console.log('html', html);
      const mailOptions = {
        from: `"${CONFIG.mail.fromName}" <${CONFIG.mail.from}>`,
        to: this.formatRecipients(options.to),
        cc: options.cc ? this.formatRecipients(options.cc) : undefined,
        bcc: options.bcc ? this.formatRecipients(options.bcc) : undefined,
        replyTo: options.replyTo
          ? this.formatRecipient(options.replyTo)
          : undefined,
        subject,
        text,
        html,
        attachments: options.attachments,
      };
      console.log('mailOptions', mailOptions);
      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      LOGGER.error('Error sending email', {
        error,
        template: options.template,
        to: options.to,
      });

      if (error instanceof EmailError) {
        throw error;
      }

      throw new EmailError(
        'Failed to send email',
        EmailErrorCode.PROVIDER_ERROR,
        true,
      );
    }
  }

  public static getInstance(): MailService {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }
}

export default MailService.getInstance();
