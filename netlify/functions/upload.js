const { createOAuthAppAuth } = require("@octokit/auth-oauth-app");
const { default: MobiledocDOMRenderer } = require('mobiledoc-dom-renderer');
const SimpleDOM = require('simple-dom');
const TurndownService = require('turndown');
const matter = require('gray-matter');

const parseCookie = (/** @type {string} */ str) =>
  str
    .split(';')
    .map(v => v.split('='))
    .reduce((/** @type {{ [key: string]: string }} */acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});


exports.handler = async function(event, context) {
    const { details, slug, title, subtitle } = JSON.parse(event.body);
    // const cookies = parseCookie(event.headers.cookie);
    // const token = cookies['__Host-github-token'];
    // const client = new Octokit({ auth: token });
    const renderer = new MobiledocDOMRenderer({
        dom: new SimpleDOM.Document()
    });
    const rendered = renderer.render(mobiledoc);
    const serializer = new SimpleDOM.HTMLSerializer([]);
    const html = serializer.serializeChildren(rendered.result);
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(html);
    return {
        statusCode: 200,
        body: matter.stringify(markdown, {
            slug,
            title,
            subtitle,
            details
            // portraitMap: false
        })
    };
};