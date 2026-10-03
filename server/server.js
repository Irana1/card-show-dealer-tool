const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const JUSTTCG_API_KEY = process.env.JUSTTCG_API_KEY;

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const SET_CACHE_TTL = 10 * 60 * 1000;
const resolvedSetCache = new Map();

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim()
        .replace(/\s+/g, " ");
}

function normalizeCardNumber(value) {
    return String(value ?? "")
        .normalize("NFKC")
        .trim()
        .replace(/\s*\/\s*/g, "/")
        .split("/")
        .map(function(part) {
            const match = part.toUpperCase().match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);

            if (!match) {
                return part.toUpperCase();
            }

            const digits = match[2].replace(/^0+(?=\d)/, "");

            return `${match[1]}${digits}${match[3]}`.toUpperCase();
        })
        .join("/");
}

function logLookupFailure(details) {
    console.warn("CARD PRICE LOOKUP FAILED:", {
        Language: details.language,
        Game: details.game,
        Name: details.name,
        Number: details.number,
        TCGdexSet: details.tcgdexSet,
        ResolvedJustTCGSet: details.resolvedSet ?? "not resolved",
        Reason: details.reason
    });
}

async function requestJustTcg(path, params) {
    const url = new URL(path, "https://api.justtcg.com");
    url.search = new URLSearchParams(params);

    const response = await fetch(url, {
        headers: {
            "x-api-key": JUSTTCG_API_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`JustTCG request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.data)) {
        throw new Error("JustTCG returned an invalid response.");
    }

    return data.data;
}

async function resolveJustTcgSet(setName, game) {
    const normalizedSetName = normalizeText(setName);
    const cacheKey = `${game}::${normalizedSetName}`;
    const cachedSet = resolvedSetCache.get(cacheKey);

    if (cachedSet && cachedSet.expiresAt > Date.now()) {
        return cachedSet.set;
    }

    const sets = await requestJustTcg("/v1/sets", {
        game: game,
        q: setName
    });

    const exactMatches = sets.filter(function(set) {
        return set.game_id === game &&
            normalizeText(set.name) === normalizedSetName;
    });

    const resolvedSet = exactMatches.length === 1 ? exactMatches[0] : null;

    resolvedSetCache.set(cacheKey, {
        set: resolvedSet,
        expiresAt: Date.now() + SET_CACHE_TTL
    });

    return resolvedSet;
}

app.get("/", function(req, res) {
    res.send("Card Show Dealer Tool backend is running");
});

app.get("/api/card-price", async function(req, res) {
    const cardName = req.query.name;
    const cardNumber = req.query.number;
    const setName = req.query.set;
    const requestedLanguage = req.query.language || "English";

    let language = null;

    if (requestedLanguage === "English" || requestedLanguage === "en") {
        language = { canonical: "English", game: "pokemon" };
    } else if (requestedLanguage === "Japanese" || requestedLanguage === "ja") {
        language = { canonical: "Japanese", game: "pokemon-japan" };
    }

    if (!cardName || !cardNumber || !setName) {
        return res.status(400).json({
            error: "Card name, number, and set is required"
        });
    }

    if (!language) {
        return res.status(400).json({
            error: "Language must be English or Japanese"
        });
    }

    if (!JUSTTCG_API_KEY) {
        return res.status(503).json({
            error: "Card pricing is not configured on the server"
        });
    }
    
    let resolvedSet = null;

    try {
        resolvedSet = await resolveJustTcgSet(setName, language.game);

        if (!resolvedSet) {
            logLookupFailure({
                language: language.canonical,
                game: language.game,
                name: cardName,
                number: cardNumber,
                tcgdexSet: setName,
                reason: "no exact JustTCG set match"
            });

            return res.status(404).json({
                code: "CARD_NOT_FOUND",
                error: "Matching card set not found."
            });
        }

        const numberVariants = [cardNumber];
        if (req.query.fallbackNumber &&
            normalizeCardNumber(req.query.fallbackNumber) !== normalizeCardNumber(cardNumber)
        ) {
            numberVariants.push(req.query.fallbackNumber);
        }
        const normalizedNumberVariants = new Set(
            numberVariants.map(normalizeCardNumber)
        );

        let matchingCards = [];

        for (const number of numberVariants) {
            const cards = await requestJustTcg("/v1/cards", {
                game: language.game,
                set: resolvedSet.id,
                number: number,
                q: cardName,
                language: language.canonical
            });

            matchingCards = cards.filter(function(card) {
                return card.set === resolvedSet.id &&
                    normalizedNumberVariants.has(normalizeCardNumber(card.number)) &&
                    normalizeText(card.name) === normalizeText(cardName);
            });

            if (matchingCards.length > 0) {
                break;
            }
        }

        if (matchingCards.length !== 1) {
            logLookupFailure({
                language: language.canonical,
                game: language.game,
                name: cardName,
                number: cardNumber,
                tcgdexSet: setName,
                resolvedSet: resolvedSet.id,
                reason: matchingCards.length > 1
                    ? "multiple cards matched the full identity"
                    : "no card matched the exact set, number, and name"
            });

            return res.status(404).json({
                code: "CARD_NOT_FOUND",
                error: "Matching card not found."
            });
        }

        const matchingCard = matchingCards[0];

        if (!Array.isArray(matchingCard.variants)) {
            throw new Error("JustTCG returned a card with invalid variant data.");
        }

        const variants = matchingCard.variants.filter(function(variant) {
            if (language.canonical === "Japanese") {
                return typeof variant.language === "string" &&
                    variant.language.toLowerCase() === "japanese";
            }

            return variant.language == null ||
                (typeof variant.language === "string" &&
                    variant.language.toLowerCase() === "english");
        });

        if (!variants.some(function(variant) {
            return variant.price != null && Number.isFinite(Number(variant.price));
        })) {
            logLookupFailure({
                language: language.canonical,
                game: language.game,
                name: cardName,
                number: cardNumber,
                tcgdexSet: setName,
                resolvedSet: resolvedSet.id,
                reason: "card matched but no priced variants exist for the requested language"
            });

            return res.status(404).json({
                code: "PRICE_UNAVAILABLE",
                error: `Card found, but no ${language.canonical} pricing data is available.`
            });
        }

        return res.json({
            ...matchingCard,
            variants: variants
        });
    } catch (error) {
        logLookupFailure({
            language: language.canonical,
            game: language.game,
            name: cardName,
            number: cardNumber,
            tcgdexSet: setName,
            resolvedSet: resolvedSet?.id,
            reason: error.message
        });

        return res.status(502).json({
            code: "PRICING_SERVICE_UNAVAILABLE",
            error: `Unable to retrieve ${language.canonical} card pricing.`
        });
    }
});

app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}`);
});