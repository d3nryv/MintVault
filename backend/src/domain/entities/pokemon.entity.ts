export class PokemonEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly types: string[],
    public readonly stats: Record<string, number>,
    public readonly abilities: string[],
    public readonly description: string,
    public readonly artworkUrl: string,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(props: {
    id: number;
    name: string;
    types: string[];
    stats: Record<string, number>;
    abilities: string[];
    description: string;
    artworkUrl: string;
    createdAt?: Date;
  }): PokemonEntity {
    return new PokemonEntity(
      props.id,
      props.name,
      props.types,
      props.stats,
      props.abilities,
      props.description,
      props.artworkUrl,
      props.createdAt || new Date()
    );
  }
}
