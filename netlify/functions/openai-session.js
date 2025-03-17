exports.handler = async function(request) {
    const DEV = process.env.NETLIFY_DEV === 'true';
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini-realtime-preview-2024-12-17",
            modalities: ["text"],
        }),
    });

    // Return a JSON object with the structured content and the original document text
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: await r.text(),
    };
};
