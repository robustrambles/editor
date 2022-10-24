import { ref } from "../deps/vue.mjs";
import HelloWorld from "../pages/HelloWorld.mjs";

export const routes = {
    '/': HelloWorld,
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