import {
    buildCardPriceUrl,
    getTcgdexCardNumbers,
    getTcgdexLanguage,
    normalizeCardLanguage
} from "./api.js";

export function initializeInventory({
    onSalesInventoryChanged,
    onAnalyticsChanged
}) {
    const inventoryForm = document.querySelector("#inventory-form");
    const inventoryCardNameInput = document.querySelector("#inventory-card-name");
    const inventoryPurchaseCostInput = document.querySelector("#inventory-purchase-cost");
    const inventoryMarketValueInput = document.querySelector("#inventory-market-value");
    const inventoryAskingPriceInput = document.querySelector("#inventory-asking-price");
    const inventoryLocationDropdown = document.querySelector("#inventory-location");
    const inventoryStatusDropdown = document.querySelector("#inventory-status");
    const inventoryFinalValueInput = document.querySelector("#inventory-final-value");
    const inventoryNotesInput = document.querySelector("#inventory-notes");
    const inventoryCardsContainer = document.querySelector("#inventory-cards-container");
    const inventorySubmitButton = document.querySelector("#inventory-submit-button");
    const inventorySearch = document.querySelector("#inventory-search");
    const inventoryLocationFilter = document.querySelector("#inventory-location-filter");
    const inventoryStatusFilter = document.querySelector("#inventory-status-filter");
    const inventorySortDropdown = document.querySelector("#inventory-sort");
    const updateInventoryPricesButton = document.querySelector("#update-inventory-prices");
    const inventoryCardCount = document.querySelector("#inventory-count");
    const inventoryTotalPurchaseCost = document.querySelector("#inventory-total-purchase-cost");
    const inventoryTotalMarketValue = document.querySelector("#inventory-total-market-value");
    const inventoryTotalAskingPrice = document.querySelector("#inventory-total-asking-price");
    const inventoryPotentialProfit = document.querySelector("#inventory-potential-profit");
    const inventoryAvailableCount = document.querySelector("#inventory-available-count");
    const inventoryRealizedRevenue = document.querySelector("#inventory-realized-revenue");
    const inventoryRealizedProfit = document.querySelector("#inventory-realized-profit");
    const inventoryStatusChartCanvas = document.querySelector("#inventory-status-chart");
    const inventoryLocationChartCanvas = document.querySelector("#inventory-by-location-chart");

    let inventoryCards = [];
    let editingInventoryCardIndex = null;
    let inventoryStatusChart = null;
    let inventoryLocationChart = null;
    let pendingInventoryCardData = null;

    function getSelectedOptionLabel(dropdown, value) {
        const selectedOption = Array.from(dropdown.options).find((option) => {
            return option.value === value;
        });

        return selectedOption ? selectedOption.textContent : value;
    }

    function getInventoryCardLanguage(card) {
        if (card.language == null || card.language === "" ||
            card.language === "English" || card.language === "en"
        ) {
            return "English";
        }

        if (card.language === "Japanese" || card.language === "ja") {
            return "Japanese";
        }

        return "Unknown";
    }

    function loadSavedInventory() {
        const savedInventoryCards = localStorage.getItem("inventoryCards");
        if (savedInventoryCards) {
            const inventoryCardsParsed = JSON.parse(savedInventoryCards);
            inventoryCards = inventoryCardsParsed.map((card) => {
                if (!card || typeof card !== "object" || Array.isArray(card)) {
                    return card;
                }

                try {
                    return {
                        ...card,
                        language: normalizeCardLanguage(card.language)
                    };
                } catch (error) {
                    console.error(
                        `INVALID INVENTORY CARD LANGUAGE FOR ${card.name}:`,
                        error
                    );

                    return card;
                }
            });
        }
    }

    function renderInventoryCards() {
        inventoryCardsContainer.innerHTML = "";
        
        let searchValue = inventorySearch.value.trim().toLowerCase();
        let locationFilter = inventoryLocationFilter.value;
        let statusFilter = inventoryStatusFilter.value;

        const filteredInventory = inventoryCards.filter((card) => {
            const matchesSearch = card.name.toLowerCase().includes(searchValue);
            const matchesLocation = locationFilter === "all-locations" || card.location === locationFilter;
            const matchesStatus = statusFilter === "all-statuses" || card.status === statusFilter;

            return matchesSearch && matchesLocation && matchesStatus;
        }) 

        filteredInventory.sort((a, b) => {
            switch (inventorySortDropdown.value) {
                case "card-name-a-z":
                    return a.name.localeCompare(b.name);
                case "purchase-cost-low-high":
                    return a.purchaseCost - b.purchaseCost;
                case "purchase-cost-high-low":
                    return b.purchaseCost - a.purchaseCost;
                case "market-value-low-high":
                    return a.marketValue - b.marketValue;
                case "market-value-high-low":
                    return b.marketValue - a.marketValue;
                case "asking-price-low-high":
                    return a.askingPrice - b.askingPrice;
                case "asking-price-high-low":
                    return b.askingPrice - a.askingPrice;
                case "default-order":
                    return 0;
            }
        });

        filteredInventory.forEach((card) => {
            const originalIndex = inventoryCards.indexOf(card);

            let finalValueDisplay;
            if (card.finalValue == null) {
                finalValueDisplay = "N/A";
            } else {
                finalValueDisplay = `$${card.finalValue.toFixed(2)}`;
            }
            let notesDisplay; 
            if (card.notes == null || card.notes == "") {
                notesDisplay = "N/A";
            } else {
                notesDisplay = `${card.notes}`;
            }

            const inventoryCardDiv = document.createElement("div");
            inventoryCardDiv.classList.add("inventory-card");

            const inventoryCardNameSpan = document.createElement("span");
            inventoryCardNameSpan.classList.add("inventory-card-name");
            inventoryCardNameSpan.textContent = `${card.name}`;

            const inventoryCardInfoDiv = document.createElement("div");
            inventoryCardInfoDiv.classList.add("inventory-card-info");

            const inventoryPurchaseCostLabel = document.createElement("span");
            inventoryPurchaseCostLabel.textContent = "Purchase Cost: ";
            inventoryPurchaseCostLabel.classList.add("inventory-card-label");
            const inventoryPurchaseCostSpan = document.createElement("span");
            inventoryPurchaseCostSpan.textContent = `$${card.purchaseCost.toFixed(2)}`;
            inventoryPurchaseCostSpan.classList.add("inventory-card-value");
            inventoryCardInfoDiv.appendChild(inventoryPurchaseCostLabel);
            inventoryCardInfoDiv.appendChild(inventoryPurchaseCostSpan);

            const inventoryMarketValueLabel = document.createElement("span");
            inventoryMarketValueLabel.textContent = "Market Value: "
            inventoryMarketValueLabel.classList.add("inventory-card-label");
            const inventoryMarketValueSpan = document.createElement("span");
            inventoryMarketValueSpan.textContent = `$${card.marketValue.toFixed(2)}`;
            inventoryMarketValueSpan.classList.add("inventory-card-value");
            inventoryCardInfoDiv.appendChild(inventoryMarketValueLabel);
            inventoryCardInfoDiv.appendChild(inventoryMarketValueSpan);

            const previousMarketValueLabel = document.createElement("span");
            previousMarketValueLabel.classList.add("inventory-card-label");
            previousMarketValueLabel.textContent = "Previous Market Value: ";
            const previousMarketValueValue = document.createElement("span");
            previousMarketValueValue.classList.add("inventory-card-value");
            if (card.previousMarketValue != null) {
                previousMarketValueValue.textContent = `$${card.previousMarketValue.toFixed(2)}`;
            } else {
                previousMarketValueValue.textContent = "N/A";
            }
            inventoryCardInfoDiv.appendChild(previousMarketValueLabel);
            inventoryCardInfoDiv.appendChild(previousMarketValueValue);

            const priceChangeLabel = document.createElement("span");
            priceChangeLabel.classList.add("inventory-card-label");
            priceChangeLabel.textContent = "Price Change: ";
            const priceChangeValue = document.createElement("span");
            priceChangeValue.classList.add("inventory-card-value");
            if (card.priceChange != null) {
                const sign = card.priceChange > 0 ? "+" : "-";
                priceChangeValue.textContent = `${sign}$${card.priceChange.toFixed(2)}`;
            } else {
                priceChangeValue.textContent = "N/A";
            }
            inventoryCardInfoDiv.appendChild(priceChangeLabel);
            inventoryCardInfoDiv.appendChild(priceChangeValue);

            const inventoryAskingPriceLabel = document.createElement("span");
            inventoryAskingPriceLabel.textContent = "Asking Price: ";
            inventoryAskingPriceLabel.classList.add("inventory-card-label");
            const inventoryAskingPriceSpan = document.createElement("span");
            inventoryAskingPriceSpan.textContent = `$${card.askingPrice.toFixed(2)}`;
            inventoryAskingPriceSpan.classList.add("inventory-card-value");
            inventoryCardInfoDiv.appendChild(inventoryAskingPriceLabel);
            inventoryCardInfoDiv.appendChild(inventoryAskingPriceSpan);

            const inventoryLocationLabel = document.createElement("span");
            inventoryLocationLabel.textContent = "Location: ";
            inventoryLocationLabel.classList.add("inventory-card-label");
            const inventoryLocationSpan = document.createElement("span");
            inventoryLocationSpan.textContent = getSelectedOptionLabel(
                inventoryLocationDropdown,
                card.location
            );
            inventoryLocationSpan.classList.add("inventory-card-value");
            inventoryCardInfoDiv.appendChild(inventoryLocationLabel);
            inventoryCardInfoDiv.appendChild(inventoryLocationSpan);

            const inventoryStatusLabel = document.createElement("span");
            inventoryStatusLabel.textContent = "Status: ";
            inventoryStatusLabel.classList.add("inventory-card-label");
            const inventoryStatusSpan = document.createElement("span");
            inventoryStatusSpan.textContent = getSelectedOptionLabel(
                inventoryStatusDropdown,
                card.status
            );
            inventoryStatusSpan.classList.add("inventory-card-value");
            inventoryCardInfoDiv.appendChild(inventoryStatusLabel);
            inventoryCardInfoDiv.appendChild(inventoryStatusSpan);

            const inventoryFinalValueLabel = document.createElement("span");
            inventoryFinalValueLabel.textContent = "Final Value: ";
            inventoryFinalValueLabel.classList.add("inventory-card-label");
            const inventoryFinalValueSpan = document.createElement("span");
            inventoryFinalValueSpan.textContent = `${finalValueDisplay}`;
            inventoryFinalValueSpan.classList.add("inventory-card-value");
            inventoryCardInfoDiv.appendChild(inventoryFinalValueLabel);
            inventoryCardInfoDiv.appendChild(inventoryFinalValueSpan);

            const inventoryNotesLabel = document.createElement("span");
            inventoryNotesLabel.textContent = "Notes: ";
            inventoryNotesLabel.classList.add("inventory-card-label");
            const inventoryNotesSpan = document.createElement("span");
            inventoryNotesSpan.textContent = `${notesDisplay}`;
            inventoryNotesSpan.classList.add("inventory-card-value");
            inventoryCardInfoDiv.appendChild(inventoryNotesLabel);
            inventoryCardInfoDiv.appendChild(inventoryNotesSpan);

            const inventoryLanguageLabel = document.createElement("span");
            inventoryLanguageLabel.textContent = "Language: ";
            inventoryLanguageLabel.classList.add("inventory-card-label");
            const inventoryLanguageSpan = document.createElement("span");
            inventoryLanguageSpan.textContent = getInventoryCardLanguage(card);
            inventoryLanguageSpan.classList.add("inventory-card-value");
            inventoryCardInfoDiv.appendChild(inventoryLanguageLabel);
            inventoryCardInfoDiv.appendChild(inventoryLanguageSpan);
            
            const inventoryCardActions = document.createElement("div");
            inventoryCardActions.classList.add("inventory-card-actions");

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.type = "button";
            editButton.classList.add("inventory-edit-button");
            editButton.addEventListener("click", function() {
                inventoryCardNameInput.value = card.name;
                inventoryPurchaseCostInput.value = card.purchaseCost;
                inventoryMarketValueInput.value = card.marketValue;
                inventoryAskingPriceInput.value = card.askingPrice;
                inventoryLocationDropdown.value = card.location;
                inventoryStatusDropdown.value = card.status;
                inventoryFinalValueInput.value = card.finalValue ?? "";
                inventoryNotesInput.value = card.notes ?? "";
                editingInventoryCardIndex = originalIndex;
                inventorySubmitButton.textContent = "Update Inventory";
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }) 

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            deleteButton.classList.add("inventory-delete-button");
            deleteButton.addEventListener("click", function() {
                if (originalIndex === editingInventoryCardIndex) {
                    editingInventoryCardIndex = null;
                    inventorySubmitButton.textContent = "Add to Inventory";
                    inventoryCardNameInput.value = "";
                    inventoryPurchaseCostInput.value = "";
                    inventoryMarketValueInput.value = "";
                    inventoryAskingPriceInput.value = "";
                    inventoryLocationDropdown.value = "";
                    inventoryStatusDropdown.value = "available";
                    inventoryFinalValueInput.value = "";
                    inventoryNotesInput.value = "";
                } else if (originalIndex < editingInventoryCardIndex) {
                    editingInventoryCardIndex = editingInventoryCardIndex - 1;
                }

                inventoryCards.splice(originalIndex, 1);
                localStorage.setItem("inventoryCards", JSON.stringify(inventoryCards));

                renderInventoryCards();
                calculateInventorySummary();
                renderInventoryStatusChart();
                renderInventoryLocationChart();

                onAnalyticsChanged();
                onSalesInventoryChanged();
            })

            inventoryCardActions.appendChild(editButton);
            inventoryCardActions.appendChild(deleteButton);

            if (card.status === "available") {
                const markSoldButton = document.createElement("button");
                markSoldButton.textContent = "Mark Sold";
                markSoldButton.type = "button";
                markSoldButton.classList.add("inventory-sold-button");
                markSoldButton.addEventListener("click", function() {
                    markInventoryCard(originalIndex, "sold")
                })

                const markTradedButton = document.createElement("button");
                markTradedButton.textContent = "Mark Traded";
                markTradedButton.type = "button";
                markTradedButton.classList.add("mark-traded-button");
                markTradedButton.addEventListener("click", function() {
                    markInventoryCard(originalIndex, "traded")
                })

                inventoryCardActions.appendChild(markSoldButton);
                inventoryCardActions.appendChild(markTradedButton);
            }

            inventoryCardDiv.appendChild(inventoryCardNameSpan);
            inventoryCardDiv.appendChild(inventoryCardInfoDiv);
            inventoryCardDiv.appendChild(inventoryCardActions);
            inventoryCardsContainer.appendChild(inventoryCardDiv);
        })
    }

    async function updateInventoryPrices() {
        let updatedCount = 0;
        let failedCount = 0;

        for (const card of inventoryCards) {
            if (card.status !== "available" || !card.tcgdexId) {
                continue;
            }

            try {
                const language = normalizeCardLanguage(card.language);
                const tcgdexResponse = await fetch(
                    `https://api.tcgdex.net/v2/${getTcgdexLanguage(language)}/cards/${encodeURIComponent(card.tcgdexId)}`
                );

                if (!tcgdexResponse.ok) {
                    throw new Error(
                        `TCGdex request failed: ${tcgdexResponse.status}`
                    );
                }

                const tcgdexCard = await tcgdexResponse.json();
                const [cardNumber, fallbackNumber] =
                    getTcgdexCardNumbers(tcgdexCard);

                const priceURL = buildCardPriceUrl(
                    tcgdexCard.name,
                    cardNumber,
                    tcgdexCard.set.name,
                    language,
                    fallbackNumber,
                    tcgdexCard.set.id
                );

                const response = await fetch(priceURL);

                if (!response.ok) {
                    throw new Error(
                        `Price API request failed: ${response.status}`
                    );
                }

                const priceData = await response.json();

                const matchingVariant = priceData.variants.find(function(variant) {
                    return variant.condition === card.condition &&
                        variant.printing === card.printing;
                });

                if (!matchingVariant || matchingVariant.price == null) {
                    failedCount++;
                    continue;
                }

                const oldMarketValue = Number(card.marketValue);
                const newMarketValue = Number(matchingVariant.price);

                card.previousMarketValue = oldMarketValue;
                card.marketValue = newMarketValue;
                card.priceChange = newMarketValue - oldMarketValue;

                updatedCount++;
            } catch (error) {
                failedCount++;

                console.error(
                    `PRICE UPDATE FAILED FOR ${card.name}:`,
                    error
                );

                continue;
            }
        }

        localStorage.setItem(
            "inventoryCards",
            JSON.stringify(inventoryCards)
        );

        renderInventoryCards();
        calculateInventorySummary();
        renderInventoryStatusChart();
        renderInventoryLocationChart();

        onAnalyticsChanged();

        if (failedCount === 0) {
            alert(`Price update complete. ${updatedCount} card(s) updated.`);
        } else if (navigator.onLine === false) {
            alert(
                `Price update complete. ${updatedCount} card(s) updated. ` +
                `${failedCount} card(s) could not be updated because you are offline. ` +
                `Existing prices were kept.`
            );
        } else {
            alert(
                `Price update complete. ${updatedCount} card(s) updated. ` +
                `${failedCount} card(s) could not be updated. ` +
                `Existing prices were kept.`
            );
        }
    }

    function calculateInventorySummary() {
        let inventoryCount = inventoryCards.length;
        let totalPurchaseCost = 0;
        let totalMarketValue = 0;
        let totalAskingPrice = 0;
        let availableInventoryCount = 0;
        let realizedRevenue = 0;
        let realizedProfit = 0;

        for (const card of inventoryCards) {
            totalPurchaseCost += card.purchaseCost;
            totalMarketValue += card.marketValue;
            totalAskingPrice += card.askingPrice;

            if (card.status === "available") {
                availableInventoryCount += 1;
            }

            if (card.status === "sold" || card.status === "traded") {
                if (card.finalValue != null) {
                    realizedRevenue += card.finalValue;
                    realizedProfit += card.finalValue - card.purchaseCost;
                }
            }
        }
        let totalPotentialProfit = totalAskingPrice - totalPurchaseCost;

        inventoryCardCount.textContent = `${inventoryCount}`;
        inventoryTotalPurchaseCost.textContent = `$${totalPurchaseCost.toFixed(2)}`;
        inventoryTotalMarketValue.textContent = `$${totalMarketValue.toFixed(2)}`;
        inventoryTotalAskingPrice.textContent = `$${totalAskingPrice.toFixed(2)}`;
        inventoryPotentialProfit.textContent = `$${totalPotentialProfit.toFixed(2)}`;
        inventoryAvailableCount.textContent = `${availableInventoryCount}`;
        inventoryRealizedRevenue.textContent = `$${realizedRevenue.toFixed(2)}`;
        inventoryRealizedProfit.textContent = `$${realizedProfit.toFixed(2)}`;
    }

    function markInventoryCard(originalIndex, newStatus) {
        let finalValuePrompt = prompt("What is the final value of the card?")

        if (finalValuePrompt === null) {
            return;
        }

        finalValuePrompt = finalValuePrompt.trim();

        if (finalValuePrompt === "") {
            return;
        }

        finalValuePrompt = Number(finalValuePrompt);

        if (Number.isNaN(finalValuePrompt) || finalValuePrompt < 0) {
            return;
        }

        if (originalIndex === editingInventoryCardIndex) {
            editingInventoryCardIndex = null;
            inventorySubmitButton.textContent = "Add to Inventory";
            inventoryCardNameInput.value = "";
            inventoryPurchaseCostInput.value = "";
            inventoryMarketValueInput.value = "";
            inventoryAskingPriceInput.value = "";
            inventoryLocationDropdown.value = "";
            inventoryStatusDropdown.value = "available";
            inventoryFinalValueInput.value = "";
            inventoryNotesInput.value = "";
        }

        inventoryCards[originalIndex].status = newStatus;
        inventoryCards[originalIndex].finalValue = finalValuePrompt;

        localStorage.setItem("inventoryCards", JSON.stringify(inventoryCards));
        renderInventoryCards();
        calculateInventorySummary();
        renderInventoryStatusChart();
        renderInventoryLocationChart();

        onAnalyticsChanged();
        onSalesInventoryChanged();
    }

    function renderInventoryStatusChart() {
        let availableCount = 0;
        let soldCount = 0;
        let tradedCount = 0;

        for (const card of inventoryCards) {
            if (card.status === "available") {
                availableCount++;
            } else if (card.status === "sold") {
                soldCount++;
            } else if (card.status === "traded") {
                tradedCount++;
            }
        }

        if (inventoryStatusChart !== null) {
            inventoryStatusChart.destroy();
        }

        inventoryStatusChart = new Chart(inventoryStatusChartCanvas, {
            type: "bar",
            data: {
                labels: ["Available", "Sold", "Traded"],
                datasets: [
                    {
                        label: "Cards",
                        data: [availableCount, soldCount, tradedCount]
                    }
                ]
            }
        });
    }

    function renderInventoryLocationChart() {
        let lowValueCount = 0;
        let medValueCount = 0;
        let highValueCount = 0;

        for (const card of inventoryCards) {
            if (card.location === "1-5-binder") {
                lowValueCount++;
            } else if (card.location === "6-20-toploader-binder") {
                medValueCount++;
            } else if (card.location === "21-showcase") {
                highValueCount++;
            }
        }

        if (inventoryLocationChart !== null) {
            inventoryLocationChart.destroy();
        }

        inventoryLocationChart = new Chart(inventoryLocationChartCanvas, {
            type: "bar",
            data: {
                labels: ["$1-$5 Binder", "$6-$20 Toploader Binder", "$21+ Showcase"],
                datasets: [
                    {
                        label: "Cards",
                        data: [lowValueCount, medValueCount, highValueCount]
                    }
                ]
            }
        });
    }

    function prefillInventoryFromCardSearch(cardData) {
        inventoryCardNameInput.value = cardData.name;
        inventoryMarketValueInput.value = cardData.marketValue;
        inventoryAskingPriceInput.value = cardData.marketValue;

        pendingInventoryCardData = {
            tcgdexId: cardData.tcgdexId,
            cardSet: cardData.cardSet,
            cardNumber: cardData.cardNumber,
            language: normalizeCardLanguage(cardData.language),
            condition: cardData.condition,
            printing: cardData.printing
        };
    };

    inventoryForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let inventoryCardName = inventoryCardNameInput.value.trim();
        let inventoryPurchaseCost = Number(inventoryPurchaseCostInput.value);
        let inventoryMarketValue = Number(inventoryMarketValueInput.value);
        let inventoryAskingPrice = Number(inventoryAskingPriceInput.value);
        let inventoryLocation = inventoryLocationDropdown.value;
        let inventoryStatus = inventoryStatusDropdown.value;
        let inventoryFinalValue = inventoryFinalValueInput.value;
        let inventoryNotes = inventoryNotesInput.value.trim();

        if (inventoryCardName === "" ||
            inventoryPurchaseCostInput.value === "" ||
            inventoryMarketValueInput.value === "" ||
            inventoryAskingPriceInput.value === "" ||
            inventoryLocation === "" ||
            inventoryStatus === ""
        ) {
            return;
        }

        if (inventoryPurchaseCost < 0 || 
            inventoryMarketValue < 0 ||
            inventoryAskingPrice < 0
        ) {
            return;
        }

        if (inventoryFinalValue === "") {
            inventoryFinalValue = null;
        } else {
            inventoryFinalValue = Number(inventoryFinalValue);

            if (inventoryFinalValue < 0) {
                return;
            }
        }

        let existingInventoryCard = null;

        if (editingInventoryCardIndex !== null) {
            existingInventoryCard = inventoryCards[editingInventoryCardIndex];
        }

        let inventoryCard = {
            name: inventoryCardName,
            purchaseCost: inventoryPurchaseCost,
            marketValue: inventoryMarketValue,
            askingPrice: inventoryAskingPrice,
            location: inventoryLocation,
            status: inventoryStatus,
            finalValue: inventoryFinalValue,
            notes: inventoryNotes,
            tcgdexId: 
                pendingInventoryCardData?.tcgdexId ??
                existingInventoryCard?.tcgdexId ??
                null,
            cardSet: 
                pendingInventoryCardData?.cardSet ??
                existingInventoryCard?.cardSet ??
                null,
            cardNumber: 
                pendingInventoryCardData?.cardNumber ??
                existingInventoryCard?.cardNumber ??
                null,
            language: normalizeCardLanguage(
                pendingInventoryCardData?.language ??
                existingInventoryCard?.language
            ),
            condition: 
                pendingInventoryCardData?.condition ??
                existingInventoryCard?.condition ??
                null,
            printing: 
                pendingInventoryCardData?.printing ??
                existingInventoryCard?.printing ??
                null
        }

        if (editingInventoryCardIndex !== null) {
            inventoryCards[editingInventoryCardIndex] = inventoryCard;
        } else {
            inventoryCards.push(inventoryCard);
        }
        localStorage.setItem("inventoryCards", JSON.stringify(inventoryCards));
        editingInventoryCardIndex = null;
        inventorySubmitButton.textContent = "Add to Inventory";

        renderInventoryCards();
        calculateInventorySummary();
        renderInventoryStatusChart();
        renderInventoryLocationChart();

        onSalesInventoryChanged();
        onAnalyticsChanged();

        inventoryCardNameInput.value = "";
        inventoryPurchaseCostInput.value = "";
        inventoryMarketValueInput.value = "";
        inventoryAskingPriceInput.value = "";
        inventoryLocationDropdown.value = "";
        inventoryStatusDropdown.value = "available";
        inventoryFinalValueInput.value = "";
        inventoryNotesInput.value = "";
        pendingInventoryCardData = null;
    })

    inventorySearch.addEventListener("input", (event) => {
        renderInventoryCards();
    })

    inventoryLocationFilter.addEventListener("change", (event) => {
        renderInventoryCards();
    })

    inventoryStatusFilter.addEventListener("change", (event) => {
        renderInventoryCards();
    })

    inventorySortDropdown.addEventListener("change", (event) => {
        renderInventoryCards();
    })

    updateInventoryPricesButton.addEventListener("click", function() {
        updateInventoryPrices();
    })

    loadSavedInventory();
    renderInventoryCards();
    calculateInventorySummary();

    renderInventoryStatusChart();
    renderInventoryLocationChart();

    return {
        getInventoryCards() {
            return inventoryCards;
        },

        markInventorySold(index, salePrice) {
            inventoryCards[index].status = "sold";
            inventoryCards[index].finalValue = salePrice;

            localStorage.setItem("inventoryCards", JSON.stringify(inventoryCards));
        },

        addInventoryCard(card) {
            inventoryCards.push({
                ...card,
                language: normalizeCardLanguage(card.language)
            });

            localStorage.setItem("inventoryCards", JSON.stringify(inventoryCards));
        },

        refreshInventory() {
            renderInventoryCards();
            calculateInventorySummary();
            renderInventoryStatusChart();
            renderInventoryLocationChart();
        },

        prefillInventoryFromCardSearch
    };
}