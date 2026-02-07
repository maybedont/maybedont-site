// Custom sidebar.js - overrides vendor version
// Preserves expand/collapse state and scroll position across navigation

document.addEventListener("DOMContentLoaded", function () {
  restoreExpandedState();
  restoreScrollPosition();
  markSidebarReady();
  enableCollapsibles();
});

// Storage keys
const STORAGE_KEY_EXPANDED = 'hextra-sidebar-expanded';
const STORAGE_KEY_SCROLL = 'hextra-sidebar-scroll';

function enableCollapsibles() {
  const buttons = document.querySelectorAll(".hextra-sidebar-collapsible-button");
  buttons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const list = button.closest("li");
      if (list) {
        list.classList.toggle("open");
        saveExpandedState();
      }
    });
  });

  // Save scroll position before navigating away
  const sidebarLinks = document.querySelectorAll(".hextra-sidebar-container a[href]");
  sidebarLinks.forEach(function(link) {
    link.addEventListener("click", function() {
      saveScrollPosition();
    });
  });

  // Also save on any scroll in the sidebar
  const sidebar = document.querySelector(".hextra-sidebar-container .hextra-scrollbar");
  if (sidebar) {
    sidebar.addEventListener("scroll", debounce(saveScrollPosition, 100));
  }
}

function saveExpandedState() {
  const expandedItems = [];
  const items = document.querySelectorAll(".hextra-sidebar-container li.open");
  items.forEach(function(item) {
    // Use the link href as a unique identifier for the section
    const link = item.querySelector(":scope > a[href]");
    if (link) {
      expandedItems.push(link.getAttribute("href"));
    }
  });
  sessionStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(expandedItems));
}

function restoreExpandedState() {
  const saved = sessionStorage.getItem(STORAGE_KEY_EXPANDED);
  if (!saved) {
    // First visit - let Hugo's default state stand
    return;
  }

  try {
    const expandedItems = JSON.parse(saved);
    const allItems = document.querySelectorAll(".hextra-sidebar-container li");

    allItems.forEach(function(item) {
      const link = item.querySelector(":scope > a[href]");
      if (link) {
        const href = link.getAttribute("href");
        if (expandedItems.includes(href)) {
          item.classList.add("open");
        } else {
          // Only collapse if this item has children (is collapsible)
          const hasChildren = item.querySelector(":scope > div > ul");
          if (hasChildren) {
            item.classList.remove("open");
          }
        }
      }
    });
  } catch (e) {
    console.warn("Failed to restore sidebar state:", e);
  }
}

function saveScrollPosition() {
  const sidebar = document.querySelector(".hextra-sidebar-container .hextra-scrollbar");
  if (sidebar) {
    sessionStorage.setItem(STORAGE_KEY_SCROLL, sidebar.scrollTop.toString());
  }
}

function restoreScrollPosition() {
  const sidebar = document.querySelector(".hextra-sidebar-container .hextra-scrollbar");
  const savedPos = sessionStorage.getItem(STORAGE_KEY_SCROLL);

  if (sidebar && savedPos !== null) {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(function() {
      sidebar.scrollTop = parseInt(savedPos, 10);
    });
  }
}

function markSidebarReady() {
  // Add sidebar-ready class to reveal collapsible content after state is restored
  // This prevents FOUC (flash of unstyled content)
  const scrollbar = document.querySelector(".hextra-sidebar-container .hextra-scrollbar");
  if (scrollbar) {
    scrollbar.classList.add("sidebar-ready");
  }
}

// Utility: debounce function to limit scroll event frequency
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = function() {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
