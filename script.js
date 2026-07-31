/* =========================================================
   HustleHub — script.js
   External JavaScript file for the JS Lab assignment.
   Loaded on every page; each feature checks the page has the
   right element before running, so no errors show up on pages
   that don't use a particular feature.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initWelcomeMessage();
  initCategoryLearnMore();
  initSaveHustleButtons();
  initGalleryFavourite();
  initFormValidation("registration-form", "form-success");
  initFormValidation("contact-form", "contact-success");
});

/* ---------------------------------------------------------
   1. Welcome message (Home page only)
   --------------------------------------------------------- */
function initWelcomeMessage() {
  var banner = document.getElementById("welcome-banner");
  if (!banner) return; // not on this page, skip quietly

  var storedName = localStorage.getItem("hustlehubName");

  if (!storedName) {
    var input = window.prompt("Welcome to HustleHub! What's your name?");
    if (input && input.trim() !== "") {
      storedName = input.trim();
      localStorage.setItem("hustlehubName", storedName);
    }
  }

  if (storedName) {
    banner.textContent = "Welcome back, " + storedName + "! Ready to find your next hustle?";
  } else {
    banner.textContent = "Welcome to HustleHub!";
  }
  banner.hidden = false;
}

/* ---------------------------------------------------------
   2. Dynamic content — "Learn more" toggle on category cards
      (Home page). Shows/hides extra text and swaps the
      button's own label.
   --------------------------------------------------------- */
function initCategoryLearnMore() {
  var buttons = document.querySelectorAll(".learn-more-btn");
  if (buttons.length === 0) return;

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var detail = btn.nextElementSibling; // the <p class="category-detail">
      var isHidden = detail.hidden;

      if (isHidden) {
        detail.textContent = btn.getAttribute("data-more");
        detail.hidden = false;
        btn.textContent = "Show less";
        btn.setAttribute("aria-expanded", "true");
      } else {
        detail.hidden = true;
        btn.textContent = "Learn more";
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });
}

/* ---------------------------------------------------------
   3. Dynamic content — "Save hustle" buttons (Marketplace
      page). Toggles a saved state (changes text/colour),
      shows a temporary confirmation message, and remembers
      what's saved using localStorage so it survives refreshes
      and new visits.
   --------------------------------------------------------- */
var SAVED_HUSTLES_KEY = "hustlehubSavedHustles";

function getSavedHustles() {
  var stored = localStorage.getItem(SAVED_HUSTLES_KEY);
  try {
    var parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function setSavedHustles(list) {
  localStorage.setItem(SAVED_HUSTLES_KEY, JSON.stringify(list));
}

function initSaveHustleButtons() {
  var saveButtons = document.querySelectorAll(".btn-save");
  var toast = document.getElementById("confirmation-toast");
  var summary = document.getElementById("saved-summary");
  if (saveButtons.length === 0) return;

  var toastTimer = null;
  var savedList = getSavedHustles();

  // Restore saved state on page load, no toast needed for this part
  saveButtons.forEach(function (btn) {
    var name = btn.getAttribute("data-hustle");
    if (savedList.indexOf(name) !== -1) {
      markSaved(btn, true);
    }
  });
  updateSummary();

  saveButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-hustle");
      var alreadySaved = btn.classList.contains("saved");

      if (alreadySaved) {
        markSaved(btn, false);
        savedList = savedList.filter(function (item) { return item !== name; });
        setSavedHustles(savedList);
        showToast(name + " removed from your saved list.");
      } else {
        markSaved(btn, true);
        if (savedList.indexOf(name) === -1) savedList.push(name);
        setSavedHustles(savedList);
        showToast(name + " saved to your list!");
      }
      updateSummary();
    });
  });

  function markSaved(btn, isSaved) {
    var card = btn.closest(".feature-card");
    if (isSaved) {
      btn.classList.add("saved");
      btn.textContent = "Saved ✓";
      if (card) card.classList.add("saved");
    } else {
      btn.classList.remove("saved");
      btn.textContent = "Save hustle";
      if (card) card.classList.remove("saved");
    }
  }

  function updateSummary() {
    if (!summary) return;
    if (savedList.length === 0) {
      summary.hidden = true;
      summary.textContent = "";
    } else {
      summary.hidden = false;
      summary.textContent = "You have saved " + savedList.length +
        (savedList.length === 1 ? " hustle: " : " hustles: ") + savedList.join(", ");
    }
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
      toast.hidden = true;
    }, 2500);
  }
}

