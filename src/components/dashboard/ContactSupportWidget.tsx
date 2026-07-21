"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CheckCircle2, Headphones, Loader2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { APP_SUPPORT_NAME, FREE_TRAINING_URL, SUPPORT_EMAIL } from "@/lib/support";

type FormState = "idle" | "submitting" | "success" | "error";

const fieldClassName =
  "w-full min-w-0 rounded-xl border border-[#1e2128] bg-[#0B0C10]/80 px-3.5 py-3 text-sm text-[#E2E8F0] placeholder:text-[#6b7280] focus:border-[#45A29E] focus:outline-none focus:ring-2 focus:ring-[#45A29E]/20";

const labelClassName =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-[#9fb0b5]";

function openSupportMailto(email: string, message: string) {
  const subject = `${APP_SUPPORT_NAME} — Support Request`;
  const body = `Please reply to: ${email}\n\n${message}`;
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function finishWithMailto(
  email: string,
  message: string,
  setSubmittedEmail: (value: string) => void,
  setSentViaMailto: (value: boolean) => void,
  setFormState: (value: FormState) => void,
) {
  openSupportMailto(email, message);
  setSubmittedEmail(email);
  setSentViaMailto(true);
  setFormState("success");
}

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as { error?: string; useMailto?: boolean; success?: boolean };
  } catch {
    return null;
  }
}

export function ContactSupportWidget() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [sentViaMailto, setSentViaMailto] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setErrorMessage("");

      const trimmedEmail = email.trim();
      const trimmedMessage = message.trim();

      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setErrorMessage("Please enter a valid email address.");
        setFormState("error");
        return;
      }

      if (trimmedMessage.length < 10) {
        setErrorMessage("Please add a bit more detail so we can help you.");
        setFormState("error");
        return;
      }

      setFormState("submitting");

      try {
        const res = await fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ email: trimmedEmail, message: trimmedMessage }),
        });

        const data = await parseJsonResponse(res);

        if (data === null) {
          finishWithMailto(trimmedEmail, trimmedMessage, setSubmittedEmail, setSentViaMailto, setFormState);
          return;
        }

        if (res.status === 401) {
          throw new Error("Your session expired. Please refresh the page and try again.");
        }

        if (res.ok && data.success) {
          setSubmittedEmail(trimmedEmail);
          setSentViaMailto(false);
          setFormState("success");
          return;
        }

        if (data.useMailto) {
          finishWithMailto(trimmedEmail, trimmedMessage, setSubmittedEmail, setSentViaMailto, setFormState);
          return;
        }

        throw new Error(data.error || "Something went wrong. Please try again.");
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
        setFormState("error");
      }
    },
    [email, message],
  );

  const resetForm = () => {
    setFormState("idle");
    setMessage("");
    setSentViaMailto(false);
    setErrorMessage("");
  };

  if (formState === "success") {
    return (
      <div className="card-base min-w-0 overflow-hidden border-[#45A29E]/25 p-5 space-y-5">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="ds-h3">{sentViaMailto ? "Check your email app" : "Message sent"}</h3>
          <p className="mt-3 w-full text-sm leading-relaxed text-[#9fb0b5]">
            {sentViaMailto ? (
              <>
                Your email app should open with your message ready to send. Tap{" "}
                <span className="font-semibold text-[#E2E8F0]">Send</span> to deliver it — then
                we&apos;ll reply to{" "}
                <span className="break-all font-semibold text-[#E2E8F0]">{submittedEmail}</span>. We
                usually respond within about 2 hours — during busy periods, please allow 24–48
                hours.
              </>
            ) : (
              <>
                We&apos;ll reply to{" "}
                <span className="break-all font-semibold text-[#E2E8F0]">{submittedEmail}</span>. We
                usually respond within about 2 hours — during busy periods, please allow 24–48
                hours.
              </>
            )}
          </p>
          <p className="mt-3 w-full text-sm leading-relaxed text-[#6b7280]">
            Remember: our reply will go to{" "}
            <span className="break-all font-semibold text-[#E2E8F0]">{submittedEmail}</span> only — not
            another inbox you may use elsewhere. If you don&apos;t see it within 48 hours, check
            that inbox&apos;s spam or junk folder.
          </p>
        </div>

        <div className="border-t border-[#1e2128] pt-5">
          <p className="text-sm leading-relaxed text-[#9fb0b5]">
            While you wait, start with our{" "}
            <span className="font-semibold text-[#D4AF37]">free training</span> — discover how to
            wake up with an extra{" "}
            <span className="font-semibold text-[#D4AF37]">$1,000–$5,000</span> in your account and
            scale to $1k–$5k per day without extra grind.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-red-400">
            Warning: This may be taken down soon
          </p>
          <a
            href={FREE_TRAINING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-xl bg-[#D4AF37] px-4 py-3 text-center text-xs font-black uppercase text-[#070D0D] shadow-lg transition-all hover:bg-[#e6c158]"
          >
            Watch The Free Training &gt;&gt;
          </a>
        </div>

        <button type="button" onClick={resetForm} className="btn-secondary w-full min-h-[44px]">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="card-base min-w-0 overflow-hidden border-[#45A29E]/25 p-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#45A29E]/25 bg-[#45A29E]/10">
          <Headphones className="text-[#45A29E]" size={22} />
        </div>
        <h3 className="ds-h3">Contact Support</h3>
      </div>

      <p className="text-sm leading-relaxed text-[#9fb0b5]">
        We usually reply within about 2 hours. Because of high email volume, please allow{" "}
        <span className="font-medium text-[#E2E8F0]">24–48 hours</span> during busy periods. Your
        answer will go to the email you enter below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="min-w-0">
          <label htmlFor="support-email" className={labelClassName}>
            Your email
          </label>
          <input
            id="support-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={formState === "submitting"}
            className={fieldClassName}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="support-message" className={labelClassName}>
            Your message
          </label>
          <textarea
            id="support-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you need help with..."
            required
            disabled={formState === "submitting"}
            rows={4}
            className={`${fieldClassName} min-h-[112px] resize-y`}
          />
        </div>

        {formState === "error" && errorMessage && (
          <p className="text-sm text-red-400">{errorMessage}</p>
        )}

        <p className="rounded-xl border border-[#1e2128] bg-[#0B0C10]/60 px-3.5 py-3 text-xs leading-relaxed text-[#6b7280]">
          <span className="font-semibold text-[#9fb0b5]">Please note:</span> We will reply to the
          email address you enter above. If you don&apos;t see our reply within 48 hours, check
          your spam or junk folder before reaching out again.
        </p>

        <button
          type="submit"
          disabled={formState === "submitting"}
          className="btn-primary w-full min-h-[48px]"
        >
          {formState === "submitting" ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </span>
          ) : (
            "Send message"
          )}
        </button>
      </form>

      <div className="rounded-xl border border-[#1e2128] bg-[#0B0C10]/60 px-4 py-3.5">
        <div className="flex min-w-0 items-start gap-3">
          <Mail className="mt-0.5 shrink-0 text-[#6b7280]" size={16} />
          <div className="min-w-0 space-y-1">
            <p className="text-xs leading-relaxed text-[#6b7280]">
              If the form doesn&apos;t work, email us directly:
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="block break-all text-sm font-semibold text-[#45A29E] hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
