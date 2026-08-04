export default {
  async fetch(request, env) {

    // Handle CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    try {

      const { messages, web_search } = await request.json();

      const body = {
        model: "gpt-5.5",
        messages,
        temperature: 0.7
      };

      // Optional Web Search
      if (web_search) {
        body.tools = [
          {
            type: "web_search_preview"
          }
        ];
      }

      const openAIResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const data = await openAIResponse.json();

      const reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      return new Response(
        JSON.stringify({
          reply
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );

    } catch (error) {

      return new Response(
        JSON.stringify({
          error: error.message
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );

    }

  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
