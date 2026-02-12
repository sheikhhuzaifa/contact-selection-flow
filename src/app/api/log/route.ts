import { NextRequest } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "events.log");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation - only check action field exists and is valid
    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid request format",
          message: "Request body must be an object",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate action field
    if (!body.action || !["create", "update", "submit"].includes(body.action)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid request format",
          message: "Action must be 'create', 'update', or 'submit'",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await mkdir(LOG_DIR, { recursive: true });

    const entry = {
      timestamp: new Date().toISOString(),
      ...body,
    };

    await appendFile(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to write log", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Failed to write log entry",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

