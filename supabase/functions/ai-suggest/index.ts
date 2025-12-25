import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('API key not configured');
    }

    console.log('Processing AI suggestion request:', query);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${LOVABLE_API_KEY}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are a campus room booking assistant. Based on user requests, suggest optimal room slots. Always respond with a JSON array of exactly 3 suggestions with format: [{"room": "Room Name", "time": "Day, Time Range", "reason": "Brief explanation"}]` 
          },
          { role: "user", content: query }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    console.log('AI response:', content);
    
    // Parse JSON from response
    let suggestions = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) suggestions = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.log('Failed to parse AI response, using fallback suggestions');
      suggestions = [
        { room: "Study Room A", time: "Tomorrow, 2:00 PM - 4:00 PM", reason: "Quiet environment perfect for focused work" },
        { room: "Conference Room B", time: "Tomorrow, 10:00 AM - 12:00 PM", reason: "Good capacity for group meetings" },
        { room: "Lab 101", time: "Tomorrow, 3:00 PM - 5:00 PM", reason: "Available equipment for technical work" }
      ];
    }

    return new Response(JSON.stringify({ suggestions }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Error in ai-suggest function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
