import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AnimationsModule } from './modules/animations/animations.module';
import { DisciplinesModule } from './modules/disciplines/disciplines.module';
import { VolunteersModule } from './modules/volunteers/volunteers.module';

@Module({
  imports: [CoreModule, DisciplinesModule, VolunteersModule, AnimationsModule],
})
export class AppModule {}
