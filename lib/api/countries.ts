export interface Country {
  name: {
    common: string
  }
  idd: {
    root: string
    suffixes: string[]
  }
  flag: string
  cioc: string
  ccn3: Number

}

export async function fetchCountries(): Promise<Country[]> {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd,flag,cioc,ccn3")
    const countries: Country[] = await response.json()

    return countries
      .filter((country) => country.idd?.root && country.idd?.suffixes)
      .sort((a, b) => a.name.common.localeCompare(b.name.common))
  } catch (error) {
    console.error("Failed to fetch countries:", error)
    // Fallback data
    return [
      {
        name: { common: "United States" },
        idd: { root: "+1", suffixes: [""] },
        flag: "🇺🇸",
        cioc: "US",
        ccn3:1
      },
      {
        name: { common: "India" },
        idd: { root: "+91", suffixes: [""] },
        flag: "🇮🇳",
        cioc: "IN",
        ccn3:2
      },
      {
        name: { common: "United Kingdom" },
        idd: { root: "+44", suffixes: [""] },
        flag: "🇬🇧",
        cioc: "GB",
        ccn3:3
      },
    ]
  }
}
