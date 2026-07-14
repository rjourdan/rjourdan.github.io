// Mobile navigation disclosure — reveals the collapsed Category nav below 1024px
// (Req 12.4, 12.5). Above 1024px the nav is always an inline row (CSS handles
// that via the `lg:` variant), so this script is a no-op there aside from
// tracking the button's aria-expanded state.
//
// The disclosure <button id="nav-toggle"> carries aria-controls pointing at the
// nav's id and aria-expanded reflecting its state (Req 13.6). Clicking it flips
// aria-expanded and the controlled nav's `data-open` attribute; the `data-open`
// Tailwind variant on the nav toggles its visibility. No import: this runs as a
// plain deferred script so it works without a bundler.
(function () {
  var toggle = document.getElementById('nav-toggle');
  if (!toggle) return;

  var targetId = toggle.getAttribute('aria-controls');
  var nav = targetId ? document.getElementById(targetId) : null;
  if (!nav) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.setAttribute('data-open', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });
})();
