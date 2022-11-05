const { createOAuthAppAuth } = require("@octokit/auth-oauth-app");
const { default: MobiledocDOMRenderer } = require('mobiledoc-dom-renderer');
const SimpleDOM = require('simple-dom');
const TurndownService = require('turndown');
const matter = require('gray-matter');
const { Octokit } = require("@octokit/core");

const commonProps = {
    owner: 'robustrambles',
    repo: 'site',
};

const parseCookie = (/** @type {string} */ str) =>
  str
    .split(';')
    .map(v => v.split('='))
    .reduce((/** @type {{ [key: string]: string }} */acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

const toSlug = (str) => str.replace(/\s+/g, ' ').split(' ').join('-').toLowerCase();

const btoa = (unencodedData) => {
    const buff = Buffer.from(unencodedData, 'utf-8');
    return buff.toString('base64');
};

exports.handler = async function(event, context) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    const { seriesTitle, content } = JSON.parse(event.body);
    let client;
    try {
        const cookies = parseCookie(event.headers.cookie);
        const token = cookies[DEV ? 'token' : '__Host-github-token'];
        client = new Octokit({ auth: token });
    } catch (error) {
        return {
            statusCode: 401,
            body: DEV ? error.toString() : '',
        };
    }
    const renderer = new MobiledocDOMRenderer({
        dom: new SimpleDOM.Document()
    });
    const rendered = renderer.render(content);
    const serializer = new SimpleDOM.HTMLSerializer([]);
    const html = serializer.serializeChildren(rendered.result);
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(html);
    const slug = toSlug(seriesTitle);
    const walkFile = matter.stringify(markdown, {
        slug,
        seriesTitle
    });
    await client.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        ...commonProps,
        path: `walks/${slug}/index.md`,
        content: btoa(walkFile),
        message: `Add walk data for "${slug}"`,
    });
    return {
        statusCode: 200,
        body: '{ "success": true }',
    };
};