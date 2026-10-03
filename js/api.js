export const API_BASE_URL = "https://card-show-pricing-api.onrender.com";

function normalizeCardLocalId(localId) {
    return String(localId)
        .normalize("NFKC")
        .toUpperCase()
        .replace(/^0+(?=\d)/, "");
}

function haveMatchingDexIds(japaneseCard, englishCard) {
    if (!Array.isArray(japaneseCard.dexId) ||
        !Array.isArray(englishCard.dexId) ||
        japaneseCard.dexId.length === 0 ||
        englishCard.dexId.length === 0
    ) {
        return false;
    }

    const japaneseDexIds = [...japaneseCard.dexId].sort();
    const englishDexIds = [...englishCard.dexId].sort();

    return japaneseDexIds.length === englishDexIds.length &&
        japaneseDexIds.every((dexId, index) => {
            return dexId === englishDexIds[index];
        });
}

function haveMatchingIllustrators(japaneseCard, englishCard) {
    return typeof japaneseCard.illustrator === "string" &&
        japaneseCard.illustrator !== "" &&
        japaneseCard.illustrator === englishCard.illustrator;
}

function isEnglishCardCounterpart(japaneseCard, englishCard) {
    if (japaneseCard.category !== englishCard.category) {
        return false;
    }

    const matchingDexIds = haveMatchingDexIds(japaneseCard, englishCard);
    const matchingIllustrators =
        haveMatchingIllustrators(japaneseCard, englishCard);

    if (japaneseCard.dexId?.length || englishCard.dexId?.length) {
        return matchingDexIds &&
            (!japaneseCard.illustrator ||
                japaneseCard.illustrator === englishCard.illustrator);
    }

    return matchingIllustrators;
}

export async function getEnglishCardCounterpart(japaneseCard) {
    const setId = japaneseCard.set?.id;

    if (!setId || japaneseCard.localId == null) {
        return null;
    }

    const setResponse = await fetch(
        `https://api.tcgdex.net/v2/en/sets/${encodeURIComponent(setId)}`
    );

    if (setResponse.status === 404) {
        return null;
    }

    if (!setResponse.ok) {
        throw new Error(`English TCGdex set lookup failed: ${setResponse.status}`);
    }

    const englishSet = await setResponse.json();

    if (typeof englishSet.name !== "string" ||
        !Array.isArray(englishSet.cards)
    ) {
        throw new Error("English TCGdex returned invalid set data.");
    }

    const matchingCards = englishSet.cards.filter((card) => {
        return normalizeCardLocalId(card.localId) ===
            normalizeCardLocalId(japaneseCard.localId);
    });

    if (matchingCards.length !== 1) {
        return {
            name: null,
            set: englishSet.name
        };
    }

    const cardResponse = await fetch(
        `https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(matchingCards[0].id)}`
    );

    if (cardResponse.status === 404) {
        return {
            name: null,
            set: englishSet.name
        };
    }

    if (!cardResponse.ok) {
        throw new Error(`English TCGdex card lookup failed: ${cardResponse.status}`);
    }

    const englishCard = await cardResponse.json();

    const cardMatched = isEnglishCardCounterpart(japaneseCard, englishCard);

    return {
        name: cardMatched ? englishCard.name : null,
        set: englishSet.name
    };
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
