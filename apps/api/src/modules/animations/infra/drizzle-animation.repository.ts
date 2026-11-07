import { Inject, Injectable } from '@nestjs/common';
import { and, gte, lt } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { AnimationRepository } from '../application/animation.repository';
import type { Animation } from '../domain/animation';
import { toDomain } from './animation.mapper';
import { animations } from './animations.schema';

@Injectable()
export class DrizzleAnimationRepository extends AnimationRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async listStartingBetween(from: Date, to: Date): Promise<Animation[]> {
    const rows = await this.db
      .select()
      .from(animations)
      .where(and(gte(animations.startsAt, from), lt(animations.startsAt, to)));
    return rows.map(toDomain);
  }
}
