import { Module } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'

// https://stackoverflow.com/questions/59104427/nestjs-global-pubsub-instance-and-dependency-injection

@Module({
  providers: [
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: ['PUB_SUB'],
})
export class PubSubModule {}
