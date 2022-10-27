import Header from "./Header.mjs";
import Auth from "./Auth.mjs";
import { activeRoute } from "../services/routes.mjs";

export default {
    components: { Header, Auth },
    template: `<div class="theme-light">
        <div class="page">
            <Header />
            <main class="page-wrapper">
                <component v-if="hasAuth" :is="activeRoute" />
                <Auth v-else />
            </main>
        </div>
    </div>`,
    computed: {
        hasAuth() {
            return true;
        },
        activeRoute() {
            return activeRoute.value;
        }
    },
}