// Shared helpers used across pages
(function () {
  function qs(selector, scope) { return (scope || document).querySelector(selector); }
  function qsa(selector, scope) { return Array.from((scope || document).querySelectorAll(selector)); }

  window.EternityApp = {
    qs, qsa,
  };
})();