/* ---------------------------------------------------------
   4. Dynamic content — select a favourite card (Gallery
      page). Clicking (or pressing Enter/Space on) a flip
      card marks it as the chosen favourite and updates a
      status line, replacing whichever was selected before.
   --------------------------------------------------------- */
function initGalleryFavourite() {
  var cards = document.querySelectorAll(".flip-card[data-category]");
  var display = document.getElementById("favorite-display");
  if (cards.length === 0) return;

  function selectCard(card) {
    cards.forEach(function (c) {
      c.classList.remove("selected");
      c.setAttribute("aria-pressed", "false");
    });
    card.classList.add("selected");
    card.setAttribute("aria-pressed", "true");

    if (display) {
      display.textContent = "Your favourite hustle category: " + card.getAttribute("data-category");
      display.hidden = false;
    }
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      selectCard(card);
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectCard(card);
      }
    });
  });
}

/* ---------------------------------------------------------
   5. Form validation — reusable for both the registration
      form and the contact form. Checks every required field,
      shows an inline error message under the ones left
      blank, and only reports success once everything is
      filled in.
   --------------------------------------------------------- */
function initFormValidation(formId, successId) {
  var form = document.getElementById(formId);
  if (!form) return;

  var successMessage = document.getElementById(successId);

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // this is a static class demo site, so we validate instead of really submitting

    var isValid = validateForm(form);

    if (isValid) {
      if (successMessage) {
        successMessage.hidden = false;
      }
      form.reset();
      // Clear any leftover error text after a successful, validated submission
      clearAllErrors(form);
    } else if (successMessage) {
      successMessage.hidden = true;
    }
  });

  // Clear a field's error as soon as the user starts fixing it
  var requiredFields = form.querySelectorAll("[required]");
  requiredFields.forEach(function (field) {
    field.addEventListener("input", function () {
      clearFieldError(form, field);
    });
    field.addEventListener("change", function () {
      clearFieldError(form, field);
    });
  });
}

function validateForm(form) {
  var requiredFields = form.querySelectorAll("[required]");
  var allValid = true;

  requiredFields.forEach(function (field) {
    var fieldIsValid = true;

    if (field.type === "checkbox") {
      fieldIsValid = field.checked;
    } else {
      fieldIsValid = field.value.trim() !== "";
    }

    if (!fieldIsValid) {
      allValid = false;
      showFieldError(form, field);
    } else {
      clearFieldError(form, field);
    }
  });

  return allValid;
}

function showFieldError(form, field) {
  var errorSpan = document.getElementById("err-" + field.id);
  var message = "This field is required.";

  if (field.type === "email") {
    message = "Please enter your email address.";
  } else if (field.type === "checkbox") {
    message = "Please tick this box to continue.";
  } else if (field.tagName === "SELECT") {
    message = "Please choose an option.";
  }

  if (errorSpan) {
    errorSpan.textContent = message;
  }
  field.classList.add("invalid");
}

function clearFieldError(form, field) {
  var errorSpan = document.getElementById("err-" + field.id);
  if (errorSpan) {
    errorSpan.textContent = "";
  }
  field.classList.remove("invalid");
}

function clearAllErrors(form) {
  var errorSpans = form.querySelectorAll(".error-text");
  errorSpans.forEach(function (span) {
    span.textContent = "";
  });
  var invalidFields = form.querySelectorAll(".invalid");
  invalidFields.forEach(function (field) {
    field.classList.remove("invalid");
  });
}
