// Client-side search for the /search page (task 8.2).
//
// Loaded as a classic deferred script by baseof.html only on the /search page. It
// fetches the generated /index.json corpus and renders matching results into the
// results region. The matching rule mirrors assets/js/search-match.js (the pure,
// unit-tested module) so the browser behaviour and the tests agree:
//
//   - empty/whitespace query        -> no search executed, no results shown (Req 14.3)
//   - 1–200 char query, >=1 match    -> render matching results (title + link)  (Req 14.2)
//   - 1–200 char query, zero matches -> no-results message                      (Req 14.4)
//   - index fails to load            -> "search is unavailable" message          (Req 14.5)
//
// Category filter chips narrow an executed query to a single topic; with an empty
// query nothing is shown regardless of the selected chip (Req 14.3).

(function () {
  'use strict';

  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var count = document.getElementById('search-count');
  var chips = Array.prototype.slice.call(
    document.querySelectorAll('[data-search-filter]')
  );

  if (!input || !results) return;

  var state = { query: '', filter: 'all', items: [], loaded: false, failed: false };

  function norm(v) {
    return typeof v === 'string' ? v.toLowerCase() : '';
  }

  // Mirrors searchMatch() in search-match.js.
  function searchMatch(items, query) {
    if (!Array.isArray(items)) return [];
    if (typeof query !== 'string' || query.trim().length === 0) return [];
    var q = query.trim().toLowerCase();
    return items.filter(function (item) {
      return (
        norm(item.title).indexOf(q) !== -1 ||
        norm(item.summary).indexOf(q) !== -1 ||
        norm(item.body).indexOf(q) !== -1
      );
    });
  }

  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function setCount(text) {
    if (count) count.textContent = text;
  }

  function renderMessage(message, dashed) {
    clear(results);
    results.className = '';
    var box = document.createElement('div');
    box.className = dashed
      ? 'mt-4 rounded-lg border border-dashed border-border p-12 text-center'
      : 'mt-4 rounded-lg border border-border p-12 text-center';
    var p = document.createElement('p');
    p.className = 'font-mono text-sm text-muted-foreground';
    p.textContent = message;
    box.appendChild(p);
    results.appendChild(box);
  }

  function renderResults(items) {
    clear(results);
    results.className = 'mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3';
    items.forEach(function (item) {
      var a = document.createElement('a');
      a.href = item.url || '#';
      a.className =
        'group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent';

      var top = document.createElement('div');
      if (item.category) {
        var cat = document.createElement('span');
        cat.className =
          'inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground';
        cat.textContent = String(item.category).replace(/-/g, ' ');
        top.appendChild(cat);
      }
      var h3 = document.createElement('h3');
      h3.className =
        'mt-3 text-balance text-xl font-semibold leading-tight text-foreground';
      h3.textContent = item.title || '(untitled)';
      top.appendChild(h3);

      if (item.summary) {
        var p = document.createElement('p');
        p.className =
          'mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground';
        p.textContent = item.summary;
        top.appendChild(p);
      }
      a.appendChild(top);

      var meta = document.createElement('div');
      meta.className =
        'mt-4 flex items-center gap-2 font-mono text-[11px] text-muted-foreground';
      var parts = [];
      if (item.date) parts.push(item.date);
      if (item.readingTime) parts.push(item.readingTime + ' min read');
      meta.textContent = parts.join(' / ');
      a.appendChild(meta);

      results.appendChild(a);
    });
  }

  function render() {
    if (state.failed) {
      setCount('');
      renderMessage('Search is unavailable. Please try again later.', false);
      return;
    }

    // Empty/whitespace query: execute no search and show no results (Req 14.3).
    if (typeof state.query !== 'string' || state.query.trim().length === 0) {
      setCount('');
      clear(results);
      results.className = '';
      return;
    }

    var matched = searchMatch(state.items, state.query);
    if (state.filter !== 'all') {
      matched = matched.filter(function (item) {
        return item.category === state.filter;
      });
    }

    setCount(matched.length + (matched.length === 1 ? ' result' : ' results'));

    if (matched.length > 0) {
      renderResults(matched);
    } else {
      renderMessage('No posts match your search.', true);
    }
  }

  // Wire up the input and filter chips.
  input.addEventListener('input', function (e) {
    state.query = e.target.value;
    render();
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      state.filter = chip.getAttribute('data-search-filter') || 'all';
      chips.forEach(function (c) {
        var pressed = c === chip;
        c.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        if (pressed) {
          c.className = c.className
            .replace('border-border', 'border-primary')
            .replace('text-muted-foreground', 'bg-primary text-primary-foreground');
        }
      });
      render();
    });
  });

  // Fetch the search corpus; on any failure show the unavailable message (Req 14.5).
  fetch('/index.json', { headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('index fetch failed: ' + res.status);
      return res.json();
    })
    .then(function (data) {
      state.items = Array.isArray(data) ? data : [];
      state.loaded = true;
      render();
    })
    .catch(function () {
      state.failed = true;
      render();
    });
})();
