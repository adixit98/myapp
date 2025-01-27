import { getEdgeRuntimeResponse } from "@assistant-ui/react/edge";

export const maxDuration = 30;

export const POST = async (request: Request) => {
  const requestData = await request.json();

  try {
    // Extract input text from the request
    const inputText = requestData.input || "Default input text";
    console.log("Payload sent to backend API:", JSON.stringify({ input: inputText }));

    // Call the backend API
    const backendResponse = await fetch("http://127.0.0.1:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: inputText,
      }),
    });

    if (!backendResponse.ok) {
      const errorDetails = await backendResponse.text();
      console.error(`Backend API error details: ${errorDetails}`);
      throw new Error(`Backend API request failed with status ${backendResponse.status}`);
    }

    // Parse backend response
    const backendData = await backendResponse.json();
    console.log("************Parsed backend response:", backendData);

    // Ensure backendData.output is a string
    const backendOutput = backendData.output || "No response from backend";

    // Prepare the messages array (content as objects with text property)
    const messages = 
      [
      { role: "user", content: [{ text: inputText }] },
      { role: "assistant", content: [{ text: backendOutput }] }
    ]
  ;

    console.log("Messages sent to getEdgeRuntimeResponse:", JSON.stringify(messages, null, 2));

    // Return the response to the Assistant UI
    return getEdgeRuntimeResponse({
      options: {
        model: "gpt-4o", // Model is still required for compatibility
      },
      requestData: {
        messages, // Use the dynamically created messages
      },
      abortSignal: request.signal,
    });
  } catch (error) {
    console.error("Error interacting with the backend API:", error);

    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500 }
    );
  }
};
