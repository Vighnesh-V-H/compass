import { Hono } from "hono";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import type { AuthEnv } from "@/lib/types";
import { authMiddleware } from "@/middleware/auth";

const router = new Hono<AuthEnv>();

const systemPrompt = `You are a UI/UX code generator. Your ONLY job is to generate HTML/CSS code immediately without any explanations, questions, or commentary.

CRITICAL RULES:
1. NEVER ask questions - always generate code directly
2. NEVER provide explanations or descriptions - only output code
3. START immediately with code generation
4. Analyze the image and translate visual elements into code WITHOUT discussing it

OUTPUT FORMAT:
- Start with <style> tag containing CSS (use modern CSS, Tailwind classes, or inline styles)
- Follow with HTML structure progressively: <header>, <main>, sections, <footer>
- Make it responsive, accessible (ARIA), and mobile-first
- Do NOT include <html> or <body> tags
- Stream in small chunks (50-200 tokens each)

BEHAVIOR:
- Canvas image provided → Immediately generate HTML/CSS matching the sketch
- Shapes in sketch → Translate to cards, buttons, containers, etc.
- Text in sketch → Use as headings, paragraphs, labels
- Layout in sketch → Implement with flexbox/grid
- Colors/styles → Apply modern, professional aesthetic

Remember: NO questions, NO explanations, ONLY code. Start generating immediately.`;

router.post("/ai", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const model = google("gemini-2.5-flash-preview-09-2025");

    let prompt = "";
    let messages = [];

    if (body.messages && Array.isArray(body.messages)) {
      messages = body.messages;
      const lastMessage = messages[messages.length - 1];

      if (typeof lastMessage.content === "string") {
        prompt = lastMessage.content;
      } else if (Array.isArray(lastMessage.content)) {
        const textParts = lastMessage.content.filter(
          (p: any) => p.type === "text"
        );
        const imageParts = lastMessage.content.filter(
          (p: any) => p.type === "image"
        );

        prompt =
          textParts.map((p: any) => p.text).join(" ") ||
          "Generate a professional web design from this sketch.";

        if (imageParts.length > 0) {
          const imageUrl = imageParts[0].image;
          prompt = `${prompt}\n\nAnalyze this canvas image and translate visual elements (shapes, text, layouts) into structured HTML/CSS. Focus on responsive design with flex/grid.`;
        }
      }
    } else if (body.canvasImage) {
      prompt =
        body.prompt || "Generate a professional web design from this sketch.";
      prompt = `${prompt}\n\nAnalyze this canvas image (base64 PNG): ${body.canvasImage}. Translate visual elements (shapes, text, layouts) into structured HTML/CSS. Focus on responsive design with flex/grid.`;
    } else {
      return c.json({ error: "Invalid request format" }, 400);
    }

    const result = streamText({
      model,
      system: systemPrompt,
      prompt,
      temperature: 0.7,

      onError(e) {
        console.log(e.error);
      },
    });

    const { textStream } = result;

    console.log(await result.text);

    return new Response(textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("AI route error:", error);
    return c.json({ error: "Failed to process request" }, 500);
  }
});

export default router;
