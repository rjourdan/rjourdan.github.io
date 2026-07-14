// Theme toggle behavior — flips the color mode with no page reload (Req 5.2, 5.3, 8.3, 13.6).
//
// The no-flash head script has already set the `dark` or `light` class on <html>
// before first paint. This deferred script wires the toggle button so that clicking it:
//   - flips the `dark`/`light` class on <html>,
//   - persists the choice in localStorage.theme,
//   - swaps the visible icon (handled by CSS keyed off the <html> class).
//
// No import: this runs as a plain deferred script so it works without a bundler.
(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function currentMode() {
    return root.classList.contains('dark') ? 'dark' : 'light';
  }

  function applyMode(mode) {
    var isDark = mode === 'dark';
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    try {
      localStorage.setItem('theme', mode);
    } catch (e) {
      // localStorage unavailable (private mode / disabled) — mode still applies this session.
    }
  }

  toggle.addEventListener('click', function () {
    applyMode(currentMode() === 'dark' ? 'light' : 'dark');
  });
})();
