import CreateSeries from "../pages/CreateSeries.mjs";
import CreateWalk from "../pages/CreateWalk.mjs";
import WalkList from "../pages/WalkList.mjs"

export default {
    props: ['showNav'],
    inject: ['router'],
    computed: {
        routes() {
           return {
                WalkList: this.router.getSpec(WalkList).spec,
                CreateWalk: this.router.getSpec(CreateWalk).spec,
                CreateSeries: this.router.getSpec(CreateSeries).spec
            };
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
    <div class="navbar-expand-md" v-if="showNav !== false">
        <div class="collapse navbar-collapse" id="navbar-menu">
          <div class="navbar navbar-light">
            <div class="container-xl">
              <ul class="navbar-nav">
                <li class="nav-item" :class="{ active: router.state.activeSpec === routes.WalkList }">
                  <a class="nav-link" :href="routes.WalkList">
                    <span class="nav-link-title">
                      Walks
                    </span>
                  </a>
                </li>
                <li class="nav-item" :class="{ active: router.state.activeSpec === routes.CreateWalk }">
                  <a class="nav-link" :href="routes.CreateWalk">
                    <span class="nav-link-title">
                      Add Walk
                    </span>
                  </a>
                </li>
                <li class="nav-item" :class="{ active: router.state.activeSpec === routes.CreateSeries }">
                  <a class="nav-link" :href="routes.CreateSeries">
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