import Route from "../deps/route-parser.mjs";
import { ref, markRaw, reactive, watchEffect, computed } from "../deps/vue.mjs";
import CreateSeries from "../pages/CreateSeries.mjs";
import CreateWalk from "../pages/CreateWalk.mjs";
import WalkList from "../pages/WalkList.mjs";

const defaultRoute = '/create-walk';
const defaultPath = '#' + defaultRoute;
export const routes = {
    '/': WalkList,
    '/create-walk': CreateWalk,
    '/create-series': CreateSeries,
}

const compiledRoutes = Object.entries(routes).map(([spec, component]) => ({ route: new Route(spec), spec, component }));

const activePath = ref(null);
const activeHash = computed(() => '#' + activePath.value);
const activeRoute = ref(null);
const routeParams = ref({});

const redirectToDefault = () => window.location.hash = defaultPath;

const selectRoute = () => {
    const currentPath = window.location.hash.slice(1);
    if (currentPath === '') return redirectToDefault();
    let params;
    const matchedRoute = compiledRoutes.find(({ route }) => params = route.match(currentPath));
    if (!matchedRoute) return redirectToDefault();
    activePath.value = matchedRoute.spec;
    activeRoute.value = markRaw(matchedRoute.component);
    routeParams.value = params;
};

selectRoute();

window.addEventListener('hashchange', selectRoute);

const getPath = (component, params = {}) => {
    const componentName = typeof component === 'string' ? component : component.name;
    const routeConfiguration = compiledRoutes.find(({ component: routeComponent }) => componentName === routeComponent.name);
    if (!routeConfiguration) return '#' + defaultRoute;
    return '#' + routeConfiguration.route.reverse(params);
}

const goTo = (component, params = {}) => {
    window.location.hash = getPath(component, params);
}

export default {
    install: (app, options) => {
        const stateObject = reactive({});
        watchEffect(() => {
            stateObject.activeRoute = activeRoute.value;
            stateObject.activePath = activePath.value;
            stateObject.activeHash = activeHash.value;
            stateObject.routeParams = routeParams.value;
        });
        app.provide('router', {
            getPath,
            goTo,
            defaultRoute,
            defaultPath,
            state: stateObject
        });
    }
}