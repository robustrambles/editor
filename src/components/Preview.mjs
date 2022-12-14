import {css} from "../deps/goober.mjs";
import Renderer from "../deps/mobiledoc-vdom-renderer.mjs";
import { h } from "../deps/vue.mjs";
import { walkSeries } from "../services/walks.mjs";

const styles = css`
    --skystart: #3955e1;
    --skyend: #46a9e8;
    --grass: #71bf8d;
    --earth: #B19F8B;
    --darkgrey: #222;
    --grey: #4a4a4a;
    --lightgrey: #f1f5f9;
    --white: #fff;
    /* Sizes */
    --curved: .4em;
    --header: 180px;
    --navbar: 50px;
    --bodycurve: 0;
  
  @media screen and (min-width: 750px) {
    /* Sizes */
    --header: 368px;
    --bodycurve: var(--curved);
  }
  
  /* Global stylesheet */
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  
    margin: auto;
    line-height: 1.75;
    font-size: 1.125em;
    font-family: -apple-system, system-ui, sans-serif;
    color: var(--darkgrey);
    background-color: var(--skystart);
  
  .link-overlay {
    position: static;
  }
  
  .link-overlay:before {
    bottom: 0;
    content: '';
    left: 0;
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 0;
    white-space: nowrap;
    z-index: 1;
  }
  
  header {
      height: var(--header);
      background-image: linear-gradient(var(--skystart), var(--skyend));
      position: relative;
  }
  
  header .wrapper > * {
    margin-left: .5em;
  }
  
  @media screen and (min-width: 750px) {
    header .wrapper > * {
      margin-left: 0;
    }
  
    header h1 {
      font-size: 6em;
      width: 50%;
      line-height: 1;
    }
  }
  
  header h1 a {
    text-decoration: none;
    color: var(--white);
    opacity: 0.8;
    transition: 0.25s opacity ease-in-out;
  }
  
  header h1 a:hover, header h1 a:focus {
    opacity: 1;
  }
  
  header h2 {
    color: var(--white);
    opacity: 0.8;
  }
  
  @media screen and (min-width: 750px) {
    header h2 {
      font-size: 2.5em;
    }
  }
  
  header::before, header::after {
      position: absolute;
  }
  
  header::before {
    content: '';
    background-image: url('/img/grass.svg');
    background-repeat: repeat no-repeat;
    background-position: bottom;
    background-size: 125%;
    width: 100%;
    height: 30px;
    display: block;
    bottom: var(--navbar);
  }
  
  @media screen and (min-width: 500px) {
    header::before {
      background-size: 75%;
    }
  }
  
  @media screen and (min-width: 1000px) {
    header::before {
      background-size: 35%;
    }
  }
  
  @media screen and (min-width: 2000px) {
    header::before {
      background-size: 20%;
    }
  }
  
  @media print {
    header, nav, footer, hr {
      display: none;
    }
  }
  
  header::after {
      content: '';
      width: 100%;
      height: var(--navbar);
      display: block;
      background-color: var(--grass);
      bottom: 0;
  }
  
  header nav {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    display: flex;
    justify-content: center;
  }
  
  header nav ul {
    list-style: none;
    display: flex;
    padding-bottom: 0.25em;
  }
  
  header nav ul li, header nav ul li a {
    color: var(--white);
  }
  
  header nav ul li::before {
    content: '|';
    padding: 0 1em;
  }
  
  header nav ul li:first-child::before {
    content: none;
  }
  
  .earth {
      background-color: var(--earth);
      min-height: calc(100vh - var(--header));
  }
  
  header .wrapper, main {
    width: 100%;
    max-width: 70ch;
    margin: 0 auto;
  }
  
  main {
    background: var(--white);
    padding: 2em 1em;
    border-bottom-left-radius: var(--bodycurve);
    border-bottom-right-radius: var(--bodycurve);
  }
  
  main h1, main h2, main h3, main h4, main h5, main h6 {
    margin-top: 1em;
  }
  
  main h1:first-child, main h2:first-child, main h3:first-child, main h4:first-child, main h5:first-child, main h6:first-child {
    margin-top: 0;
  }
  
  main h3 + h4 {
    margin-top: 0;
  }
  
  main h5 {
    text-transform: uppercase;
    color: var(--grey);
  }
  
  main h5 + p {
    margin-top: 0.2em;
  }
  
  main p, main ul, main ol {
    margin-top: 1.4em;
  }
  
  main ul, main ol {
    margin-left: 1em;
  }
  
  main .series-list {
    margin: 12px 0 0;
    list-style: none;
  }
  
  main .series-list .walk {
    margin-bottom: 12px;
    padding: 6px 8px;
    background-color: #f1f5f9;
    border-radius: var(--curved);
    box-shadow: 0 1px 0 rgba(var(--tblr-body-color-rgb), 0.04);
    transition: 0.125s border ease-in-out;
    border: 1px solid transparent;
    position: relative;
  }
  
  main .series-list .walk:hover {
    border-color: var(--darkgrey);
  }
  
  main .series-list .walk p {
    display: flex;
    flex-direction: column;
    margin: 0;
    font-size: 0.85em;
  }
  
  main .series-list .walk a {
    font-size: 1.2em;
    color: inherit;
    text-decoration: none;
  }
  
  main .series-list .walk a:hover {
    text-decoration: underline;
  }
  
  @media screen and (min-width: 750px) {
    main .series-list {
      display: flex;
      flex-wrap: wrap;
    }
  
    main .series-list .walk {
      width: calc(50% - 8px);
    }
    
    main .series-list .walk:nth-child(odd) {
      margin-right: 8px;
    }
    
    main .series-list .walk:nth-child(even) {
      margin-left: 8px;
    }
  }
  
  .walk-details th, .walk-details td {
    vertical-align: top;
    text-align: left;
    border-bottom: 1px solid var(--darkgrey);
  }
  
  .walk-details tr:last-child th, .walk-details tr:last-child td {
    border-bottom: 0;
  }
  
  .walk-details td {
    padding-left: 8px;
  }

  .walk-details td p:first-child {
    margin-top: 0;
  }
  
  main img {
    max-width: 100%;
  }
  
  footer {
    margin: 0 auto;
    text-align: center;
    color: var(--white);
    font-size: 0.75em;
  }
`;

