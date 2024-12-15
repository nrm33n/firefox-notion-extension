// Extract and send the page content if the URL is tracked
function extractPageContentIfTracked() {
  const currentUrl = window.location.href;

  // Ask the background script if the current URL is tracked
  browser.runtime.sendMessage({ type: "checkTracking", url: currentUrl })
    .then((isTracked) => {
      if (isTracked) {
        // Extract the page content
        const contentElement = document.querySelector(".notion-page-content") || document.body;
        const contentText = contentElement.innerText.trim();

        // Send the content, title, and URL to the background script
        browser.runtime.sendMessage({
          type: "pageContent",
          content: contentText,
          title: document.title,
          url: currentUrl
        });
      }
    })
    .catch((error) => console.error("Error checking tracking status:", error));
}

// Extract content once when the page loads
extractPageContentIfTracked();

// Observe DOM changes (optional for dynamically updated pages)
const observer = new MutationObserver(extractPageContentIfTracked);
observer.observe(document.body, { childList: true, subtree: true });



//setInterval(extractPageContentIfTracked, 60000); // Check every 60 seconds
