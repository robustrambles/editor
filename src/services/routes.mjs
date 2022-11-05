import { ref } from "../deps/vue.mjs";
import CreateSeries from "../pages/CreateSeries.mjs";
import CreateWalk from "../pages/CreateWalk.mjs";
import WalkList from "../pages/WalkList.mjs";

export const routes = {
    '/': WalkList,
    '/create-walk': CreateWalk,
    '/create-series': CreateSeries,
}

export const routeMap = new WeakMap();
for (const route in routes) {
    routeMap.set(routes[route], route);
}

export const getRoute = (component) => '#' + (routeMap.get(component) || '/');

export const activeHash = ref(window.location.hash.slice(1) || '/');
export const activeRoute = ref(routes[activeHash.value]);

window.addEventListener('hashchange', () => {
    activeHash.value = window.location.hash.slice(1) || '/';
    activeRoute.value = routes[activeHash.value];
});