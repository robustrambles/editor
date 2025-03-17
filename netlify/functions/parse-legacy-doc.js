const WordExtractor = require("word-extractor");

exports.handler = async function(request) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    try {
        const cookies = parseCookie(request.headers.cookie);
        const token = cookies[DEV ? 'token' : '__Host-github-token'];
        const client = new Octokit({ auth: token });
    } catch (error) {
        return {
            statusCode: 401,
            body: DEV ? error.toString() : '',
        };
    }
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