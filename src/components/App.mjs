import Header from "./Header.mjs";
import Auth from "./Auth.mjs";
import { activeRoute } from "../services/routes.mjs";
import Modals from "./Modals.mjs";

const parseCookie = (/** @type {string} */ str) =>
  str
    .split(';')
    .map(v => v.split('='))
    .reduce((/** @type {{ [key: string]: string }} */acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

export default {
    components: { Header, Auth, Modals },
    template: `<div class="theme-light">
        <div class="page">
            <Header :showNav="hasAuth" />
            <main class="page-wrapper">
                <component v-if="hasAuth" :is="activeRoute" />
                <Auth v-else />
            </main>
            <Modals />
        </div>
    </div>`,
    computed: {
        hasAuth() {
            try {
                const cookies = parseCookie(document.cookie);
                return '__Host-github-token' in cookies || 'token' in cookies;
            } catch {
                return false;
            }
        },
        activeRoute() {
            return activeRoute.value;
        }
    },
}