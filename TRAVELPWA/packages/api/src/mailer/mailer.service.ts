import { Injectable } from '@nestjs/common'
import { MailerService as NestMailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { sendMailDto } from './mail.interface'

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {
    // //('MAIL_HOST:', this.configService.get<string>('MAIL_HOST'))
    // //('MAIL_PORT:', this.configService.get<string>('MAIL_PORT'))
    // //(
    //   'MAIL_USERNAME:',
    //   this.configService.get<string>('MAIL_USERNAME'),
    // )
  }

  async sendMail(sendMailDto: sendMailDto) {
    const { from, recipients, subject, placeholderReplacements, html } =
      sendMailDto
    const htmlContent = placeholderReplacements
      ? this.template(html, placeholderReplacements)
      : html

    // console.log('sendMailDto:', sendMailDto)

    const to = recipients
      .map(recipient => `${recipient.name} <${recipient.address}>`)
      .join(', ')
    //('Recipients:', to) // Log the recipients

    try {
      await this.mailerService.sendMail({
        from: from ?? {
          name: this.configService.get<string>('APP_NAME'),
          address: this.configService.get<string>('MAIL_USERNAME'),
        },
        to,
        subject,
        html: htmlContent,
      })
      //('Email sent successfully')
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email')
    }
  }

  private template(html: string, replacements: Record<string, string>): string {
    let result = html
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return result
  }
}
