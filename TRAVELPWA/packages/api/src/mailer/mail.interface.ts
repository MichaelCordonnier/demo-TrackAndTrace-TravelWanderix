import { Address } from 'nodemailer/lib/mailer'

export interface sendMailDto {
  from?: Address
  recipients: Address[]
  subject: string
  html: string
  placeholderReplacements?: Record<string, string>
}
