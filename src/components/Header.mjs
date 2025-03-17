import CreateSeries from "../pages/CreateSeries.mjs";
import CreateWalk from "../pages/CreateWalk.mjs";
import UploadWalks from "../pages/UploadWalks.mjs";
import WalkList from "../pages/WalkList.mjs"

export default {
    props: ['showNav'],
    inject: ['router'],
    computed: {
        routes() {
           return [
                {
                  title: "Walks",
                  spec: this.router.getSpec(WalkList).spec,
                  path: this.router.getPath(WalkList),
                },
                {
                  title: "Upload Walks",
                  spec: this.router.getSpec(UploadWalks).spec,
                  path: this.router.getPath(UploadWalks),
                },
                {
                  title: "Add Walk",
                  spec: this.router.getSpec(CreateWalk).spec,
                  path: this.router.getPath(CreateWalk),
                },
                {
                  title: "Add Series",
                  spec: this.router.getSpec(CreateSeries).spec,
                  path: this.router.getPath(CreateSeries),
                }
            ];
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
                <li v-for="(route, index) in routes" :key="index"
                class="nav-item" :class="{ active: router.state.activeSpec === route.spec }">
                    <a class="nav-link" :href="route.path">
                        <span class="nav-link-title">
                        {{route.title}}
                        </span>
                    </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>`,
}