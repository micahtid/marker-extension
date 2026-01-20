// Background service worker for Marker
// When the extension icon is clicked, send a message to toggle the UI
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) return;

  // Don't run on chrome:// or edge:// pages
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
    console.log('Cannot run on browser internal pages');
    return;
  }

  try {
    // Try to send message to existing content script
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_ANNOTATOR' });
  } catch (error) {
    // Content script not loaded (page was open before extension installed/updated)
    // Reload the tab to inject the content script
    console.log('Content script not loaded. Reloading tab...');
    await chrome.tabs.reload(tab.id);
  }
});
