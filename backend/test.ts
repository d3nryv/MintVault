import { PokemonTCG } from 'pokemon-tcg-sdk-typescript';
import axios from 'axios';

async function test() {
  try {
    const c1 = await PokemonTCG.findCardsByQueries({ q: 'name:*charizard*' });
    console.log('name:*charizard*', c1.length);
  } catch(e: any) {
    console.error(e.response?.data || e.message);
  }
}

test();
