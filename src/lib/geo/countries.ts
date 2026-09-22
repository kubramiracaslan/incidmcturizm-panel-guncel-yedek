/**
 * Country/state lookups backed by `country-state-city`. Imports the
 * package's `country`/`state` submodules directly (never the package root,
 * which also re-exports `city` — a ~7.7MB JSON file we never need here)
 * behind a dynamic `import()`, so this data ships as its own chunk and
 * never lands in the app's shared bundle.
 *
 * The package only has English names. Turkey is overridden to its Turkish
 * endonym since it's the overwhelming majority of this app's agencies —
 * translating all 250 country names isn't practical.
 */

export interface CountryOption {
  isoCode: string;
  name: string;
}

export interface StateOption {
  isoCode: string;
  name: string;
}

const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
  TR: "Türkiye",
};

export async function loadCountries(): Promise<CountryOption[]> {
  const { default: Country } = await import("country-state-city/lib/country");
  return Country.getAllCountries()
    .map((c) => ({ isoCode: c.isoCode, name: COUNTRY_NAME_OVERRIDES[c.isoCode] ?? c.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export async function loadStatesForCountry(countryCode: string): Promise<StateOption[]> {
  const { default: State } = await import("country-state-city/lib/state");
  return State.getStatesOfCountry(countryCode)
    .map((s) => ({ isoCode: s.isoCode, name: s.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}
