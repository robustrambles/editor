const { getOctokitClient } = require('./lib/getOctokitClient');
const { checkAuthentication } = require('./lib/checkAuthentication');
const WordExtractor = require("word-extractor");

exports.handler = async function(request) {
    const client = await getOctokitClient(request);
    await checkAuthentication(client);
    // create a buffer from the request's body
    const buffer = Buffer.from(request.body, 'base64');
    // extract content
    const extractor = new WordExtractor();
    const document = await extractor.extract(buffer);
    const content = document.getBody();

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
    };
};