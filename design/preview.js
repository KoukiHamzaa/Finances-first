/*
 * Design preview interaction contract.
 *
 * The five design pages are static mockups. This is the ONLY script any of them
 * load, and it is deliberately variant-agnostic: it finds everything by data
 * attribute, never by class name, so each variant is free to name and style
 * its own classes however it likes.
 *
 * The contract:
 *   [data-preview]          root of a preview page
 *   [data-tray]             one tray/column of rows
 *   [data-select-all]       the tray header's select-all control
 *   [data-row]              one row
 *   [data-select]           the checkbox inside a row (or the select-all)
 *   [data-selection-bar]    bar that appears while anything is selected
 *   [data-count]            element whose text is the selected total
 *   [data-row-name]         the row's display name, used by [data-selected-list]
 *   [data-selected-list]    element that gets the picked rows listed into it
 *
 * Optional, used only by the variants that need them:
 *   [data-tabs] [data-tab] a tab strip; the target tray is matched by
 *                         [data-tray][data-tray-id="<same value as data-tab>"]
 *
 * Behaviour mirrors the real app: click a row's checkbox to toggle it, click
 * the tray select-all to toggle the whole tray, and the select-all reports an
 * indeterminate state when only some rows are picked.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-preview]');
  if (!root) return;

  var bars = Array.prototype.slice.call(root.querySelectorAll('[data-selection-bar]'));
  var lists = Array.prototype.slice.call(root.querySelectorAll('[data-selected-list]'));

  // Some variants mirror the picked rows into a side panel, so mirror them.
  function paintList() {
    if (!lists.length) return;
    var picked = root.querySelectorAll('[data-row].is-selected');
    lists.forEach(function (list) {
      list.textContent = '';
      Array.prototype.forEach.call(picked, function (row) {
        var name = row.querySelector('[data-row-name]');
        var li = document.createElement('li');
        li.textContent = name ? name.textContent.trim() : '';
        list.appendChild(li);
      });
    });
  }

  function paint() {
    var picked = root.querySelectorAll('[data-row].is-selected').length;
    Array.prototype.forEach.call(root.querySelectorAll('[data-count]'), function (el) {
      el.textContent = String(picked);
    });
    bars.forEach(function (bar) {
      if (picked === 0) {
        bar.setAttribute('hidden', '');
      } else {
        bar.removeAttribute('hidden');
      }
    });
    root.setAttribute('data-selected-count', String(picked));
    paintList();
  }

  function setCheck(control, on) {
    control.setAttribute('aria-checked', on ? 'true' : 'false');
    var state = control.querySelector('[data-state]');
    if (state) {
      if (on) {
        state.setAttribute('data-on', '');
      } else {
        state.removeAttribute('data-on');
      }
    }
    var box = control.closest('[data-row]');
    if (box) box.classList.toggle('is-selected', on);
  }

  function refreshTray(tray) {
    var all = tray.querySelector('[data-select-all]');
    if (!all) return;
    var rows = Array.prototype.slice.call(tray.querySelectorAll('[data-row]'));
    var on = rows.filter(function (r) {
      return r.classList.contains('is-selected');
    }).length;
    if (on === 0) {
      all.setAttribute('aria-checked', 'false');
      all.removeAttribute('data-mixed');
    } else if (on === rows.length) {
      all.setAttribute('aria-checked', 'true');
      all.removeAttribute('data-mixed');
    } else {
      all.setAttribute('aria-checked', 'mixed');
      all.setAttribute('data-mixed', '');
    }
  }

  root.addEventListener('click', function (event) {
    var control = event.target.closest('[data-select]');
    if (!control || !root.contains(control)) return;
    // Row controls are decorative in a mockup: the row itself carries the
    // state, and the row is the click target.
    if (control.hasAttribute('data-row-toggle')) {
      var row = control.closest('[data-row]');
      if (!row) return;
      setCheck(control, !row.classList.contains('is-selected'));
    } else {
      var tray = control.closest('[data-tray]');
      var rows = tray ? Array.prototype.slice.call(tray.querySelectorAll('[data-row]')) : [];
      var everyOn = rows.length > 0 && rows.every(function (r) {
        return r.classList.contains('is-selected');
      });
      rows.forEach(function (r) {
        var box = r.querySelector('[data-select]');
        if (box) setCheck(box, !everyOn);
      });
    }
    root.querySelectorAll('[data-tray]').forEach(refreshTray);
    paint();
  });

  // Reflect whatever the markup already declared, so a page can ship with
  // rows pre-selected and show its selection bar on first paint.
  root.querySelectorAll('[data-select]').forEach(function (control) {
    if (control.hasAttribute('data-row-toggle')) {
      setCheck(control, control.getAttribute('aria-checked') === 'true');
    }
  });
  root.querySelectorAll('[data-tray]').forEach(refreshTray);
  paint();

  // Optional master/detail. Only the variants that declare a detail pane get
  // this: clicking a row copies that row's data-* payload into the pane.
  var detail = root.querySelector('[data-detail]');
  if (detail) {
    var master = Array.prototype.slice.call(root.querySelectorAll('[data-row][data-detail-name]'));
    var fields = detail.querySelectorAll('[data-detail-field]');

    function showDetail(row) {
      master.forEach(function (other) {
        other.classList.toggle('is-active', other === row);
      });
      fields.forEach(function (field) {
        var value = row.getAttribute('data-' + field.getAttribute('data-detail-field'));
        if (value !== null) field.textContent = value;
      });
    }

    master.forEach(function (row) {
      row.addEventListener('click', function (event) {
        // A click on the checkbox means "select", not "inspect".
        if (event.target.closest('[data-select]')) return;
        showDetail(row);
      });
    });

    if (master.length) showDetail(master[0]);
  }

  // Optional tab strip. Only the variants that declare one get this.
  var tabs = root.querySelectorAll('[data-tabs] [data-tab]');
  if (tabs.length) {
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        var want = tab.getAttribute('data-tab');
        Array.prototype.forEach.call(tabs, function (other) {
          var on = other === tab;
          other.setAttribute('aria-selected', on ? 'true' : 'false');
          other.classList.toggle('is-on', on);
        });
        Array.prototype.forEach.call(root.querySelectorAll('[data-tray]'), function (tray) {
          tray.hidden = tray.getAttribute('data-tray-id') !== want;
        });
      });
    });
  }
})();