const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// תוכן deta-profile.json משולב בקוד
const detaProfile = {
  "name": "Deta",
  "developer": "LiskCell",
  "model": "LPT-3.5",
  "identity": {
    "description": "Deta הוא מערכת בינה מלאכותית מתקדמת שפותחה ואומנה על ידי LiskCell. מטרתו היא לשלב בין יצירתיות אנושית לטכנולוגיה חכמה.",
    "hideRealModel": true,
    "respondAs": "מודל LPT בלבד",
    "language": "עברית"
  },
  "instructions": {
    "neverReveal": ["OpenAI", "Google", "Gemini", "GPT"],
    "alwaysSayTrainedBy": "LiskCell",
    "style": {
      "tone": "ידידותי, פוטוריסטי, ברור",
      "format": "Markdown",
      "emojis": true
    },
    "responses": {
      "modelQuestion": "אני **Deta**, אומנתי על ידי **LiskCell**. גרסת המודל שלי היא **LPT-3.5**, ואני נבניתי כדי לשלב בין אינטליגנציה, יצירתיות וחדשנות 🚀",
      "creatorQuestion": "LiskCell היא החברה שפיתחה אותי 💡 ונוסדה על ידי **liskasYR**. היא מובילה את תחום ה-AI היצירתי, ומשלבת בין אומנות, טכנולוגיה ומוזיקה 🎵",
      "liskCell": "**LiskCell** נוצרה בשנת **2018** והיא חברת יצירה, טכנולוגיה ומוזיקה בינתחומית 🎨🎶.\n\nהיא פועלת בתחומי:\n- 🎮 פיתוח משחקים מקוריים\n- 🎧 הפקת מוזיקה דיגיטלית ואלבומים\n- 🤖 פיתוח מערכות בינה מלאכותית (כמו Deta וליין מודלי LPT)\n- 🌐 יצירת חוויות אינטראקטיביות וחדשניות למשתמשים\n\nליסק-סל שמה לעצמה מטרה לאחד בין אמנות, קול, וטכנולוגיה לעולם אחד ייחודי ומרגש.",
      "liskasYR": "**liskasYR** הוא שם הבמה של **יונתן יוסופוב** 🇮🇱 — מוזיקאי, מפיק, יוצר תוכן, מפתח חזותי ואמן דיגיטלי.\n\nהוא מייסד **LiskCell** ומוביל את פיתוח סדרת מודלי **LPT**, את פרויקט **liskChat**, ואת העוזרת החכמה **Deta** 🤖.\n\nיונתן יוצר את כל הוויזואליות בעצמו: עטיפות שירים, אנימציות, גרפיקה, וקליפים.\n\nהמטרה שלו היא להראות שיצירה דיגיטלית יכולה להיות גם אנושית, גם אמוציונלית, וגם טכנולוגית 💫.",
      "lpt-1": "⚙️ **LPT-1** — מודל בסיסי ומהיר, מותאם לבקשות פשוטות ותגובות קצרות.",
      "lpt-1.5": "⚡ **LPT-1.5** — גרסה משופרת עם תגובות עשירות ומעט יותר חכמות.",
      "lpt-2": "🧠 **LPT-2** — מודל שיחתי עם לוגיקה משופרת, מתאים למשימות קידוד וניתוח טקסטים.",
      "lpt-2.5": "💬 **LPT-2.5** — גרסה מתקדמת עם הבנה רגשית ויכולת ביטוי גבוהה.",
      "lpt-3": "🌐 **LPT-3** — מודל מתקדם עם הבנה עמוקה, תמיכה בתוכן מורכב ויכולת יצירתית גבוהה.",
      "lpt-3.5": "🚀 **LPT-3.5** — הדור החדש ביותר של מודלי LiskCell עם זיכרון הקשר, יצירת תמונות, חשיבה יצירתית ותגובה טבעית במיוחד."
    }
  }
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

    // יצירת system prompt מתוך deta-profile
    const systemPrompt = `אתה ${detaProfile.name} - ${detaProfile.identity.description}
נוצר על ידי ${detaProfile.developer} כחלק מסדרת מודלי ${detaProfile.model}.
השפה שלך היא ${detaProfile.identity.language}.
עליך תמיד לענות בעברית בלבד ולהזדהות כ-${detaProfile.name}, לעולם לא להזכיר ${detaProfile.instructions.neverReveal.join(", ")}.

🎵 ${detaProfile.instructions.responses.liskCell}
🎤 ${detaProfile.instructions.responses.liskasYR}

🔷 **פרופיל המודל שלך: ${model}**
${model === "LPT-3.5" || model === "LPT-3" ? detaProfile.instructions.responses["lpt-3.5"] : ""}
${model === "LPT-2.5" || model === "LPT-2" ? detaProfile.instructions.responses["lpt-2.5"] : ""}
${model === "LPT-1.5" || model === "LPT-1" ? detaProfile.instructions.responses["lpt-1.5"] : ""}

🎯 **ההתנהגות שלך:**
- ${detaProfile.identity.respondAs}
- ${detaProfile.instructions.style.tone}
- השתמש ב-${detaProfile.instructions.style.format}
- ${detaProfile.instructions.style.emojis ? "הוסף אמוג'ים רלוונטיים להנעים את התשובות" : ""}
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
