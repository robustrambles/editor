import { css } from "../deps/goober.mjs";
import Header from "./Header.mjs";
import Auth from "./Auth.mjs";
import { activeRoute } from "../services/routes.mjs";

const styles = css`
    .page {
        width: 50%;
    }
`;

export default {
    components: { Header, Auth },
    template: `<div class="layout-fluid theme-light ${styles}">
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