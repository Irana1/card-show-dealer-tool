import assert from "node:assert/strict";
import test from "node:test";
import {
    buildCardPriceUrl,
    getTcgdexCardImageUrl,
    getTcgdexTcgplayerId
} from "../../js/api.js";

const originalApiKey = process.env.JUSTTCG_API_KEY;
process.env.JUSTTCG_API_KEY = "test-api-key";
const { default: app } = await import("../server.js");

if (originalApiKey === undefined) {
    delete process.env.JUSTTCG_API_KEY;
} else {
    process.env.JUSTTCG_API_KEY = originalApiKey;
}

test("uses the TCGdex image URL when it is provided", function() {
    assert.equal(
        getTcgdexCardImageUrl({
            image: "https://assets.tcgdex.net/en/sv/svp/001"
        }),
        "https://assets.tcgdex.net/en/sv/svp/001/low.webp"
    );
});

test("builds a promo image URL when TCGdex omits the image field", function() {
    assert.equal(
        getTcgdexCardImageUrl({
            id: "mep-023",
            localId: "023"
        }),
        "https://assets.tcgdex.net/en/me/mep/023/low.webp"
    );
});

test("uses the requested language for inferred promo image URLs", function() {
    assert.equal(
        getTcgdexCardImageUrl({
            id: "SV-P-001",
            localId: "001"
        }, "Japanese"),
        "https://assets.tcgdex.net/ja/sv/sv-p/001/low.webp"
    );
});

test("returns the TCGplayer product ID from TCGdex variant metadata", function() {
    assert.equal(
        getTcgdexTcgplayerId({
            variants_detailed: [
                { thirdParty: { tcgplayer: null } },
                { thirdParty: { tcgplayer: 680639 } }
            ]
        }),
        "680639"
    );
    assert.equal(getTcgdexTcgplayerId({ variants_detailed: [] }), null);
});

test("adds the TCGplayer product ID to the price API URL", function() {
    const url = buildCardPriceUrl(
        "Mega Charizard X ex",
        "023",
        "MEP Black Star Promos",
        "English",
        undefined,
        "mep",
        "680639"
    );

    assert.equal(url.searchParams.get("tcgplayerId"), "680639");
    assert.equal(url.searchParams.get("setId"), "mep");
    assert.equal(url.searchParams.get("number"), "023");
});

test("looks up promos by TCGplayer product ID before resolving the set", async function() {
    const originalFetch = globalThis.fetch;
    const upstreamRequests = [];
    globalThis.fetch = async function(input, options) {
        const url = new URL(input);
        upstreamRequests.push(url);

        assert.equal(options.headers["x-api-key"], "test-api-key");

        return new Response(JSON.stringify({
            data: [{
                tcgplayerId: 680639,
                variants: [{
                    condition: "Near Mint",
                    printing: "Holo",
                    language: "English",
                    price: 12.34
                }]
            }]
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    };

    const server = app.listen(0);

    try {
        await new Promise(function(resolve) {
            server.once("listening", resolve);
        });

        const address = server.address();
        const response = await originalFetch(
            `http://127.0.0.1:${address.port}/api/card-price?name=Mega%20Charizard%20X%20ex&number=023&set=MEP%20Black%20Star%20Promos&setId=mep&tcgplayerId=680639`
        );

        assert.equal(response.status, 200);
        assert.deepEqual(
            upstreamRequests.map(function(url) {
                return {
                    path: url.pathname,
                    game: url.searchParams.get("game"),
                    tcgplayerId: url.searchParams.get("tcgplayerId"),
                    language: url.searchParams.get("language")
                };
            }),
            [{
                path: "/v1/cards",
                game: "pokemon",
                tcgplayerId: "680639",
                language: "English"
            }]
        );
    } finally {
        globalThis.fetch = originalFetch;
        await new Promise(function(resolve, reject) {
            server.close(function(error) {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }
});
