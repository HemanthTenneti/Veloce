"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiArrowUpRight, FiCheck } from "react-icons/fi";
import gsap from "gsap";
import { z } from "zod";
import { API_BASE_URL } from "@/lib/vehicleApi";
import type { Vehicle } from "@/types/vehicle";

// Mirrors createLeadSchema from @veloce/shared — defined locally to avoid
// the .js re-export chain that Turbopack cannot resolve from raw TypeScript source.
const enquirySchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Minimum 7 characters"),
  vehicleProperties: z.string().min(1),
  message: z.string().min(1, "Required"),
});

interface EnquiryModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phone: "", message: "" };

export default function EnquiryModal({ vehicle, onClose }: EnquiryModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTlRef = useRef<gsap.core.Timeline | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Portal mount — avoids SSR mismatch
  useEffect(() => {
    setMounted(true);
    return () => { closeTlRef.current?.kill(); };
  }, []);

  // GSAP entry animation
  useEffect(() => {
    if (!mounted) return;
    if (vehicle) {
      // Reset form state when a new vehicle is opened
      setFormData(EMPTY_FORM);
      setErrors({});
      setIsSuccess(false);

      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(cardRef.current, { autoAlpha: 0, y: 24, scale: 0.97 });

      const tl = gsap.timeline();
      tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
      tl.to(
        cardRef.current,
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "expo.out" },
        "-=0.08",
      );

      return () => { tl.kill(); };
    }
  }, [vehicle, mounted]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (vehicle) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = previous; };
    }
  }, [vehicle]);

  // GSAP exit animation — stored in ref so re-triggers kill the in-flight tween,
  // and onComplete fires onClose only once per intentional close action.
  const handleClose = useCallback(() => {
    closeTlRef.current?.kill();
    closeTlRef.current = gsap.timeline({ onComplete: onClose });
    closeTlRef.current.to(cardRef.current, { autoAlpha: 0, y: 16, scale: 0.97, duration: 0.22, ease: "power2.in" });
    closeTlRef.current.to(overlayRef.current, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, "-=0.1");
  }, [onClose]);

  // Keyboard close
  useEffect(() => {
    if (!vehicle) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [vehicle, handleClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    const vehicleProperties = `${vehicle.color} ${vehicle.make} ${vehicle.model} ${vehicle.year}`;
    const payload = { ...formData, vehicleProperties };

    // Zod validation on the frontend
    const result = enquirySchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "form");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Submission failed");
      }
      setIsSuccess(true);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Submission failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !vehicle) return null;

  const vehicleLabel = `${vehicle.color} ${vehicle.make} ${vehicle.model} ${vehicle.year}`;

  return createPortal(
    <div
      ref={overlayRef}
      data-testid="enquiry-modal-overlay"
      className="fixed inset-0 z-[9000] flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(4, 5, 7, 0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        opacity: 0,
        visibility: "hidden",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        ref={cardRef}
        data-testid="enquiry-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Enquire about ${vehicleLabel}`}
        className="relative w-full max-w-[520px] overflow-hidden rounded-[32px] border"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-strong)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.04) inset",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          data-testid="enquiry-modal-close"
          className="absolute right-5 top-5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition-colors hover:text-white"
          aria-label="Close enquiry form"
        >
          <FiX size={14} />
        </button>

        <div className="px-5 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-8">
          {/* Header */}
          <div className="mb-7">
            <span className="font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color: "var(--veloce-red, #CC0000)" }}>
              PRIVATE ENQUIRY
            </span>
            <h2 className="mt-2 font-display text-2xl tracking-[-0.055em] leading-tight" style={{ color: "var(--text-primary)" }}>
              Reserve Your Interest
            </h2>
            <p className="mt-1.5 font-mono text-[10px] tracking-[0.16em] uppercase" style={{ color: "var(--text-muted)" }}>
              {vehicleLabel}
            </p>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(204,0,0,0.12)", border: "1px solid rgba(204,0,0,0.3)" }}
              >
                <FiCheck size={22} style={{ color: "#CC0000" }} />
              </div>
              <div>
                <p className="font-display text-xl tracking-tight" style={{ color: "var(--text-primary)" }}>
                  Enquiry received.
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.16em] uppercase" style={{ color: "var(--text-muted)" }}>
                  Our team will contact you shortly.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-4 luxury-button luxury-button--accent"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate data-testid="enquiry-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup
                  id="firstName"
                  label="First Name"
                  value={formData.firstName}
                  error={errors.firstName}
                  onChange={handleChange}
                  placeholder="James"
                />
                <FieldGroup
                  id="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  error={errors.lastName}
                  onChange={handleChange}
                  placeholder="Hunt"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  error={errors.email}
                  onChange={handleChange}
                  placeholder="james@veloce.co"
                />
                <FieldGroup
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  error={errors.phone}
                  onChange={handleChange}
                  placeholder="+44 7700 900000"
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="message"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your requirements or preferred appointment time…"
                  className="w-full resize-none rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-white/25 focus:outline-none"
                  style={{
                    borderColor: errors.message ? "rgba(204,0,0,0.6)" : "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                {errors.message && (
                  <p className="mt-1 font-mono text-[9px] tracking-[0.14em] uppercase" style={{ color: "#CC0000" }}>
                    {errors.message}
                  </p>
                )}
              </div>

              {errors.form && (
                <p className="mt-3 font-mono text-[9px] tracking-[0.14em] uppercase" style={{ color: "#CC0000" }}>
                  {errors.form}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="luxury-button luxury-button--accent mt-6 w-full"
                style={{ opacity: isSubmitting ? 0.6 : 1 }}
              >
                {isSubmitting ? "Submitting…" : "Submit Enquiry"}
                {!isSubmitting && <FiArrowUpRight size={16} />}
              </button>

              <p className="mt-4 text-center font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: "var(--text-muted)" }}>
                Your information is treated with absolute discretion.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface FieldGroupProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: string;
}

function FieldGroup({ id, label, value, error, onChange, placeholder, type = "text" }: FieldGroupProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[10px] tracking-[0.22em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border bg-transparent px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-white/25 focus:outline-none"
        style={{
          borderColor: error ? "rgba(204,0,0,0.6)" : "var(--border)",
          color: "var(--text-primary)",
        }}
      />
      {error && (
        <p className="mt-1 font-mono text-[9px] tracking-[0.14em] uppercase" style={{ color: "#CC0000" }}>
          {error}
        </p>
      )}
    </div>
  );
}
