export interface AnimationProps {
  id: string;
  title: string;
  place: string;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
}

/** Une animation du programme : un nom, un lieu, un début et une fin. */
export class Animation {
  private constructor(private readonly props: AnimationProps) {}

  /** Reconstruit une animation depuis la persistance. */
  static restore(props: AnimationProps): Animation {
    return new Animation({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get place(): string {
    return this.props.place;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get endsAt(): Date {
    return this.props.endsAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /** En cours à partir de son début, et jusqu'à sa fin non comprise. */
  isInProgressAt(instant: Date): boolean {
    const time = instant.getTime();
    return this.props.startsAt.getTime() <= time && time < this.props.endsAt.getTime();
  }
}
