document.addEventListener("DOMContentLoaded", function() {
    const buyCalculator = document.querySelector("#buy-calculator");
    const marketValueInput = document.querySelector("#mkt-value");
    const buyPercentageInput = document.querySelector("#buy-pct");
    const offerDisplay = document.querySelector("#offer");

    buyCalculator.addEventListener("submit", function(event) {
        event.preventDefault();

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
    })
})