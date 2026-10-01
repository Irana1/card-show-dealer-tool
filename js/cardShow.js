export function initializeCardShow(options) {
    const {
        getInventoryCards,
        markInventorySold,
        addInventoryCard,
        onInventoryChanged,
        onAnalyticsChanged
    } = options

    const showSessionForm = document.querySelector("#show-session-form");
    const showNameInput = document.querySelector("#show-name");
    const showDateInput = document.querySelector("#show-date");
    const showStartingCashInput = document.querySelector("#show-starting-cash");
    const showNotesInput = document.querySelector("#show-notes");
    const activeShowContainer = document.querySelector("#active-show-container");
    const endShowButton = document.querySelector("#end-show-button");
    const showHistoryContainer = document.querySelector("#show-history-container");

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

    const showTotalSales = document.querySelector("#show-total-sales");
    const showTotalPurchases = document.querySelector("#show-total-purchases");
    const showNetCashFlow = document.querySelector("#show-net-cash-flow");
    const showSalesCount = document.querySelector("#show-sales-count");
    const showPurchaseCount = document.querySelector("#show-purchase-count");
    const showTradeCount = document.querySelector("#show-trade-count");
    const showEstimatedCash = document.querySelector("#show-estimated-cash");

    let activeShow = null;
    let showHistory = [];
    let sales = [];
    let purchases = [];
    let trades = [];

    function loadActiveShow() {
        const savedActiveShow = localStorage.getItem("activeShow");
        if (savedActiveShow) {
            const activeShowParsed = JSON.parse(savedActiveShow);
            activeShow = activeShowParsed;
        }
    }

    function loadShowHistory() {
        const savedShowHistory = localStorage.getItem("showHistory");
        if (savedShowHistory) {
            const showHistoryParsed = JSON.parse(savedShowHistory);
            showHistory = showHistoryParsed;
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

    function renderActiveShow() {
        activeShowContainer.innerHTML = "";

        if (activeShow === null) {
            return;
        }

        const showDiv = document.createElement("div");
        showDiv.classList.add("active-show-card");

        const showName = document.createElement("span");
        showName.classList.add("active-show-name");
        showName.textContent = activeShow.name;

        const showInfo = document.createElement("div");
        showInfo.classList.add("active-show-info");

        const details = [
            ["Date", activeShow.date],
            ["Starting Cash", `$${activeShow.startingCash.toFixed(2)}`],
            ["Notes", activeShow.notes || "N/A"]
        ];

        for (const [label, value] of details) {
            const labelElement = document.createElement("span");
            labelElement.classList.add("active-show-label");
            labelElement.textContent = `${label}:`;

            const valueElement = document.createElement("span");
            valueElement.classList.add("active-show-value");
            valueElement.textContent = value;

            showInfo.appendChild(labelElement);
            showInfo.appendChild(valueElement);
        }

        showDiv.appendChild(showName);
        showDiv.appendChild(showInfo);

        activeShowContainer.appendChild(showDiv);
    }

    function renderShowHistory() {
        showHistoryContainer.innerHTML = "";

        for (const show of showHistory) {
            const showDiv = document.createElement("div");
            showDiv.classList.add("show-history-card");

            const showHistoryNameSpan = document.createElement("span");
            showHistoryNameSpan.classList.add("show-history-name");
            showHistoryNameSpan.textContent = `${show.name}`;

            const showHistoryInfoDiv = document.createElement("div");
            showHistoryInfoDiv.classList.add("show-history-info");
            
            const showHistoryDateLabel = document.createElement("span");
            showHistoryDateLabel.classList.add("show-history-label");
            showHistoryDateLabel.textContent = "Date: ";
            const showHistoryDateSpan = document.createElement("span");
            showHistoryDateSpan.classList.add("show-history-value");
            showHistoryDateSpan.textContent = `${show.date}`;
            showHistoryInfoDiv.appendChild(showHistoryDateLabel);
            showHistoryInfoDiv.appendChild(showHistoryDateSpan);

            const showHistoryStartingCashLabel = document.createElement("span");
            showHistoryStartingCashLabel.classList.add("show-history-label");
            showHistoryStartingCashLabel.textContent = "Starting Cash: ";
            const showHistoryStartingCashSpan = document.createElement("span");
            showHistoryStartingCashSpan.classList.add("show-history-value");
            showHistoryStartingCashSpan.textContent = `$${show.startingCash.toFixed(2)}`;
            showHistoryInfoDiv.appendChild(showHistoryStartingCashLabel);
            showHistoryInfoDiv.appendChild(showHistoryStartingCashSpan);

            const showHistoryTotalSalesLabel = document.createElement("span");
            showHistoryTotalSalesLabel.classList.add("show-history-label");
            showHistoryTotalSalesLabel.textContent = "Total Sales: ";
            const showHistoryTotalSalesSpan = document.createElement("span");
            showHistoryTotalSalesSpan.classList.add("show-history-value");
            showHistoryTotalSalesSpan.textContent = `$${show.totalSales.toFixed(2)}`;
            showHistoryInfoDiv.appendChild(showHistoryTotalSalesLabel);
            showHistoryInfoDiv.appendChild(showHistoryTotalSalesSpan);

            const showHistoryTotalPurchasesLabel = document.createElement("span");
            showHistoryTotalPurchasesLabel.classList.add("show-history-label");
            showHistoryTotalPurchasesLabel.textContent = "Total Purchases: ";
            const showHistoryTotalPurchasesSpan = document.createElement("span");
            showHistoryTotalPurchasesSpan.classList.add("show-history-value");
            showHistoryTotalPurchasesSpan.textContent = `$${show.totalPurchases.toFixed(2)}`;
            showHistoryInfoDiv.appendChild(showHistoryTotalPurchasesLabel);
            showHistoryInfoDiv.appendChild(showHistoryTotalPurchasesSpan);
            
            const showHistoryNetCashFlowLabel = document.createElement("span");
            showHistoryNetCashFlowLabel.classList.add("show-history-label");
            showHistoryNetCashFlowLabel.textContent = "Net Cash Flow: ";
            const showHistoryNetCashFlowSpan = document.createElement("span");
            showHistoryNetCashFlowSpan.classList.add("show-history-value");
            showHistoryNetCashFlowSpan.textContent = `$${show.netCashFlow.toFixed(2)}`;
            showHistoryInfoDiv.appendChild(showHistoryNetCashFlowLabel);
            showHistoryInfoDiv.appendChild(showHistoryNetCashFlowSpan);
            
            const showHistoryEndingCashLabel = document.createElement("span");
            showHistoryEndingCashLabel.classList.add("show-history-label");
            showHistoryEndingCashLabel.textContent = "Ending Cash: ";
            const showHistoryEndingCashSpan = document.createElement("span");
            showHistoryEndingCashSpan.classList.add("show-history-value");
            showHistoryEndingCashSpan.textContent = `$${show.endingCash.toFixed(2)}`;
            showHistoryInfoDiv.appendChild(showHistoryEndingCashLabel);
            showHistoryInfoDiv.appendChild(showHistoryEndingCashSpan);

            const showHistorySalesCountLabel = document.createElement("span");
            showHistorySalesCountLabel.classList.add("show-history-label");
            showHistorySalesCountLabel.textContent = "Sales Count: ";
            const showHistorySalesCountSpan = document.createElement("span");
            showHistorySalesCountSpan.classList.add("show-history-value");
            showHistorySalesCountSpan.textContent = `${show.salesCount}`;
            showHistoryInfoDiv.appendChild(showHistorySalesCountLabel);
            showHistoryInfoDiv.appendChild(showHistorySalesCountSpan);

            const showHistoryPurchaseCountLabel = document.createElement("span");
            showHistoryPurchaseCountLabel.classList.add("show-history-label");
            showHistoryPurchaseCountLabel.textContent = "Purchase Count: ";
            const showHistoryPurchaseCountSpan = document.createElement("span");
            showHistoryPurchaseCountSpan.classList.add("show-history-value");
            showHistoryPurchaseCountSpan.textContent = `${show.purchaseCount}`;
            showHistoryInfoDiv.appendChild(showHistoryPurchaseCountLabel);
            showHistoryInfoDiv.appendChild(showHistoryPurchaseCountSpan);

            const showHistoryTradeCountLabel = document.createElement("span");
            showHistoryTradeCountLabel.classList.add("show-history-label");
            showHistoryTradeCountLabel.textContent = "Trade Count: ";
            const showHistoryTradeCountSpan = document.createElement("span");
            showHistoryTradeCountSpan.classList.add("show-history-value");
            showHistoryTradeCountSpan.textContent = `${show.tradeCount}`;
            showHistoryInfoDiv.appendChild(showHistoryTradeCountLabel);
            showHistoryInfoDiv.appendChild(showHistoryTradeCountSpan);

            const showHistoryNotesLabel = document.createElement("span");
            showHistoryNotesLabel.classList.add("show-history-label");
            showHistoryNotesLabel.textContent = "Notes: ";
            const showHistoryNotesSpan = document.createElement("span");
            showHistoryNotesSpan.classList.add("show-history-value");
            if (show.notes === null || show.notes === "") {
                showHistoryNotesSpan.textContent = "N/A";
            } else {
                showHistoryNotesSpan.textContent = `${show.notes}`;
            }
            showHistoryInfoDiv.appendChild(showHistoryNotesLabel);
            showHistoryInfoDiv.appendChild(showHistoryNotesSpan);

            showDiv.appendChild(showHistoryNameSpan);
            showDiv.appendChild(showHistoryInfoDiv);
            showHistoryContainer.appendChild(showDiv)
        }
    }

    function renderSales() {
        salesContainer.innerHTML = "";

        for (const sale of sales) {
            const saleDiv = document.createElement("div");
            saleDiv.classList.add("sale-card");

            const saleCardNameSpan = document.createElement("span");
            saleCardNameSpan.classList.add("sale-card-name");
            saleCardNameSpan.textContent = `${sale.card}`;

            const saleCardInfoDiv = document.createElement("div");
            saleCardInfoDiv.classList.add("sale-card-info")

            const saleSalePriceLabel = document.createElement("span");
            saleSalePriceLabel.classList.add("sale-card-label");
            saleSalePriceLabel.textContent = "Sale Price: ";
            const saleSalePriceSpan = document.createElement("span");
            saleSalePriceSpan.classList.add("sale-card-value");
            saleSalePriceSpan.textContent = `$${sale.price.toFixed(2)}`;
            saleCardInfoDiv.appendChild(saleSalePriceLabel);
            saleCardInfoDiv.appendChild(saleSalePriceSpan);

            const salePaymentTypeLabel = document.createElement("span");
            salePaymentTypeLabel.classList.add("sale-card-label");
            salePaymentTypeLabel.textContent = "Payment Type: ";
            const salePaymentTypeSpan = document.createElement("span");
            salePaymentTypeSpan.classList.add("sale-card-value");
            salePaymentTypeSpan.textContent = `${sale.paymentType}`;
            saleCardInfoDiv.appendChild(salePaymentTypeLabel);
            saleCardInfoDiv.appendChild(salePaymentTypeSpan);

            const saleInventorySaleLabel = document.createElement("span");
            saleInventorySaleLabel.classList.add("sale-card-label");
            saleInventorySaleLabel.textContent = "Inventory Sale: ";
            const saleInventorySaleSpan = document.createElement("span");
            saleInventorySaleSpan.classList.add("sale-card-value");
            if (sale.inventoryIndex !== null) {
                saleInventorySaleSpan.textContent = "Yes";
            } else {
                saleInventorySaleSpan.textContent = "No";
            }
            saleCardInfoDiv.appendChild(saleInventorySaleLabel);
            saleCardInfoDiv.appendChild(saleInventorySaleSpan);

            const saleNotesLabel = document.createElement("span");
            saleNotesLabel.classList.add("sale-card-label");
            saleNotesLabel.textContent = "Notes: ";
            const saleNotesSpan = document.createElement("span");
            saleNotesSpan.classList.add("sale-card-value");
            if (sale.notes === "") {
                saleNotesSpan.textContent = "N/A";
            } else {
                saleNotesSpan.textContent = sale.notes;
            }
            saleCardInfoDiv.appendChild(saleNotesLabel);
            saleCardInfoDiv.appendChild(saleNotesSpan);

            saleDiv.appendChild(saleCardNameSpan);
            saleDiv.appendChild(saleCardInfoDiv);
            salesContainer.appendChild(saleDiv);
        }
    }

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
            purchaseDiv.classList.add("purchase-card");

            const purchaseCardNameSpan = document.createElement("span");
            purchaseCardNameSpan.classList.add("purchase-card-name");
            purchaseCardNameSpan.textContent = `${purchase.item}`;

            const purchaseCardInfoDiv = document.createElement("div");
            purchaseCardInfoDiv.classList.add("purchase-card-info");

            const purchasePurchasePriceLabel = document.createElement("span");
            purchasePurchasePriceLabel.classList.add("purchase-card-label");
            purchasePurchasePriceLabel.textContent = "Purchase Price: ";
            const purchasePurchasePriceSpan = document.createElement("span");
            purchasePurchasePriceSpan.classList.add("purchase-card-value");
            purchasePurchasePriceSpan.textContent = `$${purchase.price.toFixed(2)}`;
            purchaseCardInfoDiv.appendChild(purchasePurchasePriceLabel);
            purchaseCardInfoDiv.appendChild(purchasePurchasePriceSpan);

            const purchasePaymentTypeLabel = document.createElement("span");
            purchasePaymentTypeLabel.classList.add("purchase-card-label");
            purchasePaymentTypeLabel.textContent = "Payment Type: ";
            const purchasePaymentTypeSpan = document.createElement("span");
            purchasePaymentTypeSpan.classList.add("purchase-card-value");
            purchasePaymentTypeSpan.textContent = `${purchase.type}`;
            purchaseCardInfoDiv.appendChild(purchasePaymentTypeLabel);
            purchaseCardInfoDiv.appendChild(purchasePaymentTypeSpan);

            const purchaseAddedToInventoryLabel = document.createElement("span");
            purchaseAddedToInventoryLabel.classList.add("purchase-card-label");
            purchaseAddedToInventoryLabel.textContent = "Added to Inventory?: ";
            const purchaseAddedToInventorySpan = document.createElement("span");
            purchaseAddedToInventorySpan.classList.add("purchase-card-value");
            purchaseAddedToInventorySpan.textContent = `${purchase.addedToInventory}`;
            purchaseCardInfoDiv.appendChild(purchaseAddedToInventoryLabel);
            purchaseCardInfoDiv.appendChild(purchaseAddedToInventorySpan);

            const purchaseMarketValueLabel = document.createElement("span");
            purchaseMarketValueLabel.classList.add("purchase-card-label");
            purchaseMarketValueLabel.textContent = "Market Value: ";
            const purchaseMarketValueSpan = document.createElement("span");
            purchaseMarketValueSpan.classList.add("purchase-card-value");
            purchaseMarketValueSpan.textContent = `${marketValueDisplay}`;
            purchaseCardInfoDiv.appendChild(purchaseMarketValueLabel);
            purchaseCardInfoDiv.appendChild(purchaseMarketValueSpan);

            const purchaseLocationLabel = document.createElement("span");
            purchaseLocationLabel.classList.add("purchase-card-label");
            purchaseLocationLabel.textContent = "Location: ";
            const purchaseLocationSpan = document.createElement("span");
            purchaseLocationSpan.classList.add("purchase-card-value");
            if (purchase.location) {
                purchaseLocationSpan.textContent = `${locationDisplay}`;
            } else {
                purchaseLocationSpan.textContent = "N/A";
            }            
            purchaseCardInfoDiv.appendChild(purchaseLocationLabel);
            purchaseCardInfoDiv.appendChild(purchaseLocationSpan);

            const purchaseNotesLabel = document.createElement("span");
            purchaseNotesLabel.classList.add("purchase-card-label");
            purchaseNotesLabel.textContent = "Notes: ";
            const purchaseNotesSpan = document.createElement("span");
            purchaseNotesSpan.classList.add("purchase-card-value");
            if (purchase.notes === null || purchase.notes === "") {
                purchaseNotesSpan.textContent = "N/A";
            } else {
                purchaseNotesSpan.textContent = `${purchase.notes}`;
            }            
            purchaseCardInfoDiv.appendChild(purchaseNotesLabel);
            purchaseCardInfoDiv.appendChild(purchaseNotesSpan);

            purchaseDiv.appendChild(purchaseCardNameSpan);
            purchaseDiv.appendChild(purchaseCardInfoDiv);
            purchasesContainer.appendChild(purchaseDiv);
        }
    }

    function renderTrades() {
        tradesContainer.innerHTML = "";

        for (const trade of trades) {
            const tradeDiv = document.createElement("div");
            tradeDiv.classList.add("trade-card");

            const tradeCardNameSpan = document.createElement("span");
            tradeCardNameSpan.classList.add("trade-card-name");
            tradeCardNameSpan.textContent = `${trade.description}`;

            const tradeCardInfoDiv = document.createElement("div");
            tradeCardInfoDiv.classList.add("trade-card-info")

            const tradeValueGivenLabel = document.createElement("span");
            tradeValueGivenLabel.classList.add("trade-card-label");
            tradeValueGivenLabel.textContent = "Value Given: ";
            const tradeValueGivenSpan = document.createElement("span");
            tradeValueGivenSpan.classList.add("trade-card-value");
            tradeValueGivenSpan.textContent = `$${trade.valueGiven.toFixed(2)}`;
            tradeCardInfoDiv.appendChild(tradeValueGivenLabel);
            tradeCardInfoDiv.appendChild(tradeValueGivenSpan);

            const tradeValueReceivedLabel = document.createElement("span");
            tradeValueReceivedLabel.classList.add("trade-card-label");
            tradeValueReceivedLabel.textContent = "Value Received: ";
            const tradeValueReceivedSpan = document.createElement("span");
            tradeValueReceivedSpan.classList.add("trade-card-value");
            tradeValueReceivedSpan.textContent = `$${trade.valueReceived.toFixed(2)}`;
            tradeCardInfoDiv.appendChild(tradeValueReceivedLabel);
            tradeCardInfoDiv.appendChild(tradeValueReceivedSpan);
            
            const tradeDifferenceLabel = document.createElement("span");
            tradeDifferenceLabel.classList.add("trade-card-label");
            tradeDifferenceLabel.textContent = "Difference: ";
            const tradeDifferenceSpan = document.createElement("span");
            tradeDifferenceSpan.classList.add("trade-card-value");
            tradeDifferenceSpan.textContent = `$${trade.difference.toFixed(2)}`;
            tradeCardInfoDiv.appendChild(tradeDifferenceLabel);
            tradeCardInfoDiv.appendChild(tradeDifferenceSpan);
            
            const tradeCashAddedByLabel = document.createElement("span");
            tradeCashAddedByLabel.classList.add("trade-card-label");
            tradeCashAddedByLabel.textContent = "Cash Added By: ";
            const tradeCashAddedBySpan = document.createElement("span");
            tradeCashAddedBySpan.classList.add("trade-card-value");
            tradeCashAddedBySpan.textContent = `${trade.cashAddedBy}`;
            tradeCardInfoDiv.appendChild(tradeCashAddedByLabel);
            tradeCardInfoDiv.appendChild(tradeCashAddedBySpan);
            
            const tradeCashAmountLabel = document.createElement("span");
            tradeCashAmountLabel.classList.add("trade-card-label");
            tradeCashAmountLabel.textContent = "Cash Amount: ";
            const tradeCashAmountSpan = document.createElement("span");
            tradeCashAmountSpan.classList.add("trade-card-value");
            tradeCashAmountSpan.textContent = `$${trade.cashAmount.toFixed(2)}`;
            tradeCardInfoDiv.appendChild(tradeCashAmountLabel);
            tradeCardInfoDiv.appendChild(tradeCashAmountSpan);
            
            const tradeNotesLabel = document.createElement("span");
            tradeNotesLabel.classList.add("trade-card-label");
            tradeNotesLabel.textContent = "Notes: ";
            const tradeNotesSpan = document.createElement("span");
            tradeNotesSpan.classList.add("trade-card-value");
            if (trade.notes === null || trade.notes === "") {
                tradeNotesSpan.textContent = "N/A";
            } else {
                tradeNotesSpan.textContent = `${trade.notes}`;
            }
            tradeCardInfoDiv.appendChild(tradeNotesLabel);
            tradeCardInfoDiv.appendChild(tradeNotesSpan);            

            tradeDiv.appendChild(tradeCardNameSpan);
            tradeDiv.appendChild(tradeCardInfoDiv);
            tradesContainer.appendChild(tradeDiv);
        }
    }

    function calculateShowDashboard() {
        let totalSales = 0;
        let totalPurchases = 0;
        let netCashFlow = 0;
        let salesCount = sales.length;
        let purchaseCount = purchases.length;
        let tradeCount = trades.length;

        for (const sale of sales) {
            totalSales += sale.price;
            if (sale.paymentType === "cash") {
                netCashFlow += sale.price;
            }
        }

        for (const purchase of purchases) {
            totalPurchases += purchase.price;
            if (purchase.type === "cash") {
                netCashFlow -= purchase.price;
            }
        }

        for (const trade of trades) {
            if (trade.cashAddedBy === "customer") {
                netCashFlow += trade.cashAmount;
            }

            if (trade.cashAddedBy === "you") {
                netCashFlow -= trade.cashAmount;
            }
        }

        let startingCash = 0;

        if (activeShow) {
            startingCash = activeShow.startingCash;
        }

        let estimatedCash = startingCash + netCashFlow;

        showTotalSales.textContent = `$${totalSales.toFixed(2)}`;
        showTotalPurchases.textContent = `$${totalPurchases.toFixed(2)}`;
        showNetCashFlow.textContent = `$${netCashFlow.toFixed(2)}`;
        showSalesCount.textContent = `${salesCount}`;
        showPurchaseCount.textContent = `${purchaseCount}`;
        showTradeCount.textContent = `${tradeCount}`;
        showEstimatedCash.textContent = `${estimatedCash.toFixed(2)}`;
    }

    function populateSaleInventoryDropdown() {
        salesInventoryCardDropdown.innerHTML = `<option value="not-from-inventory">Not From Inventory</option>`;

        const inventoryCards = getInventoryCards();

        inventoryCards.forEach((card, index) => {
            if (card.status === "available") {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = `${card.name} - $${card.askingPrice.toFixed(2)}`;
                salesInventoryCardDropdown.appendChild(option);
            }
        })
    }

    showSessionForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let showName = showNameInput.value.trim();
        let showDate = showDateInput.value;
        let startingCash = Number(showStartingCashInput.value);
        let showNotes = showNotesInput.value.trim();

        if (activeShow !== null) {
            return;
        }

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
        calculateShowDashboard();

        showNameInput.value = "";
        showDateInput.value = "";
        showStartingCashInput.value = "";
        showNotesInput.value = "";
    })

    endShowButton.addEventListener("click", function() {
        if (activeShow) {
            let totalSales = 0;
            let totalPurchases = 0;
            let netCashFlow = 0;
            let startingCash = activeShow.startingCash;
            let estimatedCash = 0;

            for (const sale of sales) {
                totalSales += sale.price;
                if (sale.paymentType === "cash") {
                    netCashFlow += sale.price
                }
            }

            for (const purchase of purchases) {
                totalPurchases += purchase.price;
                if (purchase.type === "cash") {
                    netCashFlow -= purchase.price;
                }
            }

            for (const trade of trades) {
                if (trade.cashAddedBy === "customer") {
                    netCashFlow += trade.cashAmount;
                }

                if (trade.cashAddedBy === "you") {
                    netCashFlow -= trade.cashAmount;
                }
            }

            estimatedCash = startingCash + netCashFlow;

            let completedShow = {
                name: activeShow.name,
                date: activeShow.date,
                startingCash: activeShow.startingCash,
                notes: activeShow.notes,
                totalSales: totalSales,
                totalPurchases: totalPurchases,
                netCashFlow: netCashFlow,
                endingCash: estimatedCash,
                salesCount: sales.length,
                purchaseCount: purchases.length,
                tradeCount: trades.length,
                sales: [...sales],
                purchases: [...purchases],
                trades: [...trades]
            }

            showHistory.push(completedShow);
            localStorage.setItem("showHistory", JSON.stringify(showHistory));

            activeShow = null;
            localStorage.removeItem("activeShow");
            sales = [];
            purchases = [];
            trades = [];
            localStorage.setItem("sales", JSON.stringify(sales));
            localStorage.setItem("purchases", JSON.stringify(purchases));
            localStorage.setItem("trades", JSON.stringify(trades));

            activeShowContainer.innerHTML = "";
            salesContainer.innerHTML = "";
            purchasesContainer.innerHTML = "";
            tradesContainer.innerHTML = "";

            calculateShowDashboard();
            populateSaleInventoryDropdown();
            renderShowHistory();

            onAnalyticsChanged();
        }
    })

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
            markInventorySold(inventoryIndex, salePrice);

            populateSaleInventoryDropdown();

            onInventoryChanged();
            onAnalyticsChanged();
        }

        renderSales();
        calculateShowDashboard();

        salesItemNameInput.value = "";
        salesPriceInput.value = "";
        salesPaymentTypeDropdown.value = "cash";
        salesInventoryCardDropdown.value = "not-from-inventory";
        salesNotesInput.value = "";
    })

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

            addInventoryCard(purchaseInventoryCard);

            populateSaleInventoryDropdown();

            onInventoryChanged();
            onAnalyticsChanged();
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
        calculateShowDashboard();

        purchaseItemNameInput.value = "";
        purchasePriceInput.value = "";
        purchaseTypeDropdown.value = "cash";
        purchaseAddToInventoryDropdown.value = "yes";
        purchaseMarketValueInput.value = "";
        purchaseInventoryLocationDropdown.value = "1-5-binder";
        purchaseNotesInput.value = "";
    })

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
        calculateShowDashboard();

        tradeDescriptionInput.value = "";
        valueGivenInput.value = "";
        valueReceivedInput.value = "";
        tradeCashAddedByDropdown.value = "none";
        tradeCashAmountInput.value = "";
        tradeNotesInput.value = "";
    })

    loadActiveShow();
    renderActiveShow();

    loadSavedSales();
    populateSaleInventoryDropdown();
    renderSales();

    loadSavedPurchases();
    renderPurchases();

    loadSavedTrades();
    renderTrades();

    loadShowHistory();
    renderShowHistory();

    calculateShowDashboard();

    return {
        getShowHistory() {
            return showHistory;
        },

        getActiveShow() {
            return activeShow;
        },

        getSales() {
            return sales;
        },

        getPurchases() {
            return purchases;
        },

        getTrades() {
            return trades;
        },

        refreshSaleInventoryDropdown() {
            populateSaleInventoryDropdown();
        }
    };
}