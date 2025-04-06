import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
//import { sendMailDto } from './mailer/mail.interface'
import { MailerService } from './mailer/mailer.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailerService: MailerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  // @Get('send-mail')
  // async sendMail() {
  //   const sendMailDto: sendMailDto = {
  //     from: { name: 'Wanderix Service', address: 'wanderix@gmail.com' },
  //     recipients: [
  //       { name: 'Michael', address: 'michael.cordonnier@student.howest.be' },
  //       { name: 'John doe', address: 'John.doe@gmail.com' },
  //       { name: 'Stef', address: 'stef.pieters@student.howest.be' },
  //     ],
  //     subject: 'Booking cancelled',
  //     html: `<p>AAAAH MAN your booking got cancelled thats a bummer :) !</p>`,
  //   }
  //   await this.mailerService.sendMail(sendMailDto)
  //   return 'Email sent successfully'
  // }

  // @Post('send-mail')
  // async sendEmail(@Body() sendMailDto: sendMailDto) {
  //   console.log('Received body:', sendMailDto) // Log the received body
  //   await this.mailerService.sendMail(sendMailDto)
  //   return 'Email sent successfully'
  // }
}
