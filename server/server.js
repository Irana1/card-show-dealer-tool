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

function getSetTitle(setName) {
    const separatorIndex = setName.indexOf(":");

    return separatorIndex >= 0
        ? setName.slice(separatorIndex + 1).trim()
        : setName;
}

async function resolveJustTcgSet(setName, setId, game) {
    const normalizedSetName = normalizeText(setName);
    const normalizedSetId = normalizeText(setId);
    const cacheKey = `${game}::${normalizedSetId}::${normalizedSetName}`;
    const cachedSet = resolvedSetCache.get(cacheKey);

    if (cachedSet && cachedSet.expiresAt > Date.now()) {
        return cachedSet.set;
    }

    const nameResults = await requestJustTcg("/v1/sets", {
        game: game,
        q: setName
    });
    const nameMatches = nameResults.filter(function(set) {
        const normalizedCandidateName = normalizeText(set.name);
        const normalizedCandidateTitle = normalizeText(getSetTitle(set.name));

        return set.game_id === game && (
            normalizedCandidateName === normalizedSetName ||
            normalizedCandidateTitle === normalizedSetName ||
            normalizedCandidateName === normalizedSetId
        );
    });

    if (nameMatches.length === 1) {
        const resolvedSet = nameMatches[0];

        resolvedSetCache.set(cacheKey, {
            set: resolvedSet,
            expiresAt: Date.now() + SET_CACHE_TTL
        });

        return resolvedSet;
    }

    let resolvedSet = null;

    if (normalizedSetId) {
        const idResults = await requestJustTcg("/v1/sets", {
            game: game,
            q: setId
        });
        const idMatches = idResults.filter(function(set) {
            const candidateCode = normalizeText(set.name.split(":")[0]);

            return set.game_id === game &&
                candidateCode === normalizedSetId;
        });

        if (idMatches.length === 1) {
            resolvedSet = idMatches[0];
        }
    }

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
    const setId = req.query.setId;
    const tcgplayerId = req.query.tcgplayerId;
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
        let matchingCards = [];

        if (tcgplayerId) {
            const cards = await requestJustTcg("/v1/cards", {
                game: language.game,
                tcgplayerId: tcgplayerId,
                language: language.canonical
            });

            matchingCards = cards.filter(function(card) {
                return String(card.tcgplayerId) === String(tcgplayerId);
            });
        }

        if (matchingCards.length !== 1) {
            resolvedSet = await resolveJustTcgSet(setName, setId, language.game);

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

            for (const number of numberVariants) {
                const cardQuery = {
                    game: language.game,
                    set: resolvedSet.id,
                    number: number,
                    language: language.canonical
                };

                if (language.canonical === "English") {
                    cardQuery.q = cardName;
                }

                const cards = await requestJustTcg("/v1/cards", cardQuery);

                matchingCards = cards.filter(function(card) {
                    const matchesSetAndNumber = card.set === resolvedSet.id &&
                        normalizedNumberVariants.has(normalizeCardNumber(card.number));

                    if (language.canonical === "Japanese") {
                        return matchesSetAndNumber;
                    }

                    return matchesSetAndNumber &&
                        (
                            normalizeText(card.name) === normalizeText(cardName) ||
                            normalizeText(card.name) === normalizeText(`${cardName} ${card.number}`)
                        );
                });

                if (matchingCards.length > 0) {
                    break;
                }
            }
        }

        if (matchingCards.length !== 1) {
            logLookupFailure({
                language: language.canonical,
                game: language.game,
                name: cardName,
                number: cardNumber,
                tcgdexSet: setName,
                resolvedSet: resolvedSet?.id,
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
                resolvedSet: resolvedSet?.id,
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

if (require.main === module) {
    app.listen(PORT, function() {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;