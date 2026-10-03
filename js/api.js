export const API_BASE_URL = "https://card-show-pricing-api.onrender.com";

export function normalizeCardLanguage(language) {
    if (language == null || language === "" || language === "English" || language === "en") {
        return "English";
    }

    if (language === "Japanese" || language === "ja") {
        return "Japanese";
    }

    throw new Error(`Unsupported card language: ${language}`);
}

export function getTcgdexLanguage(language) {
    return normalizeCardLanguage(language) === "Japanese" ? "ja" : "en";
}

export function getTcgdexCardNumbers(card) {
    const localId = String(card.localId);
    const officialCount = Number(card.set?.cardCount?.official);

    if (!localId.includes("/") && Number.isInteger(officialCount) && officialCount > 0) {
        return [`${localId}/${officialCount}`, localId];
    }

    return [localId];
}

export function buildCardPriceUrl(
    name,
    number,
    set,
    language = "English",
    fallbackNumber,
    setId
) {
    const url = new URL("/api/card-price", API_BASE_URL);

    url.search = new URLSearchParams({
        name: name,
        number: number,
        set: set,
        language: normalizeCardLanguage(language)
    });

    if (fallbackNumber) {
        url.searchParams.set("fallbackNumber", fallbackNumber);
    }

    if (setId) {
        url.searchParams.set("setId", setId);
    }

    return url;
}
