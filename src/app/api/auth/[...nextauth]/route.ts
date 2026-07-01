import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

const { GET: AuthGET, POST } = handlers;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  // Auth.js v5 enforces OAuth 2.0 strictly and requires a 'code' parameter in the callback.
  // Steam uses OpenID 2.0 which doesn't return a code. We inject a dummy code here to bypass 
  // the 'OperationProcessingError: no authorization code in callbackParameters' error.
  if (url.pathname === "/api/auth/callback/steam" && !url.searchParams.has("code")) {
    url.searchParams.set("code", "steam");
    req = new NextRequest(url, req);
  }
  return AuthGET(req);
}

export { POST };
