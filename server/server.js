const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const JUSTTCG_API_KEY = process.env.JUSTTCG_API_KEY;

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

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
    
    try {
        const justTCGurl = new URL("https://api.justtcg.com/v1/cards");
        justTCGurl.search = new URLSearchParams({
            q: cardName,
            number: cardNumber,
            game: language.game
        });

        const response = await fetch(justTCGurl, {
            headers: {
                "x-api-key": JUSTTCG_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`JustTCG request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.data)) {
            throw new Error("JustTCG returned an invalid card-price response.");
        }

        let matchingCard = null;

        if (data.data.length === 1) {
            matchingCard = data.data[0];
        } else {
            matchingCard = data.data.find(function(card) {
                return card.set_name?.toLowerCase() === setName.toLowerCase();
            });

            if (!matchingCard) {
                const nameMatches = data.data.filter(function(card) {
                    return card.name?.toLowerCase().startsWith(cardName.toLowerCase());
                });

                if (nameMatches.length === 1) {
                    matchingCard = nameMatches[0];
                }
            }
        }

        if (!matchingCard) {
            return res.status(404).json({
                error: `Matching ${language.canonical} card not found`
            });
        }

        return res.json(matchingCard);
    } catch (error) {
        console.error("CARD PRICE LOOKUP FAILED:", error);

        return res.status(502).json({
            error: `Unable to retrieve ${language.canonical} card pricing`
        });
    }
});

app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}`);
});