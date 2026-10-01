export const API_BASE_URL = "https://card-show-pricing-api.onrender.com";

export function buildCardPriceUrl(name, number, set, language = "en") {
    const url = new URL("/api/card-price", API_BASE_URL);

    url.search = new URLSearchParams({
        name: name,
        number: number,
        set: set,
        language: language
    });

    return url;
}
