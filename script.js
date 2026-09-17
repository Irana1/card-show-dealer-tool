document.addEventListener("DOMContentLoaded", function() {
    const buyCalculator = document.querySelector("#buy-calculator");
    const buyMarketValueInput = document.querySelector("#buy-mkt-value");
    const buyPercentageBtns = document.querySelectorAll(".buy-percentage-btn");
    const buyPercentageInput = document.querySelector("#buy-pct");
    const buyOfferDisplay = document.querySelector("#buy-offer");

    const tradeCalculator = document.querySelector("#trade-calculator");
    const tradeMarketValueInput = document.querySelector("#trade-mkt-value");
    const tradePercentageBtns = document.querySelectorAll(".trade-percentage-btn");
    const tradePercentageInput = document.querySelector("#trade-pct");
    const tradeOfferDisplay = document.querySelector("#trade-offer");

    const profitCalculator = document.querySelector("#profit-calculator");
    const purchaseCostInput = document.querySelector("#purchase-cost");
    const salePriceInput = document.querySelector("#sale-price");
    const profitDisplay = document.querySelector("#profit-span");
    const profitMarginDisplay = document.querySelector("#profit-margin-span");
    const roiDisplay = document.querySelector("#roi-span");

    const pricingCalculator = document.querySelector("#pricing-calculator");
    const pricingMarketValueInput = document.querySelector("#pricing-mkt-value");
    const suggestedPriceDisplay = document.querySelector("#suggested-price-span");

    const collectionBuyEvaluator = document.querySelector("#collection-buy-evaluator");
    const cardNameInput = document.querySelector("#card-name");
    const cardMarketValueInput = document.querySelector("#card-mkt-value");
    const clearCollectionButton = document.querySelector("#clear-collection-button");
    const collectionSubmitButton = document.querySelector("#collection-submit-button");
    const cancelEditButton = document.querySelector("#cancel-edit-button");
    const addedCardsContainer = document.querySelector("#added-cards-container");
    const totalMarketValueDisplay = document.querySelector("#total-market-value-span");
    const collectionCardCountDisplay = document.querySelector("#collection-card-count");
    const averageCardValueDisplay = document.querySelector("#average-card-value");
    const collectionProfitDisplay = document.querySelector("#collection-profit");
    const collectionPercentageBtns = document.querySelectorAll(".collection-percentage-btn");
    const sellPercentageBtns = document.querySelectorAll(".sell-percentage-btn");    
    const collectionOfferDisplay = document.querySelector("#collection-offer-span");
    const expectedSaleValueDisplay = document.querySelector("#expected-sale-value");
    const expectedProfitDisplay = document.querySelector("#expected-profit");
    const expectedRoiDisplay = document.querySelector("#expected-roi");
    const expectedMarginDisplay = document.querySelector("#expected-margin");

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
    const inventoryCardCount = document.querySelector("#inventory-count");
    const inventoryTotalPurchaseCost = document.querySelector("#inventory-total-purchase-cost");
    const inventoryTotalMarketValue = document.querySelector("#inventory-total-market-value");
    const inventoryTotalAskingPrice = document.querySelector("#inventory-total-asking-price");
    const inventoryPotentialProfit = document.querySelector("#inventory-potential-profit");
    const inventoryAvailableCount = document.querySelector("#inventory-available-count");
    const inventoryRealizedRevenue = document.querySelector("#inventory-realized-revenue");
    const inventoryRealizedProfit = document.querySelector("#inventory-realized-profit");

    const showSessionForm = document.querySelector("#show-session-form");
    const showNameInput = document.querySelector("#show-name");
    const showDateInput = document.querySelector("#show-date");
    const showStartingCashInput = document.querySelector("#show-starting-cash");
    const showNotesInput = document.querySelector("#show-notes");
    const activeShowContainer = document.querySelector("#active-show-container");

    const salesForm = document.querySelector("#sales-form");
    const salesItemNameInput = document.querySelector("#sale-item-name");
    const salesPriceInput = document.querySelector("#sales-price");
    const salesPaymentTypeDropdown = document.querySelector("#sale-payment-type");
    const salesInventoryCardDropdown = document.querySelector("#sale-inventory-card");
    const salesNotesInput = document.querySelector("#sale-notes");
    const salesContainer = document.querySelector("#sales-container");

    const purchaseForm = document.querySelector("#purchase-form");
    const purchaseItemNameInput = document.querySelector("#purchase-item-name");
    const purchasePriceInput = document.querySelector("#purchase-price");
    const purchaseTypeDropdown = document.querySelector("#purchase-type");
    const purchaseAddToInventoryDropdown = document.querySelector("#purchase-add-to-inventory");
    const purchaseMarketValueInput = document.querySelector("#purchase-market-value")
    const purchaseInventoryLocationDropdown = document.querySelector("#purchase-inventory-location");
    const purchaseNotesInput = document.querySelector("#purchase-notes");
    const purchasesContainer = document.querySelector("#purchases-container");

    const tradeForm = document.querySelector("#trade-form");
    const tradeDescriptionInput = document.querySelector("#trade-description");
    const valueGivenInput = document.querySelector("#value-given");
    const valueReceivedInput = document.querySelector("#value-received");
    const tradeCashAddedByDropdown = document.querySelector("#trade-cash-added-by");
    const tradeCashAmountInput = document.querySelector("#trade-cash-amount");
    const tradeNotesInput = document.querySelector("#trade-notes");
    const tradesContainer = document.querySelector("#trades-container");

    const settingsForm = document.querySelector("#settings-form");
    const defaultBuyPercentageInput = document.querySelector("#default-buy-pct");
    const defaultTradePercentageInput = document.querySelector("#default-trade-pct");
    const defaultCollectionPercentageInput = document.querySelector("#default-collection-pct");

    // Pre-established variables and Arrays

    let collectionCards = [];
    let inventoryCards = [];
    let selectedCollectionPercentage = null;
    let selectedSellPercentage = null;
    let editingCardIndex = null;
    let editingInventoryCardIndex = null;
    let activeShow = null;
    let sales = [];
    let purchases = [];
    let trades = [];
    let settings = {
        defaultBuyPercentage: 75,
        defaultTradePercentage: 85,
        defaultCollectionPercentage: 80
    }

    // Load Functions

    function loadSettingsForm() {
        defaultBuyPercentageInput.value = settings.defaultBuyPercentage;
        defaultTradePercentageInput.value = settings.defaultTradePercentage;
        defaultCollectionPercentageInput.value = settings.defaultCollectionPercentage;
    }

    function loadSavedSettings() {
        const dealerSettings = localStorage.getItem("dealerSettings");
        if (dealerSettings) {
            const dealerSettingsParsed = JSON.parse(dealerSettings);
            settings = dealerSettingsParsed;
        }
    }

    function loadSavedCollection() {
        const savedCollectionCards = localStorage.getItem("collectionCards");
        if (savedCollectionCards) {
            const collectionCardsParsed = JSON.parse(savedCollectionCards);
            collectionCards = collectionCardsParsed;
        }
    }

    function loadSavedInventory() {
        const savedInventoryCards = localStorage.getItem("inventoryCards");
        if (savedInventoryCards) {
            const inventoryCardsParsed = JSON.parse(savedInventoryCards);
            inventoryCards = inventoryCardsParsed;
        }
    }

    function loadActiveShow() {
        const savedActiveShow = localStorage.getItem("activeShow");
        if (savedActiveShow) {
            const activeShowParsed = JSON.parse(savedActiveShow);
            activeShow = activeShowParsed;
        }
    }

    function loadSavedSales() {
        const savedSales = localStorage.getItem("sales");
        if (savedSales) {
            const salesParsed = JSON.parse(savedSales);
            sales = salesParsed;
        }
    }

    function loadSavedPurchases() {
        const savedPurchases = localStorage.getItem("purchases");
        if (savedPurchases) {
            const purchasesParsed = JSON.parse(savedPurchases);
            purchases = purchasesParsed;
        }
    }

    function loadSavedTrades() {
        const savedTrades = localStorage.getItem("trades");
        if (savedTrades) {
            const tradesParsed = JSON.parse(savedTrades);
            trades = tradesParsed;
        }
    }

    function applyDefaultSettings() {
        buyPercentageInput.value = settings.defaultBuyPercentage;
        for (const button of buyPercentageBtns) {
            button.classList.remove("selected-percentage");

            let buyButtonDataPercentage = Number(button.dataset.percentage);

            if (buyButtonDataPercentage === settings.defaultBuyPercentage) {
                button.classList.add("selected-percentage");
            }
        }

        tradePercentageInput.value = settings.defaultTradePercentage;
        for (const button of tradePercentageBtns) {
            button.classList.remove("selected-percentage");

            let tradeButtonDataPercentage = Number(button.dataset.percentage);

            if (tradeButtonDataPercentage === settings.defaultTradePercentage) {
                button.classList.add("selected-percentage");
            }
        }

        selectedCollectionPercentage = settings.defaultCollectionPercentage;        
        for (const button of collectionPercentageBtns) {
            button.classList.remove("selected-percentage");

            let collectionButtonDataPercentage = Number(button.dataset.percentage);

            if (collectionButtonDataPercentage === settings.defaultCollectionPercentage) {
                button.classList.add("selected-percentage");

            }
        }
    }

    // Calculate Buy Offer

    function calculateBuyOffer() {
        if (buyMarketValueInput.value === "" || buyPercentageInput.value === "") {
            return;
        }

        let buyMarketValue = Number(buyMarketValueInput.value);
        if (buyMarketValue < 0) {
            return;
        }

        let buyPercentage = Number(buyPercentageInput.value) / 100;
        if (buyPercentage < 0 || buyPercentage > 1) {
            return;
        }

        let cashOffer = buyMarketValue * buyPercentage;

        buyOfferDisplay.textContent = `$${cashOffer.toFixed(2)}`;
    }

    // Calculate Trade Offer

    function calculateTradeOffer() {
        if (tradeMarketValueInput.value === "" || tradePercentageInput.value === "") {
            return;
        }

        let tradeMarketValue = Number(tradeMarketValueInput.value);
        if (tradeMarketValue < 0) {
            return;
        }

        let tradePercentage = Number(tradePercentageInput.value) / 100;
        if (tradePercentage < 0 || tradePercentage > 1) {
            return;
        }

        let tradeOffer = tradeMarketValue * tradePercentage;

        tradeOfferDisplay.textContent = `$${tradeOffer.toFixed(2)}`;
    }

    // Calculate Profit

    function calculateProfit() {
        if (purchaseCostInput.value === "" || salePriceInput.value === "") {
            return;
        }

        let purchaseCost = Number(purchaseCostInput.value);
        if (purchaseCost < 0) {
            return;
        }

        let salePrice = Number(salePriceInput.value);
        if (salePrice < 0) {
            return;
        }

        let profit = salePrice - purchaseCost;
        profitDisplay.textContent = `$${profit.toFixed(2)}`;

        if (salePrice === 0) {
            profitMarginDisplay.textContent = "0.00%";
        } else {
            let profitMargin = profit / salePrice * 100;
            profitMarginDisplay.textContent = `${profitMargin.toFixed(2)}%`;            
        }

        if (purchaseCost === 0) {
            roiDisplay.textContent = "0.00%"
        } else {
            let roi = profit / purchaseCost * 100;
            roiDisplay.textContent = `${roi.toFixed(2)}%`;
        }
    }

    // Calculate Suggested Price

    function calculateSuggestedPrice() {
        if (pricingMarketValueInput.value === "") {
            return;
        }

        let pricingMarketValue = Number(pricingMarketValueInput.value);

        if (pricingMarketValue < 0) {
            return;
        }

        if (pricingMarketValue < 10) {
            let suggestedPrice = Math.ceil(pricingMarketValue);
            suggestedPriceDisplay.textContent = `$${suggestedPrice.toFixed(2)}`;
        } else if (pricingMarketValue <= 100) {
            let suggestedPrice = (Math.ceil(pricingMarketValue / 5)) * 5;
            suggestedPriceDisplay.textContent = `$${suggestedPrice.toFixed(2)}`;
        } else {
            let suggestedPrice = (Math.ceil(pricingMarketValue / 10)) * 10;
            suggestedPriceDisplay.textContent = `$${suggestedPrice.toFixed(2)}`;
        }
    }

    // Render Collection Cards

    function renderCollectionCards() {
        addedCardsContainer.innerHTML = "";

        collectionCards.forEach((card, index) => {
            const cardDiv = document.createElement("div");
            cardDiv.textContent = `${card.name} - $${card.marketValue.toFixed(2)}`;

            // Edit Button Listener

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.type = "button";
            editButton.addEventListener("click", function() {
                cardNameInput.value = card.name;
                cardMarketValueInput.value = card.marketValue;
                editingCardIndex = index;
                collectionSubmitButton.textContent = "Update Card";
                cancelEditButton.hidden = false;
            })

            // Delete Button Listener

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            deleteButton.addEventListener("click", function() {
                collectionCards.splice(index, 1);
                localStorage.setItem("collectionCards", JSON.stringify(collectionCards));
                renderCollectionCards();
                calculateCollectionTotal();

                if (selectedCollectionPercentage !== null) {
                    calculateCollectionOffer(selectedCollectionPercentage);
                }

                if (selectedSellPercentage !== null) {
                    calculateExpectedSaleValue();
                }

                if (selectedSellPercentage !== null && selectedCollectionPercentage !== null) {
                    calculateExpectedProfit();
                    calculateExpectedRoi();
                    calculateExpectedMargin();
                }
            })

            cancelEditButton.addEventListener("click", function() {
                editingCardIndex = null;
                cardNameInput.value = "";
                cardMarketValueInput.value = "";
                collectionSubmitButton.textContent = "Add Card";
                cancelEditButton.hidden = true;
            })

            cardDiv.appendChild(editButton);
            cardDiv.appendChild(deleteButton);
            addedCardsContainer.appendChild(cardDiv);
        })
    }

    // Calculate Collection Total

    function calculateCollectionTotal() {
        let collectionTotal = 0

        collectionCards.forEach(card => {
            collectionTotal = collectionTotal + card.marketValue;
        })
       
        totalMarketValueDisplay.textContent = `$${collectionTotal.toFixed(2)}`;
        collectionCardCountDisplay.textContent = collectionCards.length;

        if (collectionCards.length === 0) {
            averageCardValueDisplay.textContent = "$0.00";
        } else {
            let averageCardValue = collectionTotal / collectionCards.length;
            averageCardValueDisplay.textContent = `$${averageCardValue.toFixed(2)}`;
        }

        return collectionTotal;
    }

    // Calculate Collection Offer

    function calculateCollectionOffer(percentage) {
        let collectionTotal = calculateCollectionTotal();
        percentage = percentage / 100;
        let collectionOffer = collectionTotal * percentage;
        collectionOfferDisplay.textContent = `$${collectionOffer.toFixed(2)}`;
        
        if (collectionCards.length === 0) {
            collectionProfitDisplay.textContent = "$0.00";
        } else {
            let collectionPotentialProfit = collectionTotal - collectionOffer;
            collectionProfitDisplay.textContent = `$${collectionPotentialProfit.toFixed(2)}`;
        }

        return collectionOffer;
    }

    // Calculate Expected Sale Value

    function calculateExpectedSaleValue() {
        let currentCollectionTotal = calculateCollectionTotal();

        if (selectedSellPercentage === null) {
            expectedSaleValueDisplay.textContent = "$0.00";
            return 0;
        }

        let selectedSellPercentageDecimal = selectedSellPercentage / 100;

        let expectedSaleValue = currentCollectionTotal * selectedSellPercentageDecimal;

        expectedSaleValueDisplay.textContent = `$${expectedSaleValue.toFixed(2)}`;

        return expectedSaleValue;
    }

    // Calculate Expected Profit

    function calculateExpectedProfit() {
        if (selectedSellPercentage === null || selectedCollectionPercentage === null) {
            expectedProfitDisplay.textContent = "$0.00"
            return 0
        }

        let expectedSaleValue = calculateExpectedSaleValue();
        let collectionOffer = calculateCollectionOffer(selectedCollectionPercentage);
        let expectedProfit = expectedSaleValue - collectionOffer;

        expectedProfitDisplay.textContent = `$${expectedProfit.toFixed(2)}`;

        return expectedProfit;
    }

    // Calculate Expected ROI

    function calculateExpectedRoi() {
        if (selectedCollectionPercentage === null || selectedSellPercentage === null) {
            expectedRoiDisplay.textContent = "0.00%";
            return;
        }

        let expectedProfit = calculateExpectedProfit();
        let collectionOffer = calculateCollectionOffer(selectedCollectionPercentage);

        if (collectionOffer === 0) {
            expectedRoiDisplay.textContent = "0.00%";
            return;
        }

        let expectedRoi = expectedProfit / collectionOffer * 100;

        expectedRoiDisplay.textContent = `${expectedRoi.toFixed(2)}%`;
    }

    // Calculate Expected Margin

    function calculateExpectedMargin() {
        if (selectedCollectionPercentage === null || selectedSellPercentage === null) {
            expectedMarginDisplay.textContent = "0.00%";
            return;
        }

        let expectedProfit = calculateExpectedProfit();
        let expectedSaleValue = calculateExpectedSaleValue();

        if (expectedSaleValue === 0) {
            expectedMarginDisplay.textContent = "0.00%";
            return;
        }

        let expectedMargin = expectedProfit / expectedSaleValue * 100;

        expectedMarginDisplay.textContent = `${expectedMargin.toFixed(2)}%`;
    }

    // Render Inventory Cards

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
            inventoryCardDiv.classList.add("inventory-card")
            inventoryCardDiv.textContent = `${card.name} - $${card.purchaseCost.toFixed(2)} - 
                $${card.marketValue.toFixed(2)} - $${card.askingPrice.toFixed(2)} - 
                ${card.location} - ${card.status} - 
                ${finalValueDisplay} - ${notesDisplay}`;

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
            })

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

                inventoryCardDiv.appendChild(markSoldButton);
                inventoryCardDiv.appendChild(markTradedButton);
            }

            inventoryCardDiv.appendChild(editButton);
            inventoryCardDiv.appendChild(deleteButton);
            inventoryCardsContainer.appendChild(inventoryCardDiv);      
        })
    }

    // Calculate Inventory Summary Function

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

    // Mark Inventory Card Function

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
    }

    // Render Active Show

    function renderActiveShow() {
        activeShowContainer.innerHTML = "";

        if (activeShow === null) {
            return;
        }

        const showDiv = document.createElement("div");
        showDiv.textContent = `${activeShow.name} - ${activeShow.date} - $${activeShow.startingCash.toFixed(2)} - ${activeShow.notes}`;

        activeShowContainer.appendChild(showDiv);
    }

    // Populate Sale Inventory Dropdown Function

    function populateSaleInventoryDropdown() {
        salesInventoryCardDropdown.innerHTML = `<option value="not-from-inventory">Not From Inventory</option>`;

        inventoryCards.forEach((card, index) => {
            if (card.status === "available") {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = `${card.name} - $${card.askingPrice.toFixed(2)}`;
                salesInventoryCardDropdown.appendChild(option);
            }
        })
    }

    // Render Sales Function

    function renderSales() {
        salesContainer.innerHTML = "";

        for (const sale of sales) {
            const saleDiv = document.createElement("div");
            saleDiv.textContent = `${sale.card} - $${sale.price.toFixed(2)} - ${sale.paymentType} - ${sale.notes}`;

            salesContainer.appendChild(saleDiv);
        }
    }

    // Render Purchases Function

    function renderPurchases() {
        purchasesContainer.innerHTML = "";

        for (const purchase of purchases) {
            const marketValueDisplay = purchase.marketValue !== null && purchase.marketValue !== undefined
                ? `$${purchase.marketValue.toFixed(2)}`
                : "N/A";

            const locationDisplay = purchase.location && purchase.location !== ""
                ? purchase.location
                : "N/A";

            const purchaseDiv = document.createElement("div");
            purchaseDiv.textContent = `${purchase.item} - $${purchase.price.toFixed(2)} - 
            ${purchase.type} - ${purchase.addedToInventory} - 
            ${marketValueDisplay} - ${locationDisplay} - ${purchase.notes}`;

            purchasesContainer.appendChild(purchaseDiv);
        }
    }

    // Render Trades Function

    function renderTrades() {
        tradesContainer.innerHTML = "";

        for (const trade of trades) {
            const tradeDiv = document.createElement("div");
            tradeDiv.textContent = `${trade.description} - Given: $${trade.valueGiven.toFixed(2)} - 
                Received: $${trade.valueReceived.toFixed(2)} - Difference: $${trade.difference.toFixed(2)} - 
                Cash: ${trade.cashAddedBy} $${trade.cashAmount.toFixed(2)}`;

            tradesContainer.appendChild(tradeDiv);
        }
    }
    
    // Main

    loadSavedSettings();
    loadSettingsForm();
    applyDefaultSettings();

    loadSavedCollection();
    renderCollectionCards();
    calculateCollectionTotal();

    loadSavedInventory();
    renderInventoryCards();
    calculateInventorySummary();

    loadActiveShow();
    renderActiveShow();

    loadSavedSales();
    populateSaleInventoryDropdown();
    renderSales();

    loadSavedPurchases();
    renderPurchases();

    loadSavedTrades();
    renderTrades();

    if (selectedCollectionPercentage !== null) {
        calculateCollectionOffer(selectedCollectionPercentage);
    }

    // Buy Calculator

    buyPercentageBtns.forEach(button => {
        button.addEventListener("click", (event) => {
            buyPercentageBtns.forEach(btn => {
                btn.classList.remove("selected-percentage");                    
            })

            const percentage = event.target.dataset.percentage;
            button.classList.add("selected-percentage")
            buyPercentageInput.value = percentage;

            calculateBuyOffer();
        })
    })

    buyMarketValueInput.addEventListener("input", () => {
        calculateBuyOffer();
    })

    buyPercentageInput.addEventListener("input", () => {
        buyPercentageBtns.forEach(button => {
            button.classList.remove("selected-percentage");
        })
        calculateBuyOffer();        
    })

    buyCalculator.addEventListener("submit", function(event) {
        event.preventDefault();

        calculateBuyOffer();
    })

    // Trade Calculator

    tradePercentageBtns.forEach(button => {
        button.addEventListener("click", (event) => {
            tradePercentageBtns.forEach(btn => {
                btn.classList.remove("selected-percentage");
            })

            const percentage = event.target.dataset.percentage;
            button.classList.add("selected-percentage");
            tradePercentageInput.value = percentage;

            calculateTradeOffer();
        })
    })

    tradeMarketValueInput.addEventListener("input", () => {
        calculateTradeOffer();
    })

    tradePercentageInput.addEventListener("input", () => {
        tradePercentageBtns.forEach(button => {
            button.classList.remove("selected-percentage");
        })
        
        calculateTradeOffer();
    })

    tradeCalculator.addEventListener("submit", function(event) {
        event.preventDefault();

        calculateTradeOffer();
    })

    // Profit Calculator

    purchaseCostInput.addEventListener("input", () => {
        calculateProfit();
    })

    salePriceInput.addEventListener("input", () => {
        calculateProfit();
    })

    profitCalculator.addEventListener("submit", function(event) {
        event.preventDefault();

        calculateProfit();
    })

    // Pricing Tool

    pricingMarketValueInput.addEventListener("input", () => {
        calculateSuggestedPrice();
    })

    pricingCalculator.addEventListener("submit", function(event) {
        event.preventDefault();

        calculateSuggestedPrice();
    })

    // Collection Form Submit Handler

    collectionBuyEvaluator.addEventListener("submit", function(event) {
        event.preventDefault();

        let cardName = cardNameInput.value.trim();
        let cardMarketValue = Number(cardMarketValueInput.value);

        if (cardName === "" || cardMarketValueInput.value === "") {
            return;
        }

        if (cardMarketValue < 0) {
            return;
        }

        let card = {
            name: cardName,
            marketValue: cardMarketValue
        }

        if (editingCardIndex !== null) {
            collectionCards[editingCardIndex] = card
        } else {
            collectionCards.push(card); 
        }
        localStorage.setItem("collectionCards", JSON.stringify(collectionCards));
        editingCardIndex = null;
        collectionSubmitButton.textContent = "Add Card";
        cancelEditButton.hidden = true
        
        renderCollectionCards();
        calculateCollectionTotal();

        if (selectedCollectionPercentage !== null) {
            calculateCollectionOffer(selectedCollectionPercentage);
        }

        if (selectedSellPercentage !== null) {
            calculateExpectedSaleValue();
        }

        if (selectedSellPercentage !== null && selectedCollectionPercentage !== null) {
            calculateExpectedProfit();
            calculateExpectedRoi();
            calculateExpectedMargin();
        }

        cardNameInput.value = "";
        cardMarketValueInput.value = "";
    })

    // Collection Percentage Buttons

    collectionPercentageBtns.forEach(button => {
        button.addEventListener("click", (event) => {
            collectionPercentageBtns.forEach(btn => {
                btn.classList.remove("selected-percentage");
            })

            button.classList.add("selected-percentage");

            let percentage = Number(event.target.dataset.percentage);
            selectedCollectionPercentage = percentage

            calculateCollectionOffer(percentage);
            calculateExpectedProfit();
            calculateExpectedRoi();
            calculateExpectedMargin();
        })
    })

    // Clear Collection Button

    clearCollectionButton.addEventListener("click", () => {
        const confirmed = confirm("Are you sure you want to clear the collection?");
        if (!confirmed) {
            return;
        }

        collectionCards = [];

        localStorage.setItem("collectionCards", JSON.stringify(collectionCards));
        collectionOfferDisplay.textContent = "$0.00";
        collectionProfitDisplay.textContent = "$0.00";
        expectedSaleValueDisplay.textContent = "$0.00";
        expectedProfitDisplay.textContent = "$0.00";
        expectedRoiDisplay.textContent = "0.00%";
        expectedMarginDisplay.textContent = "0.00%";

        editingCardIndex = null;
        collectionSubmitButton.textContent = "Add Card";
        cancelEditButton.hidden = true;
        cardNameInput.value = "";
        cardMarketValueInput.value = "";

        renderCollectionCards();
        calculateCollectionTotal();
    })

    // Sell Percentage Buttons

    sellPercentageBtns.forEach(button => {
        button.addEventListener("click", (event) => {
            sellPercentageBtns.forEach(btn => {
                btn.classList.remove("selected-percentage");
            })
            button.classList.add("selected-percentage");

            let percentage = Number(event.target.dataset.percentage);
            selectedSellPercentage = percentage;

            calculateExpectedSaleValue();
            calculateExpectedProfit();
            calculateExpectedRoi();
            calculateExpectedMargin();
        })
    })

    // Inventory Form

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

        let inventoryCard = {
            name: inventoryCardName,
            purchaseCost: inventoryPurchaseCost,
            marketValue: inventoryMarketValue,
            askingPrice: inventoryAskingPrice,
            location: inventoryLocation,
            status: inventoryStatus,
            finalValue: inventoryFinalValue,
            notes: inventoryNotes
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
        populateSaleInventoryDropdown();

        inventoryCardNameInput.value = "";
        inventoryPurchaseCostInput.value = "";
        inventoryMarketValueInput.value = "";
        inventoryAskingPriceInput.value = "";
        inventoryLocationDropdown.value = "";
        inventoryStatusDropdown.value = "available";
        inventoryFinalValueInput.value = "";
        inventoryNotesInput.value = "";
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

    // Show Form

    showSessionForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let showName = showNameInput.value.trim();
        let showDate = showDateInput.value;
        let startingCash = Number(showStartingCashInput.value);
        let showNotes = showNotesInput.value.trim();

        if (showName === "" || showName === null) {
            return;
        }

        if (showDate === "" || showDate === null) {
            return;
        }

        if (showStartingCashInput.value === "" || showStartingCashInput.value === null) {
            return;
        }

        if (startingCash < 0) {
            return;
        }

        const show = {
            name: showName,
            date: showDate,
            startingCash: startingCash,
            notes: showNotes
        }

        activeShow = show;

        localStorage.setItem("activeShow", JSON.stringify(activeShow));

        renderActiveShow();

        showNameInput.value = "";
        showDateInput.value = "";
        showStartingCashInput.value = "";
        showNotesInput.value = "";
    })

    // Sales Form

    salesForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let cardName = salesItemNameInput.value.trim();
        let salePrice = Number(salesPriceInput.value);
        let paymentType = salesPaymentTypeDropdown.value;
        let inventoryCard = salesInventoryCardDropdown.value;
        let salesNotes = salesNotesInput.value.trim();
        let inventoryIndex = null;

        if (cardName === "") {
            return;
        }

        if (salesPriceInput.value === "" || salePrice < 0) {
            return;
        }

        if (inventoryCard === "not-from-inventory") {
            inventoryIndex = null;
        } else {
            inventoryIndex = Number(inventoryCard);
        }

        let sale = {
            card: cardName,
            price: salePrice,
            paymentType: paymentType,
            inventoryIndex: inventoryIndex,
            notes: salesNotes
        }

        sales.push(sale);
        localStorage.setItem("sales", JSON.stringify(sales));

        if (inventoryIndex !== null) {
            inventoryCards[inventoryIndex].status = "sold";
            inventoryCards[inventoryIndex].finalValue = salePrice;

            localStorage.setItem("inventoryCards", JSON.stringify(inventoryCards))

            renderInventoryCards();
            calculateInventorySummary();
            populateSaleInventoryDropdown();
        }

        renderSales();

        salesItemNameInput.value = "";
        salesPriceInput.value = "";
        salesPaymentTypeDropdown.value = "cash";
        salesInventoryCardDropdown.value = "not-from-inventory";
        salesNotesInput.value = "";
    })

    // Purchase Form

    purchaseForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let purchaseItemName = purchaseItemNameInput.value.trim();
        let purchasePrice = Number(purchasePriceInput.value);
        let purchaseType = purchaseTypeDropdown.value;
        let purchaseAddToInventory = purchaseAddToInventoryDropdown.value;
        let purchaseMarketValue = Number(purchaseMarketValueInput.value);
        let purchaseInventoryLocation = purchaseInventoryLocationDropdown.value;
        let purchaseNotes = purchaseNotesInput.value.trim();

        if (purchaseItemName === "") {
            return;
        }

        if (purchasePriceInput.value === "" || purchasePrice < 0) {
            return;
        }

        let purchaseRecordMarketValue = null;
        let purchaseRecordLocation = null;

        if (purchaseAddToInventory === "yes") {
            if (purchaseMarketValueInput.value === "" || purchaseMarketValue < 0) {
                return;
            }

            purchaseRecordMarketValue = purchaseMarketValue;
            purchaseRecordLocation = purchaseInventoryLocation;

            let purchaseInventoryCard = {
                name: purchaseItemName,
                purchaseCost: purchasePrice,
                marketValue: purchaseRecordMarketValue,
                askingPrice: purchaseRecordMarketValue,
                location: purchaseRecordLocation,
                status: "available",
                finalValue: null,
                notes: purchaseNotes
            }

            inventoryCards.push(purchaseInventoryCard);
            localStorage.setItem("inventoryCards", JSON.stringify(inventoryCards));

            renderInventoryCards();
            calculateInventorySummary();
            populateSaleInventoryDropdown();
        }

        let purchase = {
            item: purchaseItemName,
            price: purchasePrice,
            type: purchaseType,
            addedToInventory: purchaseAddToInventory,
            marketValue: purchaseRecordMarketValue,
            location: purchaseRecordLocation,
            notes: purchaseNotes
        }

        purchases.push(purchase);
        localStorage.setItem("purchases", JSON.stringify(purchases))

        renderPurchases();

        purchaseItemNameInput.value = "";
        purchasePriceInput.value = "";
        purchaseTypeDropdown.value = "cash";
        purchaseAddToInventoryDropdown.value = "yes";
        purchaseMarketValueInput.value = "";
        purchaseInventoryLocationDropdown.value = "1-5-binder";
        purchaseNotesInput.value = "";
    })

    // Trade Form

    tradeForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let tradeDescription = tradeDescriptionInput.value.trim();
        let valueGiven = Number(valueGivenInput.value);
        let valueReceived = Number(valueReceivedInput.value);
        let tradeCashAddedBy = tradeCashAddedByDropdown.value;
        let tradeCashAmount = Number(tradeCashAmountInput.value);
        let tradeNotes = tradeNotesInput.value.trim();

        if (tradeDescription === "") {
            return;
        }

        if (valueGivenInput.value === "" || valueGiven < 0) {
            return;
        }

        if (valueReceivedInput.value === "" || valueReceived < 0) {
            return;
        }

        if (tradeCashAmount < 0) {
            return;
        }

        if (tradeCashAddedBy === "none") {
            tradeCashAmount = 0;
        }

        if (tradeCashAddedBy !== "none") {
            if (tradeCashAmountInput.value === "") {
                return;
            }
        }

        let difference = valueReceived - valueGiven;

        let trade = {
            description: tradeDescription,
            valueGiven: valueGiven,
            valueReceived: valueReceived,
            difference: difference,
            cashAddedBy: tradeCashAddedBy,
            cashAmount: tradeCashAmount,
            notes: tradeNotes
        }

        trades.push(trade);
        localStorage.setItem("trades", JSON.stringify(trades));

        renderTrades();

        tradeDescriptionInput.value = "";
        valueGivenInput.value = "";
        valueReceivedInput.value = "";
        tradeCashAddedByDropdown.value = "none";
        tradeCashAmountInput.value = "";
        tradeNotesInput.value = "";
    })

    // Settings

    settingsForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let defaultBuyPercentage = Number(defaultBuyPercentageInput.value);
        let defaultTradePercentage = Number(defaultTradePercentageInput.value);
        let defaultCollectionPercentage = Number(defaultCollectionPercentageInput.value);

        if (defaultBuyPercentageInput.value === "" || defaultTradePercentageInput.value === "" || defaultCollectionPercentageInput.value === "") {
            return;
        }

        if (defaultBuyPercentage < 0 || defaultTradePercentage < 0 || defaultCollectionPercentage < 0) {
            return;
        }

        if (defaultBuyPercentage > 100 || defaultTradePercentage > 100 || defaultCollectionPercentage > 100) {
            return;
        }

        settings.defaultBuyPercentage = defaultBuyPercentage;
        settings.defaultTradePercentage = defaultTradePercentage;
        settings.defaultCollectionPercentage = defaultCollectionPercentage;

        applyDefaultSettings();

        localStorage.setItem("dealerSettings", JSON.stringify(settings));
    })
})