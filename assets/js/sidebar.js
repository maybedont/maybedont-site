// Custom sidebar.js - overrides vendor version
// Handles click handlers, state persistence, and scroll position.
//
// IMPORTANT: State restoration and sidebar-ready are handled by an inline
// <script> in sidebar.html that runs synchronously during parse (before paint)
// to prevent FOUC. This file only runs on DOMContentLoaded for interactive
// features that don't affect initial visual state.

document.addEventListener("DOMContentLoaded", function () {
  restoreScrollPosition();
  enableCollapsibles();
});

var STORAGE_KEY_SCROLL = 'hextra-sidebar-scroll';
var STORAGE_KEY_OPEN = 'hextra-sidebar-open';

// --- Expand/Collapse State Persistence ---

function getSectionKey(li) {
  var link = li.querySelector(':scope > a[href]');
  return link ? link.getAttribute('href') : null;
}

function saveOpenSections() {
  var sidebar = document.querySelector('.hextra-sidebar-container .hextra-scrollbar');
  if (!sidebar) return;

  var state = {};
  sidebar.querySelectorAll('li').forEach(function (li) {
    var key = getSectionKey(li);
    if (!key) return;
    var hasCollapsible = li.querySelector(':scope > a .hextra-sidebar-collapsible-button') ||
                         li.querySelector(':scope > button.hextra-sidebar-collapsible-button');
    if (hasCollapsible) {
      state[key] = li.classList.contains('open');
    }
  });

  sessionStorage.setItem(STORAGE_KEY_OPEN, JSON.stringify(state));
}

// --- Collapsible Button Handlers ---

function enableCollapsibles() {
  var buttons = document.querySelectorAll(".hextra-sidebar-collapsible-button");
  buttons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var list = button.closest("li");
      if (list) {
        list.classList.toggle("open");
        saveOpenSections();
      }
    });
  });

  // When clicking a nav link (not the arrow), also expand the section
  var sidebarLinks = document.querySelectorAll(".hextra-sidebar-container a[href]");
  sidebarLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      // If the click was on the collapsible button, it's already handled above
      if (e.target.closest(".hextra-sidebar-collapsible-button")) return;

      // Expand the section if this link has children
      var li = link.closest("li");
      if (li && li.querySelector(".hextra-sidebar-collapsible-button")) {
        li.classList.add("open");
      }
      saveScrollPosition();
      saveOpenSections();
    });
  });

  // Save scroll on sidebar scroll
  var sidebar = document.querySelector(".hextra-sidebar-container .hextra-scrollbar");
  if (sidebar) {
    sidebar.addEventListener("scroll", debounce(saveScrollPosition, 100));
  }
}

// --- Scroll Position ---

function saveScrollPosition() {
  var sidebar = document.querySelector(".hextra-sidebar-container .hextra-scrollbar");
  if (sidebar) {
    sessionStorage.setItem(STORAGE_KEY_SCROLL, sidebar.scrollTop.toString());
  }
}

function restoreScrollPosition() {
  var sidebar = document.querySelector(".hextra-sidebar-container .hextra-scrollbar");
  var savedPos = sessionStorage.getItem(STORAGE_KEY_SCROLL);

  if (sidebar && savedPos !== null) {
    requestAnimationFrame(function () {
      sidebar.scrollTop = parseInt(savedPos, 10);
    });
  }
}

// --- Utility ---

function debounce(func, wait) {
  var timeout;
  return function () {
    var args = arguments;
    var later = function () {
      clearTimeout(timeout);
      func.apply(null, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
