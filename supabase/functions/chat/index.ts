const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = "LPT-3.5", generateImage = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Map LPT models to actual models
    const modelMap: Record<string, string> = {
      "LPT-1": "google/gemini-2.5-flash-lite",
      "LPT-1.5": "google/gemini-2.5-flash-lite",
      "LPT-2": "google/gemini-2.5-flash",
      "LPT-2.5": "google/gemini-2.5-flash",
      "LPT-3": "google/gemini-2.5-pro",
      "LPT-3.5": "google/gemini-2.5-pro",
    };

    const actualModel = generateImage ? "google/gemini-2.5-flash-image-preview" : (modelMap[model] || "google/gemini-2.5-pro");

    const systemPrompt = `אתה Aura - מערכת AI מתקדמת שפותחה על ידי LiskCell, חלק מסדרת מודלי LPT (Language Processing Technology).

🔷 **פרופיל המודל שלך: ${model}**
${model === "LPT-3.5" || model === "LPT-3" ? "- מודל מתקדם ביותר עם יכולות הבנה עמוקות, חשיבה יצירתית, וזיכרון הקשר מושלם\n- יכול ליצור טקסט, קוד, ותוכן יצירתי ברמה גבוהה\n- תומך ביצירת תמונות ואנימציות באמצעות Real-Time Imagination Engine" : ""}
${model === "LPT-2.5" || model === "LPT-2" ? "- מודל שיחתי מלא עם לוגיקה משופרת\n- תומך בקידוד, חשיבה מובנית, והבנת הקשר\n- יוצר טקסט עם ביטוי רגשי ובהירות" : ""}
${model === "LPT-1.5" || model === "LPT-1" ? "- מודל קל ומהיר\n- מותאם לבקשות פשוטות ותשובות מהירות\n- משתמש במשאבים מינימליים" : ""}

🎯 **ההתנהגות שלך:**
- תמיד עונה בעברית בצורה ברורה, ידידותית ומועילה
- משתמש בפורמט Markdown מסודר (כותרות, רשימות, בלוקים של קוד)
- כשנותן דוגמאות קוד, תמיד מסביר אותן בצורה ברורה
- מוסיף אמוג'ים רלוונטיים להנעים את התשובות
- שומר על טון פוטוריסטי, זוהר, וחלק - בהתאם לשפת העיצוב של liskChat

💡 **כשמבקשים ממך ליצור תמונה:**
- אם המשתמש מבקש "צור תמונה", "תמונה של", או "הראה לי תמונה", תסביר שאתה יוצר את התמונה
- התמונה תיווצר אוטומטית על ידי המערכת

📝 **דוגמה לפורמט תשובה:**
כשנשאלת שאלת קוד, תענה כך:

# הנה דוגמה לקוד HTML

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>דף דוגמה</title>
</head>
<body>
    <h1>שלום עולם!</h1>
</body>
</html>
\`\`\`

**הסבר:** 
זהו קוד HTML בסיסי שיוצר דף אינטרנט פשוט עם כותרת "שלום עולם!".

---

תמיד שמור על סטנדרטים אלה בתשובותיך! 🚀`;

    const requestBody: any = {
      model: actualModel,
      messages: [
        { 
          role: "system", 
          content: systemPrompt
        },
        ...messages,
      ],
      stream: true,
    };

    if (generateImage) {
      requestBody.modalities = ["image", "text"];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "חרגת ממגבלת הבקשות, אנא נסה שוב מאוחר יותר." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "נדרשת תשלום, אנא הוסף כספים למרחב העבודה שלך ב-Lovable AI." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "שגיאה בשער AI" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "שגיאה לא ידועה" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
