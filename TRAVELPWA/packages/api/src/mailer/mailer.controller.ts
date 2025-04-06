import { Controller } from '@nestjs/common'
import { MailerService } from './mailer.service'
//import { sendMailDto } from './mail.interface'

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  // @Post('/send')
  // async sendMail(@Body() body: sendMailDto) {
  //   //('Received body:', body) // Log the received body
  //   return await this.mailerService.sendMail(body)
  // }
}
