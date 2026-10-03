import {
    buildCardPriceUrl,
    getTcgdexLanguage,
    normalizeCardLanguage
} from "./api.js";

export function initializeCardSearch(onAddToInventory) {
    const cardSearchForm = document.querySelector("#card-search-form");
    const cardSearchInput = document.querySelector("#card-search-input");
    const cardSearchLanguageSelect = document.querySelector("#card-search-language");
    const cardSearchResults = document.querySelector("#card-search-results");
    const selectedCardContainer = document.querySelector("#selected-card-container");
    const priceConditionSelect = document.querySelector("#price-condition");
    const pricePrintingSelect = document.querySelector("#price-printing");
    const selectedCardMarketPriceDisplay = document.querySelector("#selected-card-market-price");
    const addSelectedCardToInventoryButton = document.querySelector("#selected-card-to-inventory");

    const SEARCH_CACHE_KEY = "cachedCardSearches";
    const CARD_CACHE_KEY = "cachedCardDetails";
    const PRICE_CACHE_KEY = "cachedCardPrices";

    let selectedPokemonCard = null;
    let selectedCardLanguage = null;
    let selectedCardPriceData = null;
    let selectedMarketPrice = null;
    let selectedPriceIsCached = false;
    let selectedPriceCachedAt = null;

    function getCachedPrices() {
        const cachedPrices = localStorage.getItem(PRICE_CACHE_KEY);

        if (!cachedPrices) {
            return {};
        }

        try {
            return JSON.parse(cachedPrices);
        } catch (error) {
            console.error("CACHED PRICE DATA ERROR:", error);
            return {};
        }
    }

    function getPriceCacheKey(card, language) {
        const canonicalLanguage = normalizeCardLanguage(language);

        return `${canonicalLanguage}::${card.name}::${card.localId}::${card.set.name}`;
    }

    function saveCachedPrice(card, language, priceData) {
        const cachedPrices = getCachedPrices();

        const cacheKey = getPriceCacheKey(card, language);

        cachedPrices[cacheKey] = {
            priceData: priceData,
            cachedAt: new Date().toISOString()
        };

        localStorage.setItem(
            PRICE_CACHE_KEY,
            JSON.stringify(cachedPrices)
        );
    }

    function getCachedPrice(card, language) {
        const cachedPrices = getCachedPrices();

        const cacheKey = getPriceCacheKey(card, language);

        const legacyEnglishCacheKey =
            `${card.name}::${card.localId}::${card.set.name}`;
        const previousLanguageCacheKey =
            `${getTcgdexLanguage(language)}::${legacyEnglishCacheKey}`;

        return cachedPrices[cacheKey] ||
            cachedPrices[previousLanguageCacheKey] ||
            (normalizeCardLanguage(language) === "English"
                ? cachedPrices[legacyEnglishCacheKey]
                : null) ||
            null;
    }

    function getApiErrorMessage() {
        if (navigator.onLine === false) {
            return "You're offline. Card search and pricing require an internet connection.";
        }

        return "Unable to connect to the card service. Please try again.";
    }

    function getCachedSearches() {
        const cachedSearches = localStorage.getItem(SEARCH_CACHE_KEY);

        if (!cachedSearches) {
            return {};
        }

        try {
            return JSON.parse(cachedSearches);
        } catch (error) {
            console.error("CACHED SEARCH DATA ERROR:", error);
            return {};
        }
    }

    function getCachedCards() {
        const cachedCards = localStorage.getItem(CARD_CACHE_KEY);

        if (!cachedCards) {
            return {};
        }

        try {
            return JSON.parse(cachedCards);
        } catch (error) {
            console.error("CACHED CARD DATA ERROR:", error);
            return {};
        }
    }

    function getSearchCacheKey(searchTerm, language) {
        return `${normalizeCardLanguage(language)}::${searchTerm.toLowerCase()}`;
    }

    function saveCachedSearch(searchTerm, language, cards) {
        const cachedSearches = getCachedSearches();

        const cacheKey = getSearchCacheKey(searchTerm, language);

        cachedSearches[cacheKey] = {
            cards: cards,
            cachedAt: new Date().toISOString()
        };

        localStorage.setItem(
            SEARCH_CACHE_KEY,
            JSON.stringify(cachedSearches)
        );
    }

    function saveCachedCard(card, language) {
        const cachedCards = getCachedCards();

        cachedCards[`${normalizeCardLanguage(language)}::${card.id}`] = {
            card: card,
            cachedAt: new Date().toISOString()
        };

        localStorage.setItem(
            CARD_CACHE_KEY,
            JSON.stringify(cachedCards)
        );
    }

    function getCachedSearch(searchTerm, language) {
        const cachedSearches = getCachedSearches();

        const cacheKey = getSearchCacheKey(searchTerm, language);
        const legacyEnglishCacheKey = searchTerm.toLowerCase();
        const previousLanguageCacheKey =
            `${getTcgdexLanguage(language)}::${legacyEnglishCacheKey}`;

        return cachedSearches[cacheKey] ||
            cachedSearches[previousLanguageCacheKey] ||
            (normalizeCardLanguage(language) === "English"
                ? cachedSearches[legacyEnglishCacheKey]
                : null) ||
            null;
    }

    function getCachedCard(cardId, language) {
        const cachedCards = getCachedCards();
        const canonicalLanguage = normalizeCardLanguage(language);
        const previousLanguageCacheKey =
            `${getTcgdexLanguage(canonicalLanguage)}::${cardId}`;

        return cachedCards[`${canonicalLanguage}::${cardId}`] ||
            cachedCards[previousLanguageCacheKey] ||
            (canonicalLanguage === "English"
                ? cachedCards[cardId]
                : null) ||
            null;
    }

    function showCachedPriceStatus(cachedAt) {
        const existingStatus =
            selectedCardContainer.querySelector("#selected-card-price-cache-status");

        if (existingStatus) {
            existingStatus.remove();
        }

        const status = document.createElement("p");

        status.id = "selected-card-price-cache-status";

        const cachedDate = new Date(cachedAt);

        status.textContent =
            `Using cached market price from ${cachedDate.toLocaleString()}. ` +
            `This price may be outdated.`;

        selectedCardContainer.appendChild(status);
    }

    function clearSelectedCardPrice() {
        selectedCardPriceData = null;
        selectedMarketPrice = null;
        selectedPriceIsCached = false;
        selectedPriceCachedAt = null;

        selectedCardMarketPriceDisplay.textContent = "$--";
        priceConditionSelect.innerHTML = "";
        pricePrintingSelect.innerHTML = "";

        const existingStatus =
            selectedCardContainer.querySelector("#selected-card-price-cache-status");

        if (existingStatus) {
            existingStatus.remove();
        }
    }

    function renderSearchResults(cards, language, fromCache = false) {
        const canonicalLanguage = normalizeCardLanguage(language);

        cardSearchResults.innerHTML = "";

        if (fromCache) {
            const cachedMessage = document.createElement("p");

            cachedMessage.textContent =
                "Showing previously cached card data. Some information may be outdated.";

            cardSearchResults.appendChild(cachedMessage);
        }

        if (cards.length === 0) {
            const noResultsMessage = document.createElement("p");

            noResultsMessage.textContent = "No cards found.";

            cardSearchResults.appendChild(noResultsMessage);

            return;
        }

        for (const card of cards) {
            let cardName = card.name;
            let cardNumber = card.localId;

            const cardResultDiv = document.createElement("div");
            cardResultDiv.classList.add("card-search-result");

            const cardImage = document.createElement("img");

            if (card.image) {
                cardImage.src = `${card.image}/low.webp`;
                cardImage.alt = `${card.name} card`;
            }

            const cardNameSpan = document.createElement("span");
            cardNameSpan.textContent = `${cardName}`;

            const cardNumberSpan = document.createElement("span");
            cardNumberSpan.textContent = `#${cardNumber}`;

            const selectCardButton = document.createElement("button");

            selectCardButton.type = "button";
            selectCardButton.textContent = "Select Card";

            selectCardButton.addEventListener("click", function() {
                selectPokemonCard(card.id, canonicalLanguage);
            });

            cardResultDiv.appendChild(cardNameSpan);
            cardResultDiv.appendChild(cardNumberSpan);
            cardResultDiv.appendChild(cardImage);
            cardResultDiv.appendChild(selectCardButton);

            cardSearchResults.appendChild(cardResultDiv);
        }
    }

    async function searchPokemonCards(searchTerm, language) {
        cardSearchResults.innerHTML = "";

        try {
            const canonicalLanguage = normalizeCardLanguage(language);
            let nameTerm = searchTerm;
            let cardNumber = null;

            const numberOnlyMatch = searchTerm.match(
                /^#?([a-z]*\d+[a-z]?)(?:\s*\/\s*[a-z]*\d+[a-z]?)?$/i
            );
            const nameAndNumberMatch = searchTerm.match(
                /^(.+?)\s+#?([a-z]*\d+[a-z]?)(?:\s*\/\s*[a-z]*\d+[a-z]?)?$/i
            );

            if (numberOnlyMatch) {
                nameTerm = "";
                cardNumber = numberOnlyMatch[1];
            } else if (nameAndNumberMatch) {
                nameTerm = nameAndNumberMatch[1].trim().replace(/[\s#-]+$/, "");
                cardNumber = nameAndNumberMatch[2];
            }

            const searchUrl = new URL(
                `https://api.tcgdex.net/v2/${getTcgdexLanguage(canonicalLanguage)}/cards`
            );

            if (nameTerm) {
                searchUrl.searchParams.set("name", nameTerm);
            }

            if (cardNumber) {
                searchUrl.searchParams.set("localId", cardNumber);
            }

            const response = await fetch(searchUrl);

            if (!response.ok) {
                throw new Error(`TCGdex search failed: ${response.status}`);
            }

            const cards = await response.json();

            saveCachedSearch(searchTerm, canonicalLanguage, cards);

            for (const card of cards) {
                saveCachedCard(card, canonicalLanguage);
            }

            renderSearchResults(cards, canonicalLanguage);
        } catch (error) {
            console.error("CARD SEARCH ERROR:", error);

            const cachedSearch = getCachedSearch(searchTerm, language);

            if (cachedSearch) {
                renderSearchResults(cachedSearch.cards, language, true);
                return;
            }

            cardSearchResults.innerHTML = "";

            const errorMessage = document.createElement("p");

            errorMessage.textContent = getApiErrorMessage();

            cardSearchResults.appendChild(errorMessage);
        }
    }

    async function selectPokemonCard(cardId, language) {
        selectedPokemonCard = null;
        selectedCardLanguage = normalizeCardLanguage(language);

        clearSelectedCardPrice();

        selectedCardContainer.innerHTML = "";

        try {
            const response = await fetch(
                `https://api.tcgdex.net/v2/${getTcgdexLanguage(selectedCardLanguage)}/cards/${encodeURIComponent(cardId)}`
            );

            if (!response.ok) {
                throw new Error(`TCGdex card lookup failed: ${response.status}`);
            }

            const cardDetails = await response.json();

            saveCachedCard(cardDetails, selectedCardLanguage);

            selectedPokemonCard = cardDetails;

            renderSelectedCard(cardDetails);

            fetchCardPrice(selectedPokemonCard, selectedCardLanguage);
        } catch (error) {
            console.error("CARD DETAIL ERROR:", error);

            const cachedCard = getCachedCard(cardId, selectedCardLanguage);

            if (cachedCard) {
                selectedPokemonCard = cachedCard.card;

                renderSelectedCard(cachedCard.card);

                const cachedMessage = document.createElement("p");

                cachedMessage.textContent =
                    "Showing previously cached card data. Market pricing still requires an internet connection.";

                selectedCardContainer.appendChild(cachedMessage);

                fetchCardPrice(selectedPokemonCard, selectedCardLanguage);

                return;
            }

            selectedPokemonCard = null;

            clearSelectedCardPrice();

            selectedCardContainer.innerHTML = "";

            const errorMessage = document.createElement("p");

            errorMessage.textContent = getApiErrorMessage();

            selectedCardContainer.appendChild(errorMessage);
        }
    }

    function renderSelectedCard(card) {
        selectedCardContainer.innerHTML = "";

        const selectedCardDiv = document.createElement("div");

        selectedCardDiv.classList.add("selected-card");

        const selectedCardImage = document.createElement("img");

        if (card.image) {
            selectedCardImage.src = `${card.image}/low.webp`;
            selectedCardImage.alt = `${card.name} card`;
        }

        selectedCardImage.classList.add("selected-card-image");

        const selectedCardNameSpan = document.createElement("span");

        selectedCardNameSpan.classList.add("selected-card-name");

        selectedCardNameSpan.textContent = `${card.name}`;

        const selectedCardInfoDiv = document.createElement("div");

        selectedCardInfoDiv.classList.add("selected-card-info");

        const selectedCardSetLabel = document.createElement("span");

        selectedCardSetLabel.classList.add("selected-card-label");

        selectedCardSetLabel.textContent = "Set: ";

        const selectedCardSetValue = document.createElement("span");

        selectedCardSetValue.classList.add("selected-card-value");

        selectedCardSetValue.textContent = `${card.set.name}`;

        selectedCardInfoDiv.appendChild(selectedCardSetLabel);
        selectedCardInfoDiv.appendChild(selectedCardSetValue);

        const selectedCardLocalIdLabel = document.createElement("span");

        selectedCardLocalIdLabel.classList.add("selected-card-label");

        selectedCardLocalIdLabel.textContent = "Card Number: ";

        const selectedCardLocalIdValue = document.createElement("span");

        selectedCardLocalIdValue.classList.add("selected-card-value");

        selectedCardLocalIdValue.textContent = `#${card.localId}`;

        selectedCardInfoDiv.appendChild(selectedCardLocalIdLabel);
        selectedCardInfoDiv.appendChild(selectedCardLocalIdValue);

        const selectedCardRarityLabel = document.createElement("span");

        selectedCardRarityLabel.classList.add("selected-card-label");

        selectedCardRarityLabel.textContent = "Rarity: ";

        const selectedCardRarityValue = document.createElement("span");

        selectedCardRarityValue.classList.add("selected-card-value");

        selectedCardRarityValue.textContent = `${card.rarity || "N/A"}`;

        selectedCardInfoDiv.appendChild(selectedCardRarityLabel);
        selectedCardInfoDiv.appendChild(selectedCardRarityValue);

        selectedCardDiv.appendChild(selectedCardImage);
        selectedCardDiv.appendChild(selectedCardNameSpan);
        selectedCardDiv.appendChild(selectedCardInfoDiv);

        selectedCardContainer.appendChild(selectedCardDiv);
    }

    async function fetchCardPrice(card, language) {
        const canonicalLanguage = normalizeCardLanguage(language);
        const cardName = card.name;
        const cardNumber = card.localId;
        const setName = card.set.name;

        const priceURL = buildCardPriceUrl(
            cardName,
            cardNumber,
            setName,
            canonicalLanguage
        );

        try {
            const response = await fetch(priceURL);

            if (!response.ok) {
                throw new Error(`Price API failed: ${response.status}`);
            }

            const priceData = await response.json();

            if (!priceData || !Array.isArray(priceData.variants)) {
                throw new Error("Invalid price data received.");
            }

            saveCachedPrice(card, canonicalLanguage, priceData);

            selectedCardPriceData = priceData;
            selectedPriceIsCached = false;
            selectedPriceCachedAt = null;

            populatePriceConditions();
        } catch (error) {
            console.error("PRICE FETCH ERROR:", error);

            const cachedPrice = getCachedPrice(card, canonicalLanguage);

            if (cachedPrice) {
                selectedCardPriceData = cachedPrice.priceData;
                selectedPriceIsCached = true;
                selectedPriceCachedAt = cachedPrice.cachedAt;

                populatePriceConditions();

                showCachedPriceStatus(cachedPrice.cachedAt);

                return;
            }

            clearSelectedCardPrice();

            const errorMessage = document.createElement("p");

            if (navigator.onLine === false) {
                errorMessage.textContent =
                    "Market pricing is unavailable offline. No cached price is available for this card.";
            } else {
                errorMessage.textContent =
                    "Market pricing is unavailable. No cached price is available.";
            }

            selectedCardContainer.appendChild(errorMessage);
        }
    }

    function populatePriceConditions() {
        priceConditionSelect.innerHTML = "";

        const conditions = new Set();

        for (const variant of selectedCardPriceData.variants) {
            conditions.add(variant.condition);
        }

        for (const condition of conditions) {
            const option = document.createElement("option");

            option.value = condition;
            option.textContent = condition;

            priceConditionSelect.appendChild(option);
        }

        populatePricePrintings();
    }

    function populatePricePrintings() {
        pricePrintingSelect.innerHTML = "";

        const selectedCondition = priceConditionSelect.value;

        const printings = new Set();

        for (const variant of selectedCardPriceData.variants) {
            if (variant.condition === selectedCondition) {
                printings.add(variant.printing);
            }
        }

        for (const printing of printings) {
            const option = document.createElement("option");

            option.value = printing;
            option.textContent = printing;

            pricePrintingSelect.appendChild(option);
        }

        updateSelectedCardMarketPrice();
    }

    function updateSelectedCardMarketPrice() {
        const selectedCondition = priceConditionSelect.value;
        const selectedPrinting = pricePrintingSelect.value;

        const matchingVariant = selectedCardPriceData.variants.find(function(variant) {
            return variant.condition === selectedCondition &&
                variant.printing === selectedPrinting;
        });

        if (!matchingVariant || matchingVariant.price == null) {
            selectedCardMarketPriceDisplay.textContent = "$--";
            selectedMarketPrice = null;

            return;
        }

        selectedMarketPrice = Number(matchingVariant.price);

        selectedCardMarketPriceDisplay.textContent =
            `$${Number(matchingVariant.price).toFixed(2)}`;
    }

    priceConditionSelect.addEventListener("change", function() {
        populatePricePrintings();
    });

    pricePrintingSelect.addEventListener("change", function() {
        updateSelectedCardMarketPrice();
    });

    cardSearchForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let searchTerm = cardSearchInput.value.trim();

        if (searchTerm === "") {
            return;
        }

        searchPokemonCards(
            searchTerm,
            normalizeCardLanguage(cardSearchLanguageSelect.value)
        );
    });

    addSelectedCardToInventoryButton.addEventListener("click", function() {
        if (!selectedPokemonCard || selectedMarketPrice === null) {
            return;
        }

        const cardData = {
            name: `${selectedPokemonCard.name} - ${selectedPokemonCard.set.name} #${selectedPokemonCard.localId}`,
            marketValue: selectedMarketPrice,
            tcgdexId: selectedPokemonCard.id,
            cardSet: selectedPokemonCard.set.name,
            cardNumber: selectedPokemonCard.localId,
            language: selectedCardLanguage,
            condition: priceConditionSelect.value,
            printing: pricePrintingSelect.value
        };

        onAddToInventory(cardData);
    });
}