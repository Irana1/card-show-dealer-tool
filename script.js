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
    const addedCardsContainer = document.querySelector("#added-cards-container");
    const totalMarketValueDisplay = document.querySelector("#total-market-value-span");
    const collectionPercentageBtns = document.querySelectorAll(".collection-percentage-btn");
    const collectionOfferDisplay = document.querySelector("#collection-offer-span");

    // Pre-established variables and Arrays

    let collectionCards = []
    let selectedCollectionPercentage = null

    // Functions

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

    function renderCollectionCards() {
        addedCardsContainer.innerHTML = "";

        collectionCards.forEach((card, index) => {
            const cardDiv = document.createElement("div");
            cardDiv.textContent = `${card.name} - $${card.marketValue.toFixed(2)}`;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            deleteButton.addEventListener("click", function() {
                collectionCards.splice(index, 1);
                renderCollectionCards();
                calculateCollectionTotal();

                if (selectedCollectionPercentage !== "") {
                    calculateCollectionOffer(selectedCollectionPercentage);
                }
            })

            cardDiv.appendChild(deleteButton)
            addedCardsContainer.appendChild(cardDiv);
        })
    }

    function calculateCollectionTotal() {
        let collectionTotal = 0

        collectionCards.forEach(card => {
            collectionTotal = collectionTotal + card.marketValue;
        })
       
        totalMarketValueDisplay.textContent = `$${collectionTotal.toFixed(2)}`;

        return collectionTotal;
    }

    function calculateCollectionOffer(percentageDecimal) {
        let collectionTotal = calculateCollectionTotal();
        percentageDecimal = percentageDecimal / 100;
        let collectionOffer = collectionTotal * percentageDecimal;
        collectionOfferDisplay.textContent = `$${collectionOffer.toFixed(2)}`;
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

    // Purchase Calculator

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

    // Collection Buy Evaluator

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

        collectionCards.push(card);

        console.log(collectionCards);

        renderCollectionCards();
        calculateCollectionTotal();

        if (selectedCollectionPercentage !== "") {
            calculateCollectionOffer(selectedCollectionPercentage);
        }

        cardNameInput.value = "";
        cardMarketValueInput.value = "";
    })

    collectionPercentageBtns.forEach(button => {
        button.addEventListener("click", (event) => {
            collectionPercentageBtns.forEach(btn => {
                btn.classList.remove("selected-percentage");
            })

            button.classList.add("selected-percentage");

            let percentage = event.target.dataset.percentage;
            selectedCollectionPercentage = percentage

            calculateCollectionOffer(percentage);
        })
    })
})