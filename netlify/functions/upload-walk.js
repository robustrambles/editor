const { default: MobiledocDOMRenderer } = require('mobiledoc-dom-renderer');
const SimpleDOM = require('simple-dom');
const TurndownService = require('turndown');
const matter = require('gray-matter');
const { getOctokitClient } = require('./lib/getOctokitClient');
const { checkAuthentication } = require('./lib/checkAuthentication');
const { commonProps } = require('./lib/constants');
const { toSlug } = require('./lib/toSlug');
const { btoa } = require('./lib/btoa');

exports.handler = async function(event, context) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    const { series, details, title, subtitle, content, portraitMap, image } = JSON.parse(event.body);
    const client = await getOctokitClient(event);
    await checkAuthentication(client);
    const renderer = new MobiledocDOMRenderer({
        dom: new SimpleDOM.Document()
    });
    const rendered = renderer.render(content);
    const serializer = new SimpleDOM.HTMLSerializer([]);
    const html = serializer.serializeChildren(rendered.result);
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(html);
    const renderedDetails = {};
    details.forEach(detail => {
        const detailHtml = serializer.serializeChildren(renderer.render(detail.value).result);
        const detailValue = turndownService.turndown(detailHtml);
        renderedDetails[detail.name] = detailValue;
    });
    const slug = toSlug(title);
    const walkFile = matter.stringify(markdown, {
        slug,
        title,
        subtitle,
        details: renderedDetails,
        portraitMap,
    });
    await client.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        ...commonProps,
        path: `walks/${series}/${slug}.md`,
        content: btoa(walkFile),
        message: `Add walk data for "${slug}"`,
    });
    await client.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        ...commonProps,
        path: `img/maps/${series}/${slug}.jpg`,
        content: image.data,
        message: `Add walk map for "${slug}"`,
    });
    return {
        statusCode: 200,
        body: '{ "success": true }',
    };
};