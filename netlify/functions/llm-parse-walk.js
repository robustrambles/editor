const WordExtractor = require("word-extractor"); 

const btoa = (unencodedData) => {
    const buff = Buffer.from(unencodedData, 'utf-8');
    return buff.toString('base64');
};

exports.handler = async function(request) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    // create a buffer from the request's body
    const buffer = Buffer.from(request.body, 'base64');
    const extractor = new WordExtractor();
    const document = await extractor.extract(buffer);
    
    return {
        statusCode: 200,
        body: document.getBody(),
    };
};