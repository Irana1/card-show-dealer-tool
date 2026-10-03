import { normalizeCardLanguage } from "./api.js";

export function initializeSettings(applyCalculatorSettings) {
    const settingsForm = document.querySelector("#settings-form");
    const defaultBuyPercentageInput = document.querySelector("#default-buy-pct");
    const defaultTradePercentageInput = document.querySelector("#default-trade-pct");
    const defaultCollectionPercentageInput = document.querySelector("#default-collection-pct");
    const exportBackupButton = document.querySelector("#export-backup-button");
    const importBackupButton = document.querySelector("#import-backup-button");
    const importBackupInput = document.querySelector("#import-backup-input");

    let settings = {
        defaultBuyPercentage: 75,
        defaultTradePercentage: 85,
        defaultCollectionPercentage: 80
    }

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

        applyCalculatorSettings(settings);

        localStorage.setItem("dealerSettings", JSON.stringify(settings));
    })

    exportBackupButton.addEventListener("click", function() {
        const backupData = {
            backupType: "pokemon-card-show-dealer",
            backupVersion: 2,
            exportedAt: new Date().toISOString(),
            data: {
                dealerSettings: localStorage.getItem("dealerSettings"),
                collectionCards: localStorage.getItem("collectionCards"),
                inventoryCards: localStorage.getItem("inventoryCards"),
                sales: localStorage.getItem("sales"),
                purchases: localStorage.getItem("purchases"),
                trades: localStorage.getItem("trades"),
                activeShow: localStorage.getItem("activeShow"),
                showHistory: localStorage.getItem("showHistory")
            }
        };

        const backupJSON = JSON.stringify(backupData, null, 2);

        const backupBlob = new Blob([backupJSON], { type: "application/json" });

        const downloadURL = URL.createObjectURL(backupBlob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

        const downloadLink = document.createElement("a");
        downloadLink.href = downloadURL;
        downloadLink.download = `pokemon-dealer-backup-${timestamp}.json`;

        downloadLink.click();

        URL.revokeObjectURL(downloadURL);
    });

    importBackupButton.addEventListener("click", function() {
        importBackupInput.click();
    })

    importBackupInput.addEventListener("change", async function() {
        const file = importBackupInput.files[0];

        if (!file) {
            return;
        }

        try {
            const fileText = await file.text();
            const backup = JSON.parse(fileText);

            if (!backup || typeof backup !== "object") {
                alert("Invalid Dealer Tool backup file.");
                return;
            }

            if (backup.backupVersion !== 1 && backup.backupVersion !== 2) {
                alert("Unsupported backup version.");
                return;
            }

            if (backup.backupVersion === 2 && backup.backupType !== "pokemon-card-show-dealer") {
                alert("This backup was not created by the Pokemon Card Show Dealer Tool.");
                return;
            }

            if (!backup.data || typeof backup.data !== "object" || Array.isArray(backup.data)) {
                alert("Invalid backup data.");
                return;
            }

            const backupKeys = [
                "dealerSettings",
                "collectionCards",
                "inventoryCards",
                "sales",
                "purchases",
                "trades",
                "activeShow",
                "showHistory"
            ];

            for (const key of backupKeys) {
                if (!Object.prototype.hasOwnProperty.call(backup.data, key)) {
                    alert(`Invalid backup: missing ${key}.`);
                    return;
                }

                const value = backup.data[key];

                if (value !== null && typeof value !== "string") {
                    alert(`Invalid backup data: ${key}.`);
                    return;
                }

                if (value !== null) {
                    try {
                        JSON.parse(value);
                    } catch {
                        alert(`Invalid backup data: ${key}.`)
                        return;
                    }
                }
            }

            let normalizedInventoryBackup = null;

            if (backup.data.inventoryCards !== null) {
                const inventoryCards = JSON.parse(backup.data.inventoryCards);

                if (Array.isArray(inventoryCards)) {
                    normalizedInventoryBackup = JSON.stringify(
                        inventoryCards.map((card) => {
                            if (!card || typeof card !== "object" || Array.isArray(card)) {
                                return card;
                            }

                            return {
                                ...card,
                                language: normalizeCardLanguage(card.language)
                            };
                        })
                    );
                }
            }

            const confirmed = confirm("Importing this backup will replace your current saved data. Continue?");

            if (!confirmed) {
                importBackupInput.value = "";
                return;
            }

            for (const key of backupKeys) {
                const value = backup.data[key];

                if (value === null) {
                    localStorage.removeItem(key);
                } else if (key === "inventoryCards" && normalizedInventoryBackup !== null) {
                    localStorage.setItem(key, normalizedInventoryBackup);
                } else {
                    localStorage.setItem(key, value);
                }
            }

            alert("Backup imported successfully.");

            location.reload();
        } catch (error) {
            console.error("BACKUP IMPORT ERROR:", error);
            alert("The selected file is not a valid Dealer Tool backup");
        } finally {
            importBackupInput.value = "";
        }
    })

    loadSavedSettings();
    loadSettingsForm();
    applyCalculatorSettings(settings);
}