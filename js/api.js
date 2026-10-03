export const API_BASE_URL = "https://card-show-pricing-api.onrender.com";
const JAPANESE_TEXT_PATTERN =
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const TRANSLATION_CACHE_KEY = "cachedJapaneseTranslations";

function getCachedTranslations() {
    const cachedTranslations = localStorage.getItem(TRANSLATION_CACHE_KEY);

    if (!cachedTranslations) {
        return {};
    }

    try {
        return JSON.parse(cachedTranslations);
    } catch (error) {
        console.error("CACHED TRANSLATION DATA ERROR:", error);
        return {};
    }
}

export async function translateJapaneseToEnglish(text) {
    const sourceText = String(text).trim();

    if (!JAPANESE_TEXT_PATTERN.test(sourceText)) {
        return sourceText;
    }

    const cachedTranslations = getCachedTranslations();

    if (typeof cachedTranslations[sourceText] === "string") {
        return cachedTranslations[sourceText];
    }

    const url = new URL("https://api.mymemory.translated.net/get");

    url.search = new URLSearchParams({
        q: sourceText,
        langpair: "ja|en"
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Japanese translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.responseData?.translatedText?.trim();

    if (data.responseStatus !== 200 ||
        !translatedText ||
        JAPANESE_TEXT_PATTERN.test(translatedText)
    ) {
        throw new Error("Japanese translation returned no usable English text.");
    }

    const latestCachedTranslations = getCachedTranslations();

    latestCachedTranslations[sourceText] = translatedText;
    localStorage.setItem(
        TRANSLATION_CACHE_KEY,
        JSON.stringify(latestCachedTranslations)
    );

    return translatedText;
}

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
