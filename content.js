console.log("Hide X 'For You' Extension: Content script loaded.");

// Selector still targets the FIRST tab link within the specific container
const FIRST_TAB_SELECTOR = '[data-testid="ScrollSnap-List"] > div[role="presentation"]:first-child > a[role="tab"]';

function hideElementIfMatches(selector, textToMatch) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    // Check if the element exists and if its text content includes the target text
    if (element && element.textContent && element.textContent.trim().includes(textToMatch)) {
      // Only hide if it matches the text AND is not already hidden by us
      if (element.style.display !== 'none') {
        console.log(`Hide X 'For You' Extension: Hiding element with text "${textToMatch}" matching selector: ${selector}`);
        element.style.display = 'none';
      }
    } else if (element && element.style.display === 'none' && element.textContent && !element.textContent.trim().includes(textToMatch)) {
       // Optional: If we previously hid an element that *no longer* matches (e.g., SPA navigation changed content), un-hide it.
       // console.log(`Hide X 'For You' Extension: Un-hiding element that no longer matches "${textToMatch}"`);
       // element.style.display = ''; // Reset display
    }
  });
}

function attemptToHideTabs() {
  // console.log("Hide X 'For You' Extension: Running attemptToHideTabs...");
  // Call the function, specifically looking for "For you" text
  hideElementIfMatches(FIRST_TAB_SELECTOR, "For you");
}

// --- Initial attempt ---
// Use requestAnimationFrame for slightly smoother initial execution
requestAnimationFrame(attemptToHideTabs);
// Also run after a small delay in case things load slower
setTimeout(attemptToHideTabs, 500); // 500ms delay


// --- Use MutationObserver to handle dynamic changes ---
// Observe changes in the DOM and re-apply hiding if elements reappear OR content changes

const observer = new MutationObserver((mutationsList, observer) => {
  // Re-run the check on any significant DOM change. The function now handles the conditional logic.
  // A simple check: if anything was added or removed in the relevant area (or attributes changed), re-validate.
  let potentiallyRelevantChange = false;
  for (const mutation of mutationsList) {
     // Check if nodes were added/removed OR if text content might have changed
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
       potentiallyRelevantChange = true;
       break;
    }
    // Also consider attribute changes on the tablist itself or potential targets
    if (mutation.type === 'attributes' && (mutation.target.matches('[data-testid="ScrollSnap-List"], [data-testid="ScrollSnap-List"] *') )) {
        potentiallyRelevantChange = true;
        break;
    }
  }

  if (potentiallyRelevantChange) {
     // console.log("Hide X 'For You' Extension: Detected potential DOM change, re-checking tabs...");
     attemptToHideTabs();
  }
});

// --- Start observing ---
// Observe the entire body for additions/removals of nodes, subtree changes, and character data changes.
observer.observe(document.body, {
  childList: true,     // Watch for nodes being added or removed
  subtree: true,       // Watch descendants too
  characterData: true, // Watch for text content changes within nodes
  attributes: true     // Watch for attribute changes (like class or style)
});

console.log("Hide X 'For You' Extension: MutationObserver initialized.");

// Optional: Add listeners for SPA navigation events
// These might help catch transitions that MutationObserver misses
window.addEventListener('popstate', attemptToHideTabs);
window.addEventListener('hashchange', attemptToHideTabs);
// Consider adding a listener for X's specific navigation events if identifiable
// document.body.addEventListener('some-custom-x-navigation-event', attemptToHideTabs);