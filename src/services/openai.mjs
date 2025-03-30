import { getUid } from "./helpers.mjs";

const createSession = async () => {
    // Get an ephemeral key from your server - see server code below
    const tokenResponse = await fetch("/api/openai-session");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;
    
    // Create a peer connection
    const pc = new RTCPeerConnection();
    
    // Set up a no-op ontrack handler
    pc.ontrack = () => { /* No-op: intentionally ignoring audio tracks */ };
    
    // Create and add a fake audio track instead of requesting microphone access
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    const fakeAudioTrack = dst.stream.getAudioTracks()[0];
    oscillator.start();
    pc.addTrack(fakeAudioTrack);
    
    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    dc.addEventListener("message", (e) => {
        // Realtime server events appear here!
        // console.log(e);
    });
    
    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-mini-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            "Content-Type": "application/sdp"
        },
    });
    
    const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);
    if (dc.readyState !== "open") {
        await new Promise(resolve => dc.addEventListener("open", resolve));
    }
    return dc;
}

/** @type {RTCDataChannel | null} */
let session = null;
export const getSession = async () => {
    if (session === null || !session.readyState.includes("open")) {
        session = await createSession();
    }
    return session;
}

export const promptAI = async (promptConfiguration) => {
    const session = await getSession();
    const request_id = getUid();
    let resolver = null;
    let rejecter = null;
    const promise = new Promise((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
    });
    const messageHandler = (event) => {
        const isDoneMessage = event.data.includes("response.done") && event.data.includes(request_id);
        const isPotentialErrorMessage = event.data.includes("error");
        // if (event.data.includes(request_id)) {
        //     console.log(event, isDoneMessage, isPotentialErrorMessage);
        // }
        // We need to keep listening and we don't want to react
        if (!isDoneMessage && !isPotentialErrorMessage) return;
        // Either of these message types means we need to stop listening and resolve the promise
        const data = JSON.parse(event.data);
        const { type } = data;
        if (type === "response.done") {
            resolver(data.response);
        } else if (type === "error") {
            rejecter(new Error(event.data));
        } else {
            // We must have hit a false positive, return late so we don't remove the event listener
            return;
        }
        session.removeEventListener("message", messageHandler);
    };
    session.addEventListener("message", messageHandler);
    const responseCreate = {
        type: "response.create",
        response: {
            ...promptConfiguration,
            metadata: Object.assign({}, promptConfiguration.metadata, { request_id }),
        }
    };
    session.send(JSON.stringify(responseCreate));
    return promise;
}

export const getWalkData = async (content) => {
    const fakeFunctionName = "process_walks";
    const response = await promptAI({
        conversation: "none",
        modalities: ["text"],
        input: [
            {
                type: "message",
                role: "system",
                content: [{
                    type: "input_text",
                    text: `You are a helpful assistant that extracts structures the text content of a walk and passess it on for processing.`
                }],
            },
            {
                type: "message",
                role: "user",
                content: [{
                    type: "input_text",
                    text: content
                }],
            }
        ],
        tools: [{
            "type": "function",
            "name": fakeFunctionName,
            "description": "Takes the extracted walk details for processing.",
            "parameters": {
                type: "object",
                properties: {
                    walks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                series: {
                                    type: "string",
                                    description: 'The overarching ramble name, often formatted as "{place} to {place}", sometimes suffixed with "Robust Ramble". May be left blank.'
                                },
                                title: {
                                    type: "string",
                                    description: 'The name of this specific part of the ramble. Often simply formatted as "Section x (out)" or "Section x (return)", but could vary.'
                                },
                                subtitle: {
                                    type: "string",
                                    description: 'A brief naming of the start and destination of this specific part of the ramble, pfen formatted as "{place} to {place}", but will always follow the title rather than proceed it.'
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
                                content: {
                                    type: "string",
                                    description: 'The main content of the walk. Retain all formatting and line breaks.'
                                }
                            },
                            required: ["series", "title", "subtitle", "details", "content"],
                            additionalProperties: false
                        },
                        additionalProperties: false
                    }
                },
            }
        }],
        tool_choice: "required"           
    });
    console.debug(response);
    const fakeFunctionCall = response.output.find(({ type, name }) => type === "function_call" && name === fakeFunctionName);
    if (!fakeFunctionCall) {
        throw new Error("Structured output not found");
    }
    let walks = [];
    try {
        ({ walks } = JSON.parse(fakeFunctionCall.arguments));
    } catch (error) {
        console.debug(error, { fakeFunctionCall, response})
        throw error;
    }
    return walks;
}
    
    