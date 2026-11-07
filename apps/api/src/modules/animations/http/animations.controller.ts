import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { agendaQuerySchema, type AnimationResponse, animationSchema } from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { GetDayAgenda } from '../application/use-cases/get-day-agenda';
import type { Animation } from '../domain/animation';

class AgendaQueryDto extends createZodDto(agendaQuerySchema) {}
class AnimationDto extends createZodDto(animationSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('animations')
@Controller('animations')
export class AnimationsController {
  constructor(private readonly getDayAgenda: GetDayAgenda) {}

  /** `?date=2026-11-01` : l'agenda du jour ; `&at=15:00` : seulement ce qui est en cours. */
  @Get()
  @ZodSerializerDto([AnimationDto])
  async agenda(@Query() query: AgendaQueryDto): Promise<AnimationResponse[]> {
    return (await this.getDayAgenda.execute(query)).map(toResponse);
  }
}

function toResponse(animation: Animation): AnimationResponse {
  return {
    id: animation.id,
    title: animation.title,
    place: animation.place,
    startsAt: animation.startsAt.toISOString(),
    endsAt: animation.endsAt.toISOString(),
  };
}
