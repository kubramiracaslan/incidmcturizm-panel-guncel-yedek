"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { updateOwnProfileAction } from "@/lib/auth/actions";
import type { AdminProfileFieldErrors } from "@/lib/validation/profile";

interface ProfileFormProps {
  initialFullName: string;
  initialPhone: string;
  email: string;
}

export function ProfileForm({ initialFullName, initialPhone, email }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [fieldErrors, setFieldErrors] = useState<AdminProfileFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);

    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("phone", phone);

    startTransition(async () => {
      const result = await updateOwnProfileAction(formData);
      if (!result.success) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setFieldErrors({});
      setFormError(null);
      setSuccess(true);
    });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-primary-container p-6">
      <h3 className="mb-6 text-headline-sm font-headline-sm font-bold text-on-surface">
        Hesap
      </h3>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
            Ad Soyad
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`w-full rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
              fieldErrors.fullName
                ? "border-error focus:border-error focus:ring-error/50"
                : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
            }`}
          />
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-error">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
            Telefon
          </label>
          <PhoneInput name="phone" value={phone} error={fieldErrors.phone} onChange={setPhone} />
        </div>

        <div>
          <label className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
            E-posta
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-outline-variant bg-surface-deep px-3 py-2.5 text-sm text-on-surface-variant opacity-50"
          />
        </div>

        {formError && (
          <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            <Icon name="error" className="mt-0.5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
            <Icon name="check_circle" className="mt-0.5 flex-shrink-0" />
            <span>Profiliniz güncellendi.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
