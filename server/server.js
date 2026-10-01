const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const JUSTTCG_API_KEY = process.env.JUSTTCG_API_KEY;

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.get("/", function(req, res) {
    res.send("Card Show Dealer Tool backend is running");
});

app.get("/api/card-price", async function(req, res) {
    const cardName = req.query.name;
    const cardNumber = req.query.number;
    const setName = req.query.set;

    if (!cardName || !cardNumber || !setName) {
        return res.status(400).json({
            error: "Card name, number, and set is required"
        });
    }
    
    const justTCGurl = 
        `https://api.justtcg.com/v1/cards?q=${encodeURIComponent(cardName)}&number=${encodeURIComponent(cardNumber)}&game=pokemon`;

    const response = await fetch(justTCGurl, {
        headers: {
            "x-api-key": JUSTTCG_API_KEY
        }
    });

    const data = await response.json();

    let matchingCard = null;

    if (data.data.length === 1) {
        matchingCard = data.data[0];
    } else {
        matchingCard = data.data.find(function(card) {
            return card.set_name.toLowerCase() === setName.toLowerCase();
        });

        if (!matchingCard) {
            const nameMatches = data.data.filter(function(card) {
                return card.name.toLowerCase().startsWith(cardName.toLowerCase());
            });

            if (nameMatches.length === 1) {
                matchingCard = nameMatches[0];
            }
        }
    }

    if (!matchingCard) {
        return res.status(404).json({
            error: "Matching card not found"
        });
    }

    res.json(matchingCard)
});

app.listen(PORT, function() {
    console.log(`Server running on http://localhost:${PORT}`);
});