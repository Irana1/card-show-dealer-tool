document.addEventListener("DOMContentLoaded", function() {
    const buyCalculator = document.querySelector("#buy-calculator");
    const marketValueInput = document.querySelector("#mkt-value");
    const percentageBtns = document.querySelectorAll(".percentage-btn");
    const buyPercentageInput = document.querySelector("#buy-pct");
    const offerDisplay = document.querySelector("#offer");

    function calculateBuyOffer() {
        if (marketValueInput.value === "" || buyPercentageInput.value === "") {
            return;
        }

        let marketValue = Number(marketValueInput.value);
        if (marketValue < 0) {
            return;
        }

        let buyPercentage = Number(buyPercentageInput.value) / 100;
        if (buyPercentage < 0 || buyPercentage > 1) {
            return;
        }

        let cashOffer = marketValue * buyPercentage

        offerDisplay.textContent = `$${cashOffer.toFixed(2)}`
    }

    percentageBtns.forEach(button => {
        button.addEventListener("click", (event) => {
            percentageBtns.forEach(btn => {
                btn.classList.remove("selected-percentage");                    
            })

            const percentage = event.target.dataset.percentage;
            button.classList.add("selected-percentage")
            buyPercentageInput.value = percentage;

            calculateBuyOffer();
        })
    })

    marketValueInput.addEventListener("input", () => {
        calculateBuyOffer();
    })

    buyPercentageInput.addEventListener("input", () => {
        percentageBtns.forEach(button => {
            button.classList.remove("selected-percentage");
            calculateBuyOffer();
        })
    })

    buyCalculator.addEventListener("submit", function(event) {
        event.preventDefault();

        calculateBuyOffer();
    })
})