const render = Renderer({ createElement: h });

export default {
    props: ['series', 'title', 'subtitle', 'details', 'content', 'image'],
    template: `<Teleport to="#teleport-root">
        <div class="${styles}">
            <header>
                <div class="wrapper">
                    <h1><a href="/">Robust Rambles</a></h1>
                    <h2>{{seriesTitle}}</h2>
                </div>
    
                <nav>
                    <ul>
                        <li class="nav-item"><a href="#" @click.prevent>Home</a></li>
                        <li class="nav-item"><a href="#" @click.prevent>Walks</a></li>
                        <li class="nav-item"><a href="#" @click.prevent>About</a></li>
                    </ul>
                </nav>
            </header>
    
            <div class="earth">
                <main>
                    <h3>{{title}}</h3>
                    <h4>{{subtitle}}</h4>
                    <h5>Walk Details</h5>
                    <table class="walk-details">
                        <tbody>
                            <tr v-for="detail in details" :key="detail.id">
                                <th>{{detail.name}}</th>
                                <td><component :is="renderMobiledoc(detail.value)" /></td>
                            </tr>
                        </tbody>
                    </table>
    
                    <h5>Walk Instructions</h5>
                    <component :is="renderedContent" />

                    <img :src="image" loading="lazy" />
                </main>
    
                <footer>
                    <p>Text copyrighted &copy; Colin Bridge 2009-{{currentYear}}</p>
                </footer>
            </div>
        </div>
    </Teleport>`,
    computed: {
        currentYear() {
            return new Date().getFullYear();
        },
        seriesTitle() {
            const seriesData = walkSeries.find(series => series.slug === this.series);
            return seriesData?.title || '';
        },
        renderedContent() {
            return this.renderMobiledoc(this.content);
        }
    },
    methods: {
        renderMobiledoc(mobiledoc) {
            if (!mobiledoc) return;
            const children = render(mobiledoc);   
            return h('span', children);
        }
    }
}