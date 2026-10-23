"use client";

import { useEffect, useRef, useState } from "react";
import {
  isValidPhoneNumber,
  parsePhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";

interface PhoneCountry {
  isoCode: string;
  name: string;
  phonecode: string;
}

interface PhoneInputProps {
  value: string;
  onChange: (e164: string) => void;
  name: string;
  disabled?: boolean;
  error?: string;
}

const inputClassName = (error?: string) =>
  `rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 disabled:opacity-50 ${
    error
      ? "border-error focus:border-error focus:ring-error/50"
      : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
  }`;

const DEFAULT_COUNTRY = "TR";

export function PhoneInput({ value, onChange, name, disabled, error }: PhoneInputProps) {
  const [countries, setCountries] = useState<PhoneCountry[]>([]);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);
  const [nationalNumber, setNationalNumber] = useState("");
  const lastEmittedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    import("country-state-city/lib/country").then(({ default: Country }) => {
      if (cancelled) return;
      const list = Country.getAllCountries()
        .map((c) => ({
          isoCode: c.isoCode,
          name: c.isoCode === "TR" ? "Türkiye" : c.name,
          phonecode: c.phonecode.replace(/\D/g, ""),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr"));
      setCountries(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // value bizim son gönderdiğimizle aynıysa kendi güncellememizin yankısı,
  // dokunma. Farklı ama geçersiz/boşsa kullanıcının yazdığı kısmı silme.
  useEffect(() => {
    if (value === lastEmittedRef.current) return;

    if (!value) {
      if (lastEmittedRef.current) {
        setNationalNumber("");
        lastEmittedRef.current = "";
      }
      return;
    }
    if (!isValidPhoneNumber(value)) return;

    const parsed = parsePhoneNumber(value);
    if (parsed.country) {
      setCountryCode(parsed.country);
    } else {
      const match = countries.find((c) => c.phonecode === parsed.countryCallingCode);
      if (match) setCountryCode(match.isoCode);
    }
    setNationalNumber(parsed.nationalNumber);
  }, [value, countries]);

  function emit(nextCountryCode: string, nextNationalNumber: string) {
    if (!nextNationalNumber) {
      lastEmittedRef.current = "";
      onChange("");
      return;
    }

    const result = parsePhoneNumberFromString(nextNationalNumber, nextCountryCode as CountryCode);
    if (result && result.isValid()) {
      lastEmittedRef.current = result.number;
      onChange(result.number);
      return;
    }

    const phonecode = countries.find((c) => c.isoCode === nextCountryCode)?.phonecode ?? "";
    const next = `+${phonecode}${nextNationalNumber}`;
    lastEmittedRef.current = next;
    onChange(next);
  }

  function handleCountryChange(code: string) {
    setCountryCode(code);
    emit(code, nationalNumber);
  }

  function handleNumberChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    setNationalNumber(digits);
    emit(countryCode, digits);
  }

  function handleNumberBlur() {
    if (!nationalNumber) return;
    const result = parsePhoneNumberFromString(nationalNumber, countryCode as CountryCode);
    if (result && result.isValid()) {
      setNationalNumber(result.nationalNumber);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <select
          aria-label="Ülke kodu"
          value={countryCode}
          disabled={disabled || countries.length === 0}
          onChange={(e) => handleCountryChange(e.target.value)}
          className={`${inputClassName()} w-44 shrink-0`}
        >
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name} (+{c.phonecode})
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          aria-label="Telefon numarası"
          placeholder="555 123 45 67"
          value={nationalNumber}
          disabled={disabled}
          onChange={(e) => handleNumberChange(e.target.value)}
          onBlur={handleNumberBlur}
          className={`w-full ${inputClassName(error)}`}
        />
      </div>
      <input type="hidden" name={name} value={value} />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
