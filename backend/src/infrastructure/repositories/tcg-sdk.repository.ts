import { PokemonTCG } from 'pokemon-tcg-sdk-typescript';
import { TcgRepository, TcgPlayerInfo } from "../../domain/repositories/tcg.repository";

export class TcgSdkRepository implements TcgRepository {

    async getCardById(id: string): Promise<TcgPlayerInfo | null> {
        try {
            const card = await PokemonTCG.findCardByID(id);
            if (!card) return null;

            return {
                id: card.id,
                name: card.name,
                supertype: card.supertype,
                subtypes: card.subtypes,
                hp: card.hp,
                types: card.types,
                evolvesFrom: card.evolvesFrom,
                abilities: card.abilities,
                attacks: card.attacks,
                weaknesses: card.weaknesses,
                resistances: card.resistances,
                retreatCost: card.retreatCost,
                flavorText: card.flavorText,
                rarity: card.rarity,
                images: card.images,
                set: {
                    id: card.set.id,
                    name: card.set.name,
                    series: card.set.series
                }
            };
        } catch (error) {
            console.error(`Error fetching card from TCG SDK: ${id}`, error);
            return null;
        }
    }

    async findCardsByName(name: string): Promise<TcgPlayerInfo[]> {
        try {
            const query = `name:${name.trim()}`;
            console.log(`[DEBUG] Buscando en API con query: ${query}`);
            const cards = await PokemonTCG.findCardsByQueries({ q: query, orderBy: 'set.releaseDate' });
            if (!cards) return [];

            return cards.map(card => ({
                id: card.id,
                name: card.name,
                supertype: card.supertype,
                subtypes: card.subtypes,
                hp: card.hp,
                types: card.types,
                evolvesFrom: card.evolvesFrom,
                abilities: card.abilities,
                attacks: card.attacks,
                weaknesses: card.weaknesses,
                resistances: card.resistances,
                retreatCost: card.retreatCost,
                flavorText: card.flavorText,
                rarity: card.rarity,
                images: card.images,
                set: {
                    id: card.set.id,
                    name: card.set.name,
                    series: card.set.series
                }
            }));
        } catch (error) {
            console.error(`Error fetching cards by name from TCG SDK: ${name}`, error);
            return [];
        }
    }
}
