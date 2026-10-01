export function initializeAnalytics({
    getInventoryCards,
    getShowHistory
}) {
    const businessTotalShowsDisplay = document.querySelector("#business-total-shows");
    const businessTotalSalesDisplay = document.querySelector("#business-total-sales");
    const businessTotalPurchasesDisplay = document.querySelector("#business-total-purchases");
    const businessNetCashFlowDisplay = document.querySelector("#business-net-cash-flow");
    const businessInventoryCostDisplay = document.querySelector("#business-inventory-cost");
    const businessInventoryMarketValueDisplay = document.querySelector("#business-inventory-market-value");
    const businessRealizedProfitDisplay = document.querySelector("#business-realized-profit");

    const showAverageSalesDisplay = document.querySelector("#show-average-sales");
    const showAveragePurchasesDisplay = document.querySelector("#show-average-purchases");
    const showAverageNetCashFlowDisplay = document.querySelector("#show-average-net-cash-flow");
    const showAverageSalesCountDisplay = document.querySelector("#show-average-sales-count");
    const showAveragePurchaseCountDisplay = document.querySelector("#show-average-purchase-count");
    const showAverageTradeCountDisplay = document.querySelector("#show-average-trade-count");

    const inventoryPerformanceAvailableDisplay = document.querySelector("#inventory-performance-available");
    const inventoryPerformanceSoldDisplay = document.querySelector("#inventory-performance-sold");
    const inventoryPerformanceTradedDisplay = document.querySelector("#inventory-performance-traded");
    const inventoryPerformanceAverageCostDisplay = document.querySelector("#inventory-performance-average-cost");
    const inventoryPerformanceAverageMarketValueDisplay = document.querySelector("#inventory-performance-average-market-value");
    const inventoryPerformanceAverageRealizedProfitDisplay = document.querySelector("#inventory-performance-average-realized-profit");
    
    const locationLowCountDisplay = document.querySelector("#location-1-5-count");
    const locationLowCostDisplay = document.querySelector("#location-1-5-cost");
    const locationLowMarketValueDisplay = document.querySelector("#location-1-5-market-value");
    const locationLowRealizedProfitDisplay = document.querySelector("#location-1-5-realized-profit");
    const locationMedCountDisplay = document.querySelector("#location-6-20-count");
    const locationMedCostDisplay = document.querySelector("#location-6-20-cost");
    const locationMedMarketValueDisplay = document.querySelector("#location-6-20-market-value");
    const locationMedRealizedProfitDisplay = document.querySelector("#location-6-20-realized-profit");
    const locationHighCountDisplay = document.querySelector("#location-21-plus-count");
    const locationHighCostDisplay = document.querySelector("#location-21-plus-cost");
    const locationHighMarketValueDisplay = document.querySelector("#location-21-plus-market-value");
    const locationHighRealizedProfitDisplay = document.querySelector("#location-21-plus-realized-profit");

    const showSalesChartCanvas = document.querySelector("#show-sales-chart");

    // State variables and Arrays

    let showSalesChart = null;

    // Calculate Business Dashboard Function

    function calculateBusinessDashBoard() {
        const inventoryCards = getInventoryCards()
        const showHistory = getShowHistory();

        let totalShows = showHistory.length;
        let lifeTimeSales = 0;
        let lifeTimePurchases = 0;
        let lifeTimeNetCashFlow = 0;
        let currentInventoryCost = 0;
        let currentInventoryMarketValue = 0;
        let realizedProfit = 0;

        for (const show of showHistory) {
            lifeTimeSales += show.totalSales;
            lifeTimePurchases += show.totalPurchases;
            lifeTimeNetCashFlow += show.netCashFlow;
        }

        for (const card of inventoryCards) {
            if (card.status === "available") {
                currentInventoryCost += card.purchaseCost;
                currentInventoryMarketValue += card.marketValue;
            }
    
            if (card.status === "sold" || card.status === "traded") {
                if (card.finalValue !== null) {
                    realizedProfit += card.finalValue - card.purchaseCost;
                }
            }
        }

        businessTotalShowsDisplay.textContent = `${totalShows}`;
        businessTotalSalesDisplay.textContent = `$${lifeTimeSales.toFixed(2)}`;
        businessTotalPurchasesDisplay.textContent = `$${lifeTimePurchases.toFixed(2)}`;
        businessNetCashFlowDisplay.textContent = `$${lifeTimeNetCashFlow.toFixed(2)}`;
        businessInventoryCostDisplay.textContent = `$${currentInventoryCost.toFixed(2)}`;
        businessInventoryMarketValueDisplay.textContent = `$${currentInventoryMarketValue.toFixed(2)}`;
        businessRealizedProfitDisplay.textContent = `$${realizedProfit.toFixed(2)}`;
    }

    // Calculate Show Performance Function

    function calculateShowPerformance() {
        const showHistory = getShowHistory();

        let totalSales = 0;
        let totalPurchases = 0;
        let totalNetCashFlow = 0;
        let totalSalesCount = 0;
        let totalPurchaseCount = 0;
        let totalTradeCount = 0;

        let averageTotalSales = 0;
        let averageTotalPurchases = 0;
        let averageNetCashFlow = 0;
        let averageSalesCount = 0;
        let averagePurchaseCount = 0;
        let averageTradeCount = 0;

        for (const show of showHistory) {
            totalSales += show.totalSales;
            totalPurchases += show.totalPurchases;
            totalNetCashFlow += show.netCashFlow;
            totalSalesCount += show.salesCount;
            totalPurchaseCount += show.purchaseCount;
            totalTradeCount += show.tradeCount;
        }

        let completedShowCount = showHistory.length;

        if (completedShowCount > 0) {
            averageTotalSales = totalSales / completedShowCount;
            averageTotalPurchases = totalPurchases / completedShowCount;
            averageNetCashFlow = totalNetCashFlow / completedShowCount;
            averageSalesCount = totalSalesCount / completedShowCount;
            averagePurchaseCount = totalPurchaseCount / completedShowCount;
            averageTradeCount = totalTradeCount / completedShowCount;
        } else {
            averageTotalSales = 0;
            averageTotalPurchases = 0;
            averageNetCashFlow = 0;
            averageSalesCount = 0;
            averagePurchaseCount = 0;
            averageTradeCount = 0;
        }

        showAverageSalesDisplay.textContent = `$${averageTotalSales.toFixed(2)}`;
        showAveragePurchasesDisplay.textContent = `$${averageTotalPurchases.toFixed(2)}`;
        showAverageNetCashFlowDisplay.textContent = `$${averageNetCashFlow.toFixed(2)}`;
        showAverageSalesCountDisplay.textContent = `${averageSalesCount.toFixed(2)}`;
        showAveragePurchaseCountDisplay.textContent = `${averagePurchaseCount.toFixed(2)}`;
        showAverageTradeCountDisplay.textContent = `${averageTradeCount.toFixed(2)}`;
    }

    // Calculate Inventory Performance Function

    function calculateInventoryPerformance() {
        const inventoryCards = getInventoryCards();

        let availableCount = 0;
        let soldCount = 0;
        let tradedCount = 0;
        let totalPurchaseCost = 0;
        let totalMarketValue = 0;
        let realizedProfitTotal = 0;
        let realizedCardCount = 0;

        for (const card of inventoryCards) {
            if (card.status === "available") {
                availableCount += 1;
            } else if (card.status === "sold") {
                soldCount += 1;
            } else if (card.status === "traded") {
                tradedCount += 1;
            }

            totalPurchaseCost += card.purchaseCost;
            totalMarketValue += card.marketValue;

            if ((card.status === "sold" || card.status === "traded") && card.finalValue !== null) {
                realizedProfitTotal += card.finalValue - card.purchaseCost;
                realizedCardCount += 1;
            }
        }

        let averagePurchaseCost = 0;
        let averageMarketValue = 0;
        let averageRealizedProfit = 0;

        if (inventoryCards.length > 0) {
            averagePurchaseCost = totalPurchaseCost / inventoryCards.length;
            averageMarketValue = totalMarketValue / inventoryCards.length; 
        }

        if (realizedCardCount > 0) {
            averageRealizedProfit = realizedProfitTotal / realizedCardCount;
        }

        inventoryPerformanceAvailableDisplay.textContent = `${availableCount}`;
        inventoryPerformanceSoldDisplay.textContent = `${soldCount}`;
        inventoryPerformanceTradedDisplay.textContent = `${tradedCount}`;
        inventoryPerformanceAverageCostDisplay.textContent = `$${averagePurchaseCost.toFixed(2)}`;
        inventoryPerformanceAverageMarketValueDisplay.textContent = `$${averageMarketValue.toFixed(2)}`;
        inventoryPerformanceAverageRealizedProfitDisplay.textContent = `$${averageRealizedProfit.toFixed(2)}`;
    }

    // Calculation Location Performance Function

    function calculateLocationPerformance() {
        const inventoryCards = getInventoryCards();

        let lowInventoryCount = 0;
        let lowInventoryCost = 0;
        let lowInventoryTotalMarketValue = 0;
        let lowInventoryRealizedProfit = 0;
        let medInventoryCount = 0;
        let medInventoryCost = 0;
        let medInventoryTotalMarketValue = 0;
        let medInventoryRealizedProfit = 0;
        let highInventoryCount = 0;
        let highInventoryCost = 0;
        let highInventoryTotalMarketValue = 0;
        let highInventoryRealizedProfit = 0;

        for (const card of inventoryCards) {
            if (card.location === "1-5-binder") {
                lowInventoryCount++;
                lowInventoryCost += card.purchaseCost;
                lowInventoryTotalMarketValue += card.marketValue;
                if ((card.status === "sold" || card.status === "traded") && card.finalValue !== null) {
                    lowInventoryRealizedProfit += card.finalValue - card.purchaseCost;
                }
            } else if (card.location === "6-20-toploader-binder") {
                medInventoryCount++;
                medInventoryCost += card.purchaseCost;
                medInventoryTotalMarketValue += card.marketValue;
                if ((card.status === "sold" || card.status === "traded") && card.finalValue !== null) {
                    medInventoryRealizedProfit += card.finalValue - card.purchaseCost;
                }
            } else if (card.location === "21-showcase") {
                highInventoryCount++;
                highInventoryCost += card.purchaseCost;
                highInventoryTotalMarketValue += card.marketValue;
                if ((card.status === "sold" || card.status === "traded") && card.finalValue !== null) {
                    highInventoryRealizedProfit += card.finalValue - card.purchaseCost;
                }
            }
        }

        locationLowCountDisplay.textContent = `${lowInventoryCount}`;
        locationLowCostDisplay.textContent = `$${lowInventoryCost.toFixed(2)}`;
        locationLowMarketValueDisplay.textContent = `$${lowInventoryTotalMarketValue.toFixed(2)}`
        locationLowRealizedProfitDisplay.textContent = `$${lowInventoryRealizedProfit.toFixed(2)}`
        locationMedCountDisplay.textContent = `${medInventoryCount}`;
        locationMedCostDisplay.textContent = `$${medInventoryCost.toFixed(2)}`;
        locationMedMarketValueDisplay.textContent = `$${medInventoryTotalMarketValue.toFixed(2)}`
        locationMedRealizedProfitDisplay.textContent = `$${medInventoryRealizedProfit.toFixed(2)}`
        locationHighCountDisplay.textContent = `${highInventoryCount}`;
        locationHighCostDisplay.textContent = `$${highInventoryCost.toFixed(2)}`;
        locationHighMarketValueDisplay.textContent = `$${highInventoryTotalMarketValue.toFixed(2)}`
        locationHighRealizedProfitDisplay.textContent = `$${highInventoryRealizedProfit.toFixed(2)}`                
    }

    // Render Show Sales Chart Function

    function renderShowSalesChart() {
        const showHistory = getShowHistory();

        let showLabels = [];
        let showSalesData = [];

        for (const show of showHistory) {
            showLabels.push(show.name);
            showSalesData.push(show.totalSales);
        }

        if (showSalesChart !== null) {
            showSalesChart.destroy();
        }

        showSalesChart = new Chart(showSalesChartCanvas, {
            type: "bar",
            data: {
                labels: showLabels,
                datasets: [
                    {
                        label: "Sales",
                        data: showSalesData
                    }
                ]
            }
        })
    }

    return {
        refreshAnalytics() {
            calculateBusinessDashBoard();
            calculateShowPerformance();
            calculateInventoryPerformance();
            calculateLocationPerformance();
            renderShowSalesChart();
        }
    }
};