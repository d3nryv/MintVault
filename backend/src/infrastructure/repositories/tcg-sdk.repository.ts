import { PokemonTCG } from 'pokemon-tcg-sdk-typescript';
import { TcgRepository, TcgPlayerInfo } from "../../domain/repositories/tcg.repository";

export class TcgSdkRepository implements TcgRepository {
    // Static in-memory cache to persist cache across repository instantiations
    private static cardCache = new Map<string, TcgPlayerInfo>();
    private static nameSearchCache = new Map<string, TcgPlayerInfo[]>();
    private static querySearchCache = new Map<string, TcgPlayerInfo[]>();

    async getCardById(id: string): Promise<TcgPlayerInfo | null> {
        // 1. Check in-memory cache first
        if (TcgSdkRepository.cardCache.has(id)) {
            console.log(`[TCG CACHE] Cache hit for card details: ${id}`);
            return TcgSdkRepository.cardCache.get(id) || null;
        }

        try {
            const card = await PokemonTCG.findCardByID(id);
            if (!card) return null;

            const cardInfo: TcgPlayerInfo = {
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
                nationalPokedexNumbers: card.nationalPokedexNumbers,
                images: card.images,
                set: {
                    id: card.set.id,
                    name: card.set.name,
                    series: card.set.series,
                    ptcgoCode: card.set.ptcgoCode
                }
            };

            // 2. Save in cache
            TcgSdkRepository.cardCache.set(id, cardInfo);
            return cardInfo;
        } catch (error: any) {
            console.error(`Error fetching card from TCG SDK: ${id}`, error);
            
            // Check for rate limit status (429)
            if (error?.status === 429 || error?.response?.status === 429) {
                console.warn(`[TCG RATE LIMIT] Request throttled for card: ${id}.`);
            }
            return null;
        }
    }

    async findCardsByName(name: string): Promise<TcgPlayerInfo[]> {
        const cacheKey = name.trim().toLowerCase();
        // 1. Check in-memory cache
        if (TcgSdkRepository.nameSearchCache.has(cacheKey)) {
            console.log(`[TCG CACHE] Cache hit for name search: "${name}"`);
            return TcgSdkRepository.nameSearchCache.get(cacheKey) || [];
        }

        try {
            const query = `name:*${name.trim()}*`;
            console.log(`[DEBUG] Buscando en API con query: ${query}`);
            const cards = await PokemonTCG.findCardsByQueries({ q: query });
            if (!cards) return [];

            const results = cards.map(card => ({
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
                nationalPokedexNumbers: card.nationalPokedexNumbers,
                images: card.images,
                set: {
                    id: card.set.id,
                    name: card.set.name,
                    series: card.set.series,
                    ptcgoCode: card.set.ptcgoCode
                }
            }));

            // 2. Save search results in cache
            TcgSdkRepository.nameSearchCache.set(cacheKey, results);
            
            // 3. Proactively seed individual card details cache to speed up subsequent detail fetches
            results.forEach(card => {
                if (!TcgSdkRepository.cardCache.has(card.id)) {
                    TcgSdkRepository.cardCache.set(card.id, card);
                }
            });

            return results;
        } catch (error: any) {
            console.error(`Error fetching cards by name from TCG SDK: ${name}`, error);
            if (error?.status === 429 || error?.response?.status === 429) {
                console.warn(`[TCG RATE LIMIT] Request throttled for name search: "${name}".`);
            }
            return [];
        }
    }

    async searchCards(filters: { name?: string; set?: string; number?: string }): Promise<TcgPlayerInfo[]> {
        const cacheKey = JSON.stringify(filters);
        // 1. Check in-memory cache
        if (TcgSdkRepository.querySearchCache.has(cacheKey)) {
            console.log(`[TCG CACHE] Cache hit for advanced search:`, filters);
            return TcgSdkRepository.querySearchCache.get(cacheKey) || [];
        }

        try {
            const queries: string[] = [];
            if (filters.name) queries.push(`name:*${filters.name.trim()}*`);
            if (filters.set) queries.push(`set.id:${filters.set.trim()}`);
            if (filters.number) queries.push(`number:${filters.number.trim()}`);

            const q = queries.join(' ');
            console.log(`[DEBUG] Advanced search with query: ${q}`);
            
            const cards = await PokemonTCG.findCardsByQueries({ q });
            if (!cards) return [];

            const results = cards.map(card => ({
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
                nationalPokedexNumbers: card.nationalPokedexNumbers,
                images: card.images,
                set: {
                    id: card.set.id,
                    name: card.set.name,
                    series: card.set.series,
                    ptcgoCode: card.set.ptcgoCode
                }
            }));

            // 2. Save in cache
            TcgSdkRepository.querySearchCache.set(cacheKey, results);

            // 3. Seed individual card details cache
            results.forEach(card => {
                if (!TcgSdkRepository.cardCache.has(card.id)) {
                    TcgSdkRepository.cardCache.set(card.id, card);
                }
            });

            return results;
        } catch (error: any) {
            console.error(`Error in advanced search:`, filters, error);
            if (error?.status === 429 || error?.response?.status === 429) {
                console.warn(`[TCG RATE LIMIT] Request throttled for advanced search:`, filters);
            }
            return [];
        }
    }
}
