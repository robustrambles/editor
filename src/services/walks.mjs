import { persistRef, reactive, ref } from "../deps/vue.mjs";

export const walkSeries = reactive([]);

const walkSeriesResponse = await fetch('https://site-eta-sand.vercel.app/feed/feed.json').then(r => r.json());
walkSeries.push(...walkSeriesResponse.walks);

export const importedWalks = ref(new Map());
persistRef(importedWalks, 'ROBUSTRAMBLES_EDITOR_IMPORTED_WALKS', true);