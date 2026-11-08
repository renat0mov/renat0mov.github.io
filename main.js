/* renat0.mov: copy button and the project pop-ups. Plain JavaScript, no libraries.
   Without JavaScript the page still works: the project names are ordinary links to
   the two video files and audioglobo.pt, and the copy button stays hidden. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Colour fade only for later theme changes (sunset in an open tab), not on arrival.
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('theme-ready'); }); });

  /* Copy the email, as on audioglobo.pt/contactos: the icon becomes a tick for two seconds and
     screen readers hear "Email copied". Hidden if the browser cannot copy. */
  var copyBtn = document.querySelector('.copy');
  var status = document.querySelector('.copy-status');
  var canCopy = !!(navigator.clipboard && navigator.clipboard.writeText) ||
    !!(document.queryCommandSupported && document.queryCommandSupported('copy'));
  if (copyBtn && canCopy) {
    copyBtn.hidden = false;
    var timer;
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email');
      var done = function () {
        copyBtn.classList.add('is-copied');
        status.textContent = 'Email copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          copyBtn.classList.remove('is-copied');
          status.textContent = '';
        }, 2000);
      };
      var fallback = function () {
        var f = document.createElement('textarea');
        f.value = email;
        f.setAttribute('readonly', '');
        f.className = 'vh';
        document.body.appendChild(f);
        f.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        f.remove();
        if (ok) done();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  /* Pop-ups. One <dialog>, filled from a <template> when a project link is clicked. Images,
     and the videos live inside the templates, so none of them load until their pop-up opens. */
  var dialog = document.getElementById('project');
  if (!dialog || typeof dialog.showModal !== 'function') return; // old browser: links just work
  var trigger = null;
  var closing = false;
  var byMouse = false;

  function open(name, link, mouse) {
    var tpl = document.getElementById('tpl-' + name);
    if (!tpl) return false;
    trigger = link;
    byMouse = mouse;
    closing = false;
    dialog.classList.remove('is-closing');
    dialog.replaceChildren(tpl.content.cloneNode(true));
    dialog.setAttribute('aria-label', dialog.querySelector('[data-title]').getAttribute('data-title'));

    var video = dialog.querySelector('video');
    var play = dialog.querySelector('[data-play]');
    if (video && play) {
      // Jogo Limpo has sound, so it waits for a click on the play button, then shows the
      // browser's own controls (pause, volume, full screen).
      play.addEventListener('click', function () {
        play.remove();
        video.controls = true;
        video.play();
        video.focus();
      });
    } else if (video) {
      // Kapittal-os is silent: it just plays on a loop. Clicking it does nothing.
      // For people who asked for less motion it waits, with controls, instead of autoplaying.
      if (reduce.matches) video.controls = true;
      else video.autoplay = true;
    }
    if (video) video.src = video.getAttribute('data-src');

    dialog.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    dialog.showModal();
    // Opened with the mouse: focus the pop-up itself, so no focus ring is drawn round the card.
    // Opened from the keyboard: the browser focuses the first control, with its ring.
    if (mouse) dialog.focus();
    return true;
  }

  // Plays the closing animation, then closes. Focus goes back to the link that opened it.
  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    var finish = function () {
      if (!closing) return;
      closing = false;
      dialog.close();
    };
    if (reduce.matches) { finish(); return; }
    dialog.classList.add('is-closing');
    setTimeout(finish, 300);
  }

  dialog.addEventListener('close', function () {
    dialog.classList.remove('is-closing');
    dialog.replaceChildren(); // stops the video
    if (!trigger) return;
    // Back to the link that opened it. After a mouse click, without a ring (it comes back on Tab).
    if (byMouse) trigger.classList.add('no-ring');
    trigger.focus();
  });
  // Esc
  dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  // A click on the blurred page around the card (the dialog itself, or the gaps in the pill row).
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog || e.target.classList.contains('ov-pills')) close();
  });

  document.querySelectorAll('[data-project]').forEach(function (link) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return; // new tab still works
      // A click from the keyboard (Enter) has detail 0; a real mouse click or tap is 1 or more.
      if (open(link.getAttribute('data-project'), link, e.detail > 0)) e.preventDefault();
    });
    link.addEventListener('blur', function () { link.classList.remove('no-ring'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    byMouse = false; // the keyboard is in use now, so the link gets its ring back on close
    document.querySelectorAll('.no-ring').forEach(function (el) { el.classList.remove('no-ring'); });
  });
})();
