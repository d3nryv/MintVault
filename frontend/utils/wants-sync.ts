export type WantsListItem = {
  id: string | number;
  name: string;
  set: string;
  number: string;
  count: number;
  condition: string;
  priority: "High" | "Medium" | "Low";
  owned: boolean;
};

export interface WantsList {
  id: string;
  name: string;
  type: "deck" | "collection" | "empty";
  sourceId?: string;
  sourceName?: string;
  language?: string;
  items: WantsListItem[];
  createdAt: string;
}

export const syncWantsListWithSetUpdate = (
  wantListStrings: string[],
  card: any,
  isOwnedNow: boolean
): string[] => {
  if (!wantListStrings || wantListStrings.length === 0) return wantListStrings;

  let changed = false;
  const lists: WantsList[] = wantListStrings.map((s) => JSON.parse(s));

  const updatedLists = lists.map((list) => {
    // Only update collection wants lists that match the card's set
    const cardSetId = card.set?.id || card.set;
    if (list.type === "collection" && list.sourceId === cardSetId) {
      if (isOwnedNow) {
        // Card is now owned, remove it from the wants list
        const initialLen = list.items.length;
        const newItems = list.items.filter((item) => item.id !== card.id);
        if (newItems.length !== initialLen) {
          changed = true;
          return { ...list, items: newItems };
        }
      } else {
        // Card is no longer owned, add it to the wants list if it's missing
        const exists = list.items.some((item) => item.id === card.id);
        if (!exists) {
          changed = true;
          const newItem: WantsListItem = {
            id: card.id,
            name: card.name,
            set: card.set?.name || card.set || "Unknown Set",
            number: card.number || "N/A",
            count: 1,
            condition: "Near Mint",
            priority: "Medium",
            owned: false,
          };
          return { ...list, items: [...list.items, newItem] };
        }
      }
    }
    return list;
  });

  return changed ? updatedLists.map((l) => JSON.stringify(l)) : wantListStrings;
};

export const syncWantsListWithDeckUpdate = (
  wantListStrings: string[],
  deckId: string,
  deckCards: any[] // array of { card: { ... }, count: number }
): string[] => {
  if (!wantListStrings || wantListStrings.length === 0) return wantListStrings;

  let changed = false;
  const lists: WantsList[] = wantListStrings.map((s) => JSON.parse(s));

  const updatedLists = lists.map((list) => {
    // Only update deck wants lists that match the deckId
    if (list.type === "deck" && list.sourceId === deckId.toString()) {
      changed = true;
      const deckCardIds = deckCards.map((c) => c.card.id);
      const existingItemIds = list.items.map((i) => i.id);

      // Keep items that are still in the deck
      const itemsToKeep = list.items.filter((item) =>
        deckCardIds.includes(item.id)
      );

      // Add items that are in the deck but not in the list
      const itemsToAdd = deckCards
        .filter((c) => !existingItemIds.includes(c.card.id))
        .map((c) => ({
          id: c.card.id,
          name: c.card.name,
          set: c.card.set?.name || c.card.set || "Unknown Set",
          number: c.card.number || "N/A",
          count: c.count || 1,
          condition: "Any",
          priority: "Medium" as const,
          owned: false,
        }));

      return { ...list, items: [...itemsToKeep, ...itemsToAdd] };
    }
    return list;
  });

  return changed ? updatedLists.map((l) => JSON.stringify(l)) : wantListStrings;
};
