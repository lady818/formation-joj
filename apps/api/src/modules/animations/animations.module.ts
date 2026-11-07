import { Module } from '@nestjs/common';
import { AnimationRepository } from './application/animation.repository';
import { GetDayAgenda } from './application/use-cases/get-day-agenda';
import { AnimationsController } from './http/animations.controller';
import { DrizzleAnimationRepository } from './infra/drizzle-animation.repository';

@Module({
  controllers: [AnimationsController],
  providers: [
    // Le port (classe abstraite) est relié ici à son implémentation Drizzle.
    { provide: AnimationRepository, useClass: DrizzleAnimationRepository },
    GetDayAgenda,
  ],
})
export class AnimationsModule {}
