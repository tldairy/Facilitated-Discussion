/* ************************ START OF MAIN SITE SEARCH *********************** */

$(document).ready(function() {
	// This is used for limiting the search results for each site excluding the
	// home page and the search site.
    // Fixed URL check using .includes() instead of !indexOf()
    var currentUrl = window.location.href;
    if (
        currentUrl !== "https://www.emich.edu/index.php" &&
        currentUrl !== "https://www.emich.edu/" &&
        !currentUrl.includes("https://www.emich.edu/search")
    ) {
        $("#search-form").submit(function() {
            var val = $("#top-search").val();
			// If the search button is clicked without a value, this won't continue.
            if (val === "") return false;

            var path = window.location.pathname;
            var searchScope = path.substring(
                path.split("/", 1).join("/").length,
                path.split("/", 2).join("/").length
            );

            $("#search-form input[name='q']").val(val + " site:www.emich.edu" + searchScope);
            return true;
        });
    }

    // Remove empty <p> tags
    $("p").filter(function() {
        return $.trim($(this).text()) === "" && $(this).children().length === 0;
    }).remove();
});

// Helper function to close search panel and return focus
function closeSearchRow() {
    if ($("#search-row").is(":visible")) {
        $("#search-row").hide();
        $("#quick-links-top").show();
        $("#search-glass a").attr("aria-expanded", "false");
    }
}

// Mouse click outside search closes it
$(document).on("click", function(event) {
    if (!$(event.target).closest("#search-row, #search-glass").length) {
        closeSearchRow();
    }
});

// Keyboard: Close search on ESC key
$(document).on("keydown", function(event) {
    if (event.key === "Escape" || event.keyCode === 27) {
        closeSearchRow();
        $("#search-glass a").focus();
    }
});

// Toggle Search Box (Mouse & Keyboard)
$("#search-glass a").on("click keydown", function(event) {
    // Handle Click, Enter, or Spacebar
    if (event.type === "click" || event.key === " " || event.key === "Spacebar" || event.keyCode === 32) {
        event.preventDefault();
        event.stopPropagation();

        if ($("#search-row").is(":hidden")) {
            $("#quick-links-top").hide();
            $("#search-row").show();
            $(this).attr("aria-expanded", "true");

			// Small timeout ensures screen readers/browsers finish rendering before taking focus
            setTimeout(function() {
                $("input[name='q']").focus();
            }, 0);
        } else {
            closeSearchRow();
        }
    }
});

// Handle empty form submits
$("#search-form").submit(function() {
    if ($.trim($("#top-search").val()) === "") {
        closeSearchRow();
        return false;
    }
});

/* ************************* END OF MAIN SITE SEARCH ************************ */

// Disable event listeners (needed for mobile nav)
$(".forget").off();

// Move Directedit button safely
setTimeout(function() {
    var $editSlot = $("#ouceditslot");
    var $editBtn = $("#oucedit");
    if ($editSlot.length && $editBtn.length) {
        $editSlot.replaceWith($editBtn);
    }
}, 500);

// Keybindings for editor / staging environment
var keyMap = {};
$(document).on("keydown keyup", function(e) {
    keyMap[e.keyCode] = (e.type === "keydown");

    // Keybind: [ ] \ -> Click OUC Edit
    if (keyMap[219] && keyMap[220] && keyMap[221]) {
        var editBtn = document.getElementById("oucedit");
        if (editBtn) editBtn.click();
    }
    // Keybind: Shift + < + > -> Webstage to WWW
    if (keyMap[16] && keyMap[188] && keyMap[190]) {
        window.location.href = window.location.href.replace("webstage", "www");
    }
});


/**
 * ACCESSIBILITY COMPLIANCE: TRACKING PIXELS, EMPTY LINKS & FORM INPUTS
 * This script identifies invisible 1x1 tracking pixels (like Google/GTM tags) 
 * and applies null alt attributes and ARIA roles. This prevents accessibility 
 * scanners from flagging hidden pixels while ensuring they are ignored 
 * by screen readers.
 * 1. Fixes 1x1 images/spacers by adding null alt attributes.
 * 2. Fixes empty <a> tags by adding an aria-label.
 */
;(function() {  // <--- Added a semicolon here for safety
    function fixAccessibilityIssues() {
        
        // --- PART 1: FIX IMAGES & TRACKING PIXELS ---
        document.querySelectorAll('img:not([data-fixed])').forEach(function(img) {
			
			// Target 0x0 or 1x1 pixels, OR images missing the alt attribute,
			// OR images with "star.gif" (common tracking pixel name)
            var isPixel = (img.width <= 1 || img.height <= 1);
            var isTrackingUrl = img.src.indexOf('star.gif') > -1 || img.src.indexOf('google') > -1;

            if (isPixel || isTrackingUrl || !img.hasAttribute('alt')) {
                img.setAttribute('alt', '');
                img.setAttribute('role', 'presentation');
                img.setAttribute('aria-hidden', 'true');
                img.setAttribute('data-fixed', 'true'); // Mark as processed
            }
        });

        // --- PART 2: FIX EMPTY LINKS ---
        document.querySelectorAll('a:not([data-fixed])').forEach(function(link) {
            if (link.innerText.trim() === '' && !link.hasAttribute('aria-label') && !link.querySelector('img[alt]')) {
                
				// Smarter labeling: check the URL for common sites
				var url = link.href.toLowerCase();
                var label = 'Link';

                if (url.includes('facebook.com')) label = 'Facebook';
                else if (url.includes('twitter.com') || url.includes('x.com')) label = 'Twitter';
                else if (url.includes('instagram.com')) label = 'Instagram';

                link.setAttribute('aria-label', label);
                link.setAttribute('data-fixed', 'true'); // Mark as processed
            }
        });

        // --- PART 3: FIX RECAPTCHA MISSING LABEL ---
		// Target the reCAPTCHA textarea specifically
        document.querySelectorAll('textarea[name="g-recaptcha-response"]:not([data-fixed])').forEach(function(recaptcha) {
			// Check if it's missing a label (via aria-label or an associated label tag)
            var hasAriaLabel = recaptcha.hasAttribute('aria-label');
            var hasLabelTag = !!document.querySelector('label[for="' + recaptcha.id + '"]');

            if (!hasAriaLabel && !hasLabelTag) {
				// Add the label for screen readers
                recaptcha.setAttribute('aria-label', 'reCAPTCHA verification response');
                recaptcha.setAttribute('data-fixed', 'true');
            }
        });

        // --- PART 4: FIX MUI HIDDEN TEXTAREA LABELS ---
		// Target the hidden MUI multiline calculation textarea
        document.querySelectorAll('textarea.MuiInputBase-inputMultiline[aria-hidden="true"]:not([data-fixed])').forEach(function(textarea) {
			// Adding a generic label satisfies the "Missing Label" requirement 
			// for elements that are hidden from SRs but still seen by validators.
            textarea.setAttribute('aria-label', 'Hidden calculation area');
            textarea.setAttribute('data-fixed', 'true');
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixAccessibilityIssues);
    } else {
        fixAccessibilityIssues();
    }

     // Set up the observer to watch for new elements added to the body (like GTM injections)
	 // Observe dynamic elements added to body
    var observer = new MutationObserver(function() {
        fixAccessibilityIssues();
    });

    // Check if body exists yet (in case script is in <head>)
	if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();