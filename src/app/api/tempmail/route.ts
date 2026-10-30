import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    if (action === "create") {
      // 1. Get active domains
      const domainRes = await fetch("https://api.mail.tm/domains", {
        headers: { "Accept": "application/json" },
        cache: "no-store",
      });
      if (!domainRes.ok) {
        throw new Error(`Failed to fetch domains: ${domainRes.statusText}`);
      }
      const domainData = await domainRes.json();
      const domains = Array.isArray(domainData) ? domainData : (domainData["hydra:member"] || []);
      if (!domains.length) {
        throw new Error("No mail.tm domains available right now");
      }
      const chosenDomain = domains[0].domain;
      const randStr = Math.random().toString(36).substring(2, 9);
      const address = `pro_${randStr}@${chosenDomain}`;
      const password = `ProChange_${Math.random().toString(36).slice(2)}!A1`;

      // 2. Create account
      const createRes = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ address, password }),
      });
      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Account creation failed: ${errText}`);
      }
      const accountData = await createRes.json();

      // 3. Get authentication token
      const tokenRes = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ address, password }),
      });
      if (!tokenRes.ok) {
        throw new Error("Failed to authenticate new mailbox");
      }
      const tokenData = await tokenRes.json();

      return NextResponse.json({
        success: true,
        address: accountData.address,
        id: accountData.id,
        token: tokenData.token,
        createdAt: new Date().toISOString(),
      });
    }

    if (action === "messages") {
      const token = searchParams.get("token");
      if (!token) {
        return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
      }

      const res = await fetch("https://api.mail.tm/messages", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) {
        return NextResponse.json({ success: false, error: `Error ${res.status}: ${res.statusText}` }, { status: res.status });
      }
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data["hydra:member"] || []);
      const messages = rawList.map((m: any) => ({
        id: m.id,
        from: m.from?.address || m.from?.name || "Unknown Sender",
        subject: m.subject || "(No Subject)",
        intro: m.intro || "",
        createdAt: m.createdAt,
        seen: m.seen,
      }));

      return NextResponse.json({
        success: true,
        total: messages.length,
        messages,
      });
    }

    if (action === "message") {
      const token = searchParams.get("token");
      const id = searchParams.get("id");
      if (!token || !id) {
        return NextResponse.json({ success: false, error: "Missing token or message ID" }, { status: 400 });
      }

      const res = await fetch(`https://api.mail.tm/messages/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) {
        return NextResponse.json({ success: false, error: `Error ${res.status}: ${res.statusText}` }, { status: res.status });
      }
      const data = await res.json();

      // Extract OTP if present in subject or text
      const fullContent = `${data.subject || ""} ${data.intro || ""} ${data.text || ""}`;
      const otpMatch = fullContent.match(/\b([0-9]{4,8})\b/);
      const extractedOtp = otpMatch ? otpMatch[1] : null;

      return NextResponse.json({
        success: true,
        id: data.id,
        from: data.from?.address || data.from?.name || "Unknown Sender",
        subject: data.subject || "(No Subject)",
        text: data.text || "",
        html: Array.isArray(data.html) ? data.html.join("") : (data.html || ""),
        createdAt: data.createdAt,
        otp: extractedOtp,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process temp mail request" },
      { status: 500 }
    );
  }
}
