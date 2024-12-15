/* OK THINGS TO ADD TO THIS SO ITS LIKE. USABLE
    1. add multiple page functionality - 
        - create nickname and reference url that way so it can be differentiated ? 
          at least refer to it as its page title
        - add functionality for more urls to be added in the popup
        - integrate that with rest of extension
    2. debug: remove false notification when new url is added 
        - set a timeout 
    3. validate URLs 
    4. make the popup prettier fix css etc
    5. make it so that once a notif is sent, there is not another one for like an hour. 
      otherwise if someones working on the thing you just get notifs every second 
      i didnt think of this until it literally just happened bro alhamdulillah i didnt integrate email yet lol  
    6. create second tab in popup with notification options 
        - toggleable options for desktop notifications or to send an email so you can check on phone 
          otherwise like who is just sitting on desktop waiting for a notif 
          and i dont want to integrate a dedicated app so im assuming people have email notifs on 

*/

/* hashing didnt work bc CORS error so i worked around it by injecting a content script to 
fetch page content directly from the webbed site lmaooooo suck my cokkkkk and ballsss
kept hashing script to hash the DOM elements passed from content script 
*/
//i hate apis i hate signing up for apis suck my phat nuts 

let notionUrls = [];
let lastPageContents = {};  // Stores content hashes for each URL 
let activeTabsContent = {};  // Stores content references for each URL 
let primaryTabs = {};  // Maps URLs to their primary tab IDs 

// Fetch URLs from storage on startup
function updateNotionUrls() {
  browser.storage.local.get("notionUrls").then((result) => {
    notionUrls = result.notionUrls || [];
  }).catch((error) => console.error("Error fetching Notion URLs", error));
}

// Simple hashing function to detect content changes
async function generateHash(content) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Handle incoming messages from content scripts
browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === "checkTracking") {
    return Promise.resolve(notionUrls.some((url) => message.url.startsWith(url)));
  }

  if (message.type === "pageContent" && sender.tab) {
    const { content, title, url } = message;
    const tabId = sender.tab.id;

    if (notionUrls.some((trackedUrl) => url.startsWith(trackedUrl))) {
      const contentHash = await generateHash(content);
      const previousHash = lastPageContents[url];

      if (previousHash !== contentHash) {
        lastPageContents[url] = contentHash;

        // Determine the primary tab for the URL
        if (!primaryTabs[url]) {
          // First tab for this URL, make it the primary one
          primaryTabs[url] = tabId;
        }

        if (primaryTabs[url] === tabId) {
          // Only notify if this tab is the primary one for the URL
          browser.notifications.create({
            type: "basic",
            iconUrl: "icons/icon48.png",
            title: `${title} Updated`,
            message: `The Notion page "${title}" has been updated.`
          });
        }
      }
    }
  }
});

// Clean up tab references when tabs are closed
browser.tabs.onRemoved.addListener((tabId) => {
  for (const url in primaryTabs) {
    if (primaryTabs[url] === tabId) {
      delete primaryTabs[url];  // Clean up primary tab reference
    }
  }
});

// Reload tracked URLs from storage changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.notionUrls) {
    updateNotionUrls();
  }
});

// Initialize tracking URLs
updateNotionUrls();
