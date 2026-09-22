"use client";

import { useEffect, useState } from "react";
import type { CountryOption, StateOption } from "@/lib/geo/countries";

interface CountryCitySelectProps {
  city: string;
  countryError?: string;
  cityError?: string;
  onCountryChange: (name: string) => void;
  onCityChange: (name: string) => void;
}

const selectClassName = (error?: string) =>
  `w-full rounded-lg border bg-surface-deep px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 disabled:opacity-50 ${
    error
      ? "border-error focus:border-error focus:ring-error/50"
      : "border-outline-variant focus:border-secondary focus:ring-secondary/50"
  }`;

/**
 * Ülke seçilince Şehir listesi ona göre filtrelenir (country-state-city
 * paketinin State verisi — il/eyalet seviyesi, mevcut `acentalar.sehir`
 * verisiyle aynı granülarite). Paket bazı küçük ada/bölge ülkeleri için
 * state verisi içermiyor (~53/250) — bu durumda Şehir serbest metne düşer,
 * kullanıcı kilitli kalmasın diye.
 */
export function CountryCitySelect({
  city,
  countryError,
  cityError,
  onCountryChange,
  onCityChange,
}: CountryCitySelectProps) {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countryCode, setCountryCode] = useState("");
  const [states, setStates] = useState<StateOption[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [statesLoaded, setStatesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/geo/countries").then(({ loadCountries }) =>
      loadCountries().then((list) => {
        if (!cancelled) {
          setCountries(list);
          setCountriesLoading(false);
        }
      }),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // countryCode only ever goes from "" to a real value — the placeholder
  // option is disabled, so a user can't re-select "no country" once one is
  // chosen. The `!countryCode` (initial-mount) case needs no reset: `states`
  // and `statesLoaded` already start at their empty/false defaults.
  useEffect(() => {
    if (!countryCode) return;
    let cancelled = false;
    import("@/lib/geo/countries").then(({ loadStatesForCountry }) =>
      loadStatesForCountry(countryCode).then((list) => {
        if (!cancelled) {
          setStates(list);
          setStatesLoading(false);
          setStatesLoaded(true);
        }
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  function handleCountrySelect(code: string) {
    setCountryCode(code);
    // Effect only sets state from its async callback (lint-clean) — the
    // "loading has started" flags are set here, synchronously, in response
    // to the actual user action that triggers them.
    setStates([]);
    setStatesLoading(true);
    setStatesLoaded(false);
    const match = countries.find((c) => c.isoCode === code);
    onCountryChange(match ? match.name : "");
    onCityChange("");
  }

  const noStatesForCountry = statesLoaded && states.length === 0;
  const selectedStateCode = states.find((s) => s.name === city)?.isoCode ?? "";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label
          htmlFor="country"
          className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
        >
          Ülke
        </label>
        <select
          id="country"
          name="country"
          value={countryCode}
          disabled={countriesLoading}
          onChange={(e) => handleCountrySelect(e.target.value)}
          className={selectClassName(countryError)}
        >
          <option value="" disabled>
            {countriesLoading ? "Yükleniyor..." : "Seçiniz"}
          </option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
        {countryError && <p className="mt-1 text-xs text-error">{countryError}</p>}
      </div>

      <div>
        <label
          htmlFor="city"
          className="mb-1.5 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
        >
          Şehir
        </label>
        {noStatesForCountry ? (
          <input
            id="city"
            name="city"
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className={selectClassName(cityError)}
          />
        ) : (
          <select
            id="city"
            name="city"
            value={selectedStateCode}
            disabled={!countryCode || statesLoading}
            onChange={(e) => {
              const match = states.find((s) => s.isoCode === e.target.value);
              onCityChange(match ? match.name : "");
            }}
            className={selectClassName(cityError)}
          >
            <option value="" disabled>
              {!countryCode ? "Önce ülke seçin" : statesLoading ? "Yükleniyor..." : "Seçiniz"}
            </option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>
        )}
        {cityError && <p className="mt-1 text-xs text-error">{cityError}</p>}
      </div>
    </div>
  );
}
