document.addEventListener("DOMContentLoaded", restoreUrls);
document.getElementById("addUrlBtn").addEventListener("click", addUrl);

// Restore the list of URLs when the popup is opened
function restoreUrls() {
  browser.storage.local.get("notionUrls").then((result) => {
    const urls = result.notionUrls || [];
    const urlList = document.getElementById("urlList");
    urls.forEach((url) => appendUrlToList(url, urlList));
  }).catch((error) => {
    console.error("Error restoring URLs:", error);
  });
}

// Add a new URL to the list and save it
function addUrl() {
  const notionUrlInput = document.getElementById("notionUrl");
  const notionUrl = notionUrlInput.value.trim();
  if (!notionUrl) return;

  browser.storage.local.get("notionUrls").then((result) => {
    const urls = result.notionUrls || [];
    if (!urls.includes(notionUrl)) {
      urls.push(notionUrl);
      browser.storage.local.set({ notionUrls: urls }).then(() => {
        appendUrlToList(notionUrl, document.getElementById("urlList"));
        notionUrlInput.value = "";
      });
    } else {
      alert("This URL is already being tracked.");
    }
  }).catch((error) => {
    console.error("Error adding URL:", error);
  });
}

// Add a URL item to the list in the popup UI
function appendUrlToList(url, listElement) {
  const li = document.createElement("li");
  li.textContent = url;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", () => removeUrl(url, li));

  li.appendChild(deleteBtn);
  listElement.appendChild(li);
}

// Remove a URL from the list and storage
function removeUrl(url, listItem) {
  browser.storage.local.get("notionUrls").then((result) => {
    const urls = result.notionUrls || [];
    const updatedUrls = urls.filter((u) => u !== url);
    browser.storage.local.set({ notionUrls: updatedUrls }).then(() => {
      listItem.remove();
    });
  }).catch((error) => {
    console.error("Error removing URL:", error);
  });
}
