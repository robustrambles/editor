import CreateSeries from "../pages/CreateSeries.mjs";
import CreateWalk from "../pages/CreateWalk.mjs";
import WalkList from "../pages/WalkList.mjs"
import { activeRoute, activeHash, getRoute } from "../services/routes.mjs"

export default {
    data: () => ({ WalkList: getRoute(WalkList), CreateWalk: getRoute(CreateWalk), CreateSeries: getRoute(CreateSeries) }),
    computed: {
        activeRoute() {
            return activeRoute.value;
        },
        activeHash() {
            return '#' + activeHash.value;
        }
    },
    template: `
    <header class="navbar navbar-expand-md navbar-light d-print-none">
        <div class="container-xl">
            <h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
                Robust Rambles walk editor
            </h1>
        </div>
    </header>
    <div class="navbar-expand-md">
        <div class="collapse navbar-collapse" id="navbar-menu">
          <div class="navbar navbar-light">
            <div class="container-xl">
              <ul class="navbar-nav">
                <li class="nav-item" :class="{ active: activeHash === WalkList }">
                  <a class="nav-link" :href="WalkList">
                    <span class="nav-link-title">
                      Walks
                    </span>
                  </a>
                </li>
                <li class="nav-item" :class="{ active: activeHash === CreateWalk }">
                  <a class="nav-link" :href="CreateWalk">
                    <span class="nav-link-title">
                      Add Walk
                    </span>
                  </a>
                </li>
                <li class="nav-item" :class="{ active: activeHash === CreateSeries }">
                  <a class="nav-link" :href="CreateSeries">
                    <span class="nav-link-title">
                      Add Series
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>`,
}