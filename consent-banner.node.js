module.exports = () => {

  const gtmCode = process.env.GTM_CODE;
  if (!gtmCode) {
    return;
  }

  const getCookieValue = name => {
    let result = document.cookie.match(
      "(^|[^;]+)\\s*" + name + "\\s*=\\s*([^;]+)"
    );
    return result ? result.pop() : "";
  };

  // Build a button
  const buildButton = text => {
    const button = document.createElement("button");
    button.type = "button";
    button.id = text.toLowerCase();
    button.textContent = text;
    button.className = "_barnardos-consent-banner__button";
    return button;
  };

  // Close consent banner
  const closeConsentBanner = () => {
    consentBanner.parentNode.removeChild(consentBanner);
    let expires = new Date();
    expires.setDate(expires.getDate() + 365);
    document.cookie = `consentBanner=closed; expires=${expires}; domain=.barnardos.org.uk; path=/; SameSite=Strict`;
  };

  // Load the scripts and trackers
  // Using the minified code GTM gives us
  const loadScripts = (w, d, s, l, i) => {
    w[l] = w[l] || [];
    w[l].push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });
    const f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
    // Add acceptance to cookie so we can load the
    // trackers and scripts with subsequent page views
    let expires = new Date();
    expires.setDate(expires.getDate() + 365);
    document.cookie = `consentAction=accept; expires=${expires}; domain=.barnardos.org.uk; path=/; SameSite=Strict`;
  };

  // Create a YYYY-MM date format
  const formatDate = timestamp => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    return `${year}-${month}`;
  };

  // Send a POST request to a click tracker
  const sendClickAction = button => {
    // Make a UNIX timestamp
    const time = Math.round(new Date().getTime() / 1000);
    const date = formatDate(time);
    // Build an object to send as JSON
    const obj = {
      time: time,
      date: date,
      value: button.id
    };
    // Send the object
    if (window.XMLHttpRequest) {
      const request = new XMLHttpRequest();
      const url =
        "https://barnardos-cors-anywhere.herokuapp.com/https://cookie-banner-click-counter.herokuapp.com/ajax-accept.php";
      request.open("POST", url, true);
      request.setRequestHeader("Content-type", "application/json");
      request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status !== 200) {
            console.error("Error sending data to click action tracker");
          }
        }
      };
      request.send(JSON.stringify(obj));
    }
  };

  if (getCookieValue("consentBanner") !== "closed") {
    // Check if the banner has already been interacted with
    // Create the HTML and CSS if not
    var consentBanner = document.createElement("div");
    consentBanner.className = "_barnardos-consent-banner";
    const text = document.createElement("p");
    text.innerHTML =
      'We use cookies to improve your experience on our site, show you personalised marketing and information and to help us understand how you use the site. By pressing accept, you agree to us storing those cookies on your device. By pressing reject, you refuse the use of all cookies except those that are essential to the running of our website. See our <a href="https://www.barnardos.org.uk/privacy-notice">privacy policy</a> for more details.';
    const style = document.createElement("style");
    style.textContent =
      "._barnardos-consent-banner {background-color:#444;color:#fff;font-family:inherit;padding:0.5rem 1rem 4rem;position:fixed;bottom:0;left:0;width:100%;z-index:2}@media screen and (min-width:45rem){._barnardos-consent-banner{padding:0.5rem 2rem}}._barnardos-consent-banner p {display:inline-block;font-size:1rem;line-height:1.5;margin:0.5rem 1rem 0.5rem 0;vertical-align:middle}._barnardos-consent-banner div{display:inline-block;white-space:nowrap}._barnardos-consent-banner button {appearance: none; background-color: #6aa300; border: 1px solid #6aa300; border-radius: 0; color: #fff; display: inline-block; font-size: 1.125rem; font-weight: 800; letter-spacing: 0; line-height: 1.5rem; padding: 0.5rem 2rem; text-align: center; user-select: none; vertical-align: middle; white-space: nowrap; margin:0 1em 0 0;}._barnardos-consent-banner button:hover, ._barnardos-consent-banner button:focus { background-color: #5f9300; border-color: #5f9300; }._barnardos-consent-banner a {text-decoration:underline;color:inherit}";
    consentBanner.appendChild(style);
    consentBanner.appendChild(text);
    const buttonWrap = document.createElement("div");
    var rejectButton = buildButton("Reject");
    var acceptButton = buildButton("Accept");
    buttonWrap.appendChild(rejectButton);
    buttonWrap.appendChild(acceptButton);
    consentBanner.appendChild(buttonWrap);
    // Put first in the DOM so keyboard and AT users
    // can interact with it quickly
    const firstChild = document.body.firstChild;
    firstChild.parentNode.insertBefore(consentBanner, firstChild);
  }

  // If cookies are previously accepted run the function
  // to load the trackers and scripts
  if (getCookieValue("consentAction") === "accept") {
    loadScripts(window, document, "script", "dataLayer", gtmCode); // eslint-disable-line no-undef
  }

  // Listeners
  if (rejectButton) {
    rejectButton.addEventListener("click", e => {
      closeConsentBanner();
      sendClickAction(e.target);
    });
  }

  if (acceptButton) {
    acceptButton.addEventListener("click", e => {
      closeConsentBanner();
      loadScripts(window, document, "script", "dataLayer", gtmCode); // eslint-disable-line no-undef
      sendClickAction(e.target);
    });
  }
};
