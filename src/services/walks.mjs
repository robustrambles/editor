import { reactive } from "../deps/vue.mjs";

export const walkSeries = reactive([]);

fetch('https://site-eta-sand.vercel.app/feed/feed.json').then(r => r.json()).then(data => walkSeries.push(...data.walks));