"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { changePasswordAction, type ChangePasswordFieldErrors } from "@/lib/auth/actions";
import { validateNewPassword, validatePasswordsMatch } from "@/lib/validation/password";

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const initialValues: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

interface FieldProps {
  label: string;
  name: keyof ChangePasswordFormValues;
  value: string;
  error?: string;
  onChange: (name: keyof ChangePasswordFormValues, value: string) => void;
}

function Field({ label, name, value, error, onChange }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="password"
        value={value}
        autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
          error
            ? "border-error focus:border-error focus:ring-error/50"
            : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
        }`}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

export function ChangePasswordForm() {
  const [values, setValues] = useState<ChangePasswordFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(name: keyof ChangePasswordFormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newPasswordError = validateNewPassword(values.newPassword);
    const matchError = newPasswordError
      ? undefined
      : validatePasswordsMatch(values.newPassword, values.confirmNewPassword);

    if (!values.currentPassword || newPasswordError || matchError) {
      setFieldErrors({
        ...(!values.currentPassword ? { currentPassword: "Mevcut şifre zorunludur." } : {}),
        ...(newPasswordError ? { newPassword: newPasswordError } : {}),
        ...(matchError ? { confirmNewPassword: matchError } : {}),
      });
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const formData = new FormData();
    formData.set("currentPassword", values.currentPassword);
    formData.set("newPassword", values.newPassword);
    formData.set("confirmNewPassword", values.confirmNewPassword);

    startTransition(async () => {
      const result = await changePasswordAction(formData);
      if (!result.success) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors);
        return;
      }
      setValues(initialValues);
      setSuccess(true);
    });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-primary-container p-6">
      <h3 className="mb-6 text-headline-sm font-headline-sm font-bold text-on-surface">
        Şifre Değiştir
      </h3>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <Field
          label="Mevcut Şifre"
          name="currentPassword"
          value={values.currentPassword}
          error={fieldErrors.currentPassword}
          onChange={handleChange}
        />
        <Field
          label="Yeni Şifre"
          name="newPassword"
          value={values.newPassword}
          error={fieldErrors.newPassword}
          onChange={handleChange}
        />
        <Field
          label="Yeni Şifre (Tekrar)"
          name="confirmNewPassword"
          value={values.confirmNewPassword}
          error={fieldErrors.confirmNewPassword}
          onChange={handleChange}
        />

        {formError && (
          <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            <Icon name="error" className="mt-0.5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
            <Icon name="check_circle" className="mt-0.5 flex-shrink-0" />
            <span>Şifreniz güncellendi.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-primary-container transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </div>
  );
}
