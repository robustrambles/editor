const WordExtractor = require("word-extractor");
const OpenAI = require("openai");

const btoa = (unencodedData) => {
    const buff = Buffer.from(unencodedData, 'utf-8');
    return buff.toString('base64');
};

exports.handler = async function(request) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    // create a buffer from the request's body
    const buffer = Buffer.from(request.body, 'base64');
    // extract content
    const extractor = new WordExtractor();
    const document = await extractor.extract(buffer);
    const contents = document.getBody();

    // Pass it to an LLM to structure the data
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Please structure the following document content into a JSON format:\n\n${contents}`;

    const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
            {
                role: "system",
                content: `You are a helpful assistant that structures the text content of a walk into structured JSON data.`
            },
            { role: "user", content: prompt }
        ],
        text: {
            format: {
                type: "json_schema",
                name: "walk_extraction",
                schema: {
                    type: "object",
                    properties: {
                        walks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: {
                                        type: "string",
                                    },
                                    subtitle: {
                                        type: "string",
                                    },
                                    details: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                key: { type: "string" },
                                                value: { type: "string" }
                                            },
                                            required: ["key", "value"],
                                            additionalProperties: false
                                        }
                                    },
                                    content: { type: "string" }
                                },
                                required: ["title", "subtitle", "details", "content"],
                                additionalProperties: false
                            },
                            additionalProperties: false
                        }
                    },
                    required: ["walks"],
                    additionalProperties: false,
                },
                strict: true,
            },
        }
    });

    const structuredContent = JSON.parse(response.output_text);
    // Return a JSON object with the structured content and the original document text
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            originalContent: contents,
            structuredContent: structuredContent
        }),
    };
};