document.addEventListener("DOMContentLoaded", () => {
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");
  const toastCloseButton = document.getElementById("toast-close-button");
  const marqueeLinks = document.querySelectorAll(
    ".brand-marq .slide-har .box .item a.img"
  );

  let toastTimeout;

  function showToast(message) {
    if (!toastNotification || !toastMessage) {
      console.error("Toast elements not found!");
      return;
    }
    toastMessage.textContent = message;
    toastNotification.classList.add("show");

    // Clear any existing timeout
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    // Set new timeout to hide the toast
    toastTimeout = setTimeout(() => {
      hideToast();
    }, 5000); // 5 seconds
  }

  function hideToast() {
    if (!toastNotification) return;
    toastNotification.classList.remove("show");
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
  }

  if (toastCloseButton) {
    toastCloseButton.addEventListener("click", () => {
      hideToast();
    });
  }

  marqueeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default anchor behavior if any
      const message = link.dataset.toastText;
      if (message) {
        showToast(message);
      } else {
        console.warn("No data-toast-text attribute found for clicked item.");
      }
    });
  });
});
