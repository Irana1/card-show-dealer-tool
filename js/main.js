import { initializeNavigation } from "./navigation.js";
import { initializeCalculators } from "./calculators.js";
import { initializeSettings } from "./settings.js";
import { initializeCardSearch } from "./cardSearch.js";
import { initializeInventory } from "./inventory.js";
import { initializeCardShow } from "./cardShow.js";
import { initializeAnalytics } from "./analytics.js";
import { initializeConnectionStatus } from "./connection.js";

function initializeOptionalFeature(name, initializer) {
    try {
        const result = initializer();

        // Support an initializer that returns a Promise without
        // forcing the entire app startup to wait for it.
        if (result && typeof result.then === "function") {
            result.catch((error) => {
                console.error(`${name} initialization failed:`, error);
            });
        }

        return result;
    } catch (error) {
        console.error(`${name} initialization failed:`, error);
        return null;
    }
}


function bootstrap() {
    const showAppPage = initializeNavigation();

    const calculators = initializeCalculators();

    initializeSettings(calculators.applySettings);

    let cardShow = null;
    let analytics = null;

    const inventory = initializeInventory({
        onSalesInventoryChanged() {
            cardShow?.refreshSaleInventoryDropdown?.();
        },

        onAnalyticsChanged() {
            analytics?.refreshAnalytics?.();
        }
    });

    initializeCardSearch((cardData) => {
        inventory.prefillInventoryFromCardSearch(cardData);
        showAppPage("inventory");
    });

    cardShow = initializeCardShow({
        getInventoryCards: inventory.getInventoryCards,
        markInventorySold: inventory.markInventorySold,
        addInventoryCard: inventory.addInventoryCard,

        onInventoryChanged: inventory.refreshInventory,

        onAnalyticsChanged() {
            analytics?.refreshAnalytics?.();
        }
    });

    analytics = initializeAnalytics({
        getInventoryCards: inventory.getInventoryCards,
        getShowHistory: cardShow.getShowHistory
    });

    cardShow.refreshSaleInventoryDropdown?.();

    analytics.refreshAnalytics();

    initializeOptionalFeature(
        "Connection status",
        initializeConnectionStatus
    );

}

bootstrap();
