export function initializeConnectionStatus() {
    const connectionStatus = document.querySelector("#connection-status");

    function updateConnectionStatus() {
        if (navigator.onLine) {
            connectionStatus.textContent = "Online";
            connectionStatus.classList.remove("offline");
            connectionStatus.classList.add("online");
        } else {
            connectionStatus.textContent = "Offline";
            connectionStatus.classList.remove("online");
            connectionStatus.classList.add("offline");
        }
    }

    updateConnectionStatus();

    window.addEventListener("online", function() {
        updateConnectionStatus();
    });

    window.addEventListener("offline", function() {
        updateConnectionStatus();
    });
}