const WordExtractor = require("word-extractor"); 

const btoa = (unencodedData) => {
    const buff = Buffer.from(unencodedData, 'utf-8');
    return buff.toString('base64');
};

exports.handler = async function(...args) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    return {
        statusCode: 200,
        body: JSON.stringify(args),
    };
    const extractor = new WordExtractor();
    const buffer = await event.arrayBuffer();
    const document = await extractor.extract(buffer);
    
    return {
        statusCode: 200,
        body: document.getBody(),
    };
};