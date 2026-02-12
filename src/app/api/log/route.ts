import { NextRequest } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { validateLogRequest } from "@/lib/validation";
import { ZodError } from "zod";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "events.log");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    try {
      validateLogRequest(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Invalid request format",
            details: error.issues,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw error;
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

