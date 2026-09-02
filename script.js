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
})