export function initializeNavigation() {
    const navButtons = document.querySelectorAll(".nav-button");
    const appPages = document.querySelectorAll(".app-page");

    // Show App Pages Function

    function showAppPage(pageName) {
        const selectedPage = document.getElementById(`${pageName}-page`);
        const selectedButton = Array.from(navButtons).find(
            (button) => button.dataset.page === pageName
        );

        if (!selectedPage || !selectedButton) {
            console.error(`Navigation target "${pageName}" was not found.`);
            return;
        }

        for (const page of appPages) {
            const isActive = page === selectedPage;
            page.classList.toggle("active-page", isActive);
            page.hidden = !isActive;
        }

        for (const button of navButtons) {
            const isActive = button === selectedButton;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-current", isActive ? "page" : "false");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // Nav Button Listeners

    for (const button of navButtons) {
        button.addEventListener("click", function() {
            const pageName = button.dataset.page;
            showAppPage(pageName);
        });
    }

    showAppPage("dashboard");

    return showAppPage;
}
