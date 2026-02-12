import { NextRequest } from "next/server";
import { appendFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

// Determine the log directory based on environment
// In serverless environments (Vercel, AWS Lambda), use /tmp
// In local development, use project root logs directory
function getLogDirectory(): string {
  // Check if we're in a serverless environment
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  if (isServerless) {
    // Use /tmp in serverless environments (writable)
    return "/tmp/logs";
  }
  
  // Use project root in local development
  return path.join(process.cwd(), "logs");
}

const LOG_DIR = getLogDirectory();
const LOG_FILE = path.join(LOG_DIR, "events.log");

export async function POST(req: NextRequest) {
  let body;
  
  try {
    // Parse request body with error handling
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid JSON in request body",
          message: parseError instanceof Error ? parseError.message : "Failed to parse request",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    // Create log entry object
    const entry = {
      timestamp: new Date().toISOString(),
      ...body,
    };

    // Ensure logs directory exists and is writable
    try {
      await mkdir(LOG_DIR, { recursive: true });
      // Verify we can write to the directory
      await access(LOG_DIR, constants.W_OK);
    } catch (dirError) {
      console.error("Failed to create or access logs directory:", dirError);
      console.error("Log directory path:", LOG_DIR);
      console.error("Current working directory:", process.cwd());
      console.error("Environment:", {
        VERCEL: process.env.VERCEL,
        AWS_LAMBDA: process.env.AWS_LAMBDA_FUNCTION_NAME,
      });
      
      // In serverless environments, if /tmp fails, we can't log to disk
      // Return success but log to console instead
      if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        console.log("Log entry (serverless - console only):", JSON.stringify(entry));
        return new Response(JSON.stringify({ ok: true, loggedToConsole: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`Failed to create logs directory: ${dirError instanceof Error ? dirError.message : "Unknown error"}`);
    }

    // Serialize entry to JSON with error handling for circular references
    let serializedEntry: string;
    try {
      serializedEntry = JSON.stringify(entry);
    } catch (stringifyError) {
      console.error("Failed to stringify entry:", stringifyError);
      // Try to stringify without circular references
      try {
        serializedEntry = JSON.stringify(entry, null, 2);
      } catch {
        throw new Error("Failed to serialize entry to JSON - possible circular reference");
      }
    }

    // Write to log file with error handling
    try {
      await appendFile(LOG_FILE, serializedEntry + "\n", "utf8");
    } catch (writeError) {
      console.error("Failed to write to log file:", writeError);
      const writeErrorMessage = writeError instanceof Error ? writeError.message : "Unknown error";
      console.error("Write error details:", {
        error: writeErrorMessage,
        logFile: LOG_FILE,
        logDir: LOG_DIR,
      });
      
      // If it's a read-only filesystem error in serverless, log to console instead
      if (writeErrorMessage.includes("EROFS") || writeErrorMessage.includes("read-only")) {
        console.log("Log entry (read-only filesystem - console only):", serializedEntry);
        return new Response(JSON.stringify({ ok: true, loggedToConsole: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`Failed to write log file: ${writeErrorMessage}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to process log request:", error);
    console.error("Request body:", body);
    
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

