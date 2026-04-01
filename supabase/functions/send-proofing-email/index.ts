import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const PHOTOGRAPHER_EMAIL = Deno.env.get("PHOTOGRAPHER_EMAIL") || "uday@urstudios.com";
const APP_URL = Deno.env.get("APP_URL") || "https://urstudios.com";

type NotificationType = 
  | "proofing_ready"        // Album set to proofing - notify client
  | "selections_submitted"   // Client submitted selections - notify admin
  | "selections_approved"    // Admin approved - notify client
  | "changes_requested"      // Admin requested changes - notify client
  | "reminder_no_selection"; // 7 days no selection - notify client

interface ProofingPayload {
  type: NotificationType;
  album_id: string;
  album_title: string;
  client_email: string;
  client_name: string;
  selection_count?: number;
  feedback?: string;
}

const emailTemplates: Record<NotificationType, (data: ProofingPayload) => { subject: string; html: string }> = {
  proofing_ready: (data) => ({
    subject: `Your photos are ready for review — ${data.album_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#333;">Your Photos Are Ready! 📸</h2>
        <p>Hi ${data.client_name},</p>
        <p>Great news! Your photos from <strong>${data.album_title}</strong> are ready for you to review and select your favorites.</p>
        <div style="margin:30px 0;">
          <a href="${APP_URL}/portal/gallery" style="background:#ec4899;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">
            View & Select Photos
          </a>
        </div>
        <p>Simply click the heart icon on each photo you love. Take your time — there's no rush!</p>
        <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#666;font-size:14px;">— UR Studios</p>
      </div>
    `,
  }),
  
  selections_submitted: (data) => ({
    subject: `Client selections submitted — ${data.album_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#333;">New Selection Submission 🎉</h2>
        <p><strong>${data.client_name}</strong> has submitted their photo selections for:</p>
        <div style="background:#f8f8f8;padding:20px;border-radius:8px;margin:20px 0;">
          <h3 style="margin:0 0 10px 0;">${data.album_title}</h3>
          <p style="margin:0;color:#666;">${data.selection_count} photos selected</p>
        </div>
        <div style="margin:30px 0;">
          <a href="${APP_URL}/admin/proofing" style="background:#ec4899;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">
            Review Selections
          </a>
        </div>
        <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#666;font-size:14px;">Client email: ${data.client_email}</p>
      </div>
    `,
  }),
  
  selections_approved: (data) => ({
    subject: `Your selections have been approved — ${data.album_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#333;">Selections Approved! ✅</h2>
        <p>Hi ${data.client_name},</p>
        <p>Great news! Your photo selections for <strong>${data.album_title}</strong> have been approved.</p>
        <div style="background:#ecfdf5;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #10b981;">
          <p style="margin:0;color:#065f46;">We'll now begin working on your final images. You'll receive another notification when they're ready!</p>
        </div>
        ${data.feedback ? `<p><strong>Note from your photographer:</strong><br/>${data.feedback}</p>` : ''}
        <div style="margin:30px 0;">
          <a href="${APP_URL}/portal/gallery" style="background:#ec4899;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">
            View Your Gallery
          </a>
        </div>
        <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#666;font-size:14px;">— UR Studios</p>
      </div>
    `,
  }),
  
  changes_requested: (data) => ({
    subject: `Please review your selections — ${data.album_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#333;">Quick Update Needed 📝</h2>
        <p>Hi ${data.client_name},</p>
        <p>Your photographer has reviewed your selections for <strong>${data.album_title}</strong> and has some feedback:</p>
        <div style="background:#fef3c7;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #f59e0b;">
          <p style="margin:0;color:#92400e;">${data.feedback}</p>
        </div>
        <p>Please take a moment to update your selections based on this feedback.</p>
        <div style="margin:30px 0;">
          <a href="${APP_URL}/portal/gallery" style="background:#ec4899;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">
            Update Selections
          </a>
        </div>
        <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#666;font-size:14px;">— UR Studios</p>
      </div>
    `,
  }),
  
  reminder_no_selection: (data) => ({
    subject: `Don't forget to select your favorites — ${data.album_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#333;">Your Photos Are Waiting! 💫</h2>
        <p>Hi ${data.client_name},</p>
        <p>Just a friendly reminder that your photos from <strong>${data.album_title}</strong> are ready for you to review.</p>
        <p>We'd love to know which ones are your favorites so we can get started on your final images!</p>
        <div style="margin:30px 0;">
          <a href="${APP_URL}/portal/gallery" style="background:#ec4899;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">
            Select Your Favorites
          </a>
        </div>
        <p style="color:#666;">If you have any questions or need more time, just reply to this email.</p>
        <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#666;font-size:14px;">— UR Studios</p>
      </div>
    `,
  }),
};

Deno.serve(async (req) => {
  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const payload: ProofingPayload = await req.json();
    const template = emailTemplates[payload.type];
    
    if (!template) {
      throw new Error(`Unknown notification type: ${payload.type}`);
    }
    
    const { subject, html } = template(payload);
    
    // Determine recipient based on notification type
    const isAdminNotification = payload.type === "selections_submitted";
    const to = isAdminNotification ? PHOTOGRAPHER_EMAIL : payload.client_email;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UR Studios <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Email send failed:", err);
      throw new Error(`Email send failed: ${err}`);
    }

    const result = await res.json();
    
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
