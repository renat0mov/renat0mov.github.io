/* renat0.mov: copy button and the project pop-ups. Plain JavaScript, no libraries.
   Without JavaScript the page still works: the project names are ordinary links to
   YouTube, audioglobo.pt and the video file, and the copy button stays hidden. */
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
     the video and the YouTube player live inside the templates, so none of them load until
     their pop-up opens. */
  var dialog = document.getElementById('project');
  if (!dialog || typeof dialog.showModal !== 'function') return; // old browser: links just work
  var trigger = null;
  var closing = false;

  function open(name, link) {
    var tpl = document.getElementById('tpl-' + name);
    if (!tpl) return false;
    trigger = link;
    closing = false;
    dialog.classList.remove('is-closing');
    dialog.replaceChildren(tpl.content.cloneNode(true));
    dialog.setAttribute('aria-label', dialog.querySelector('[data-title]').getAttribute('data-title'));

    var video = dialog.querySelector('video');
    if (video) {
      if (reduce.matches) {
        // No autoplay for people who asked for less motion: show the controls instead.
        video.controls = true;
      } else {
        video.autoplay = true;
        // Tap the video to pause or resume it.
        video.addEventListener('click', function () { if (video.paused) video.play(); else video.pause(); });
      }
      video.src = video.getAttribute('data-src');
    }

    var play = dialog.querySelector('[data-youtube]');
    if (play) {
      play.addEventListener('click', function () {
        var id = play.getAttribute('data-youtube');
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
        frame.title = play.getAttribute('aria-label').replace(/^Play /, '');
        frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        play.replaceWith(frame);
        frame.focus();
      });
    }

    dialog.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    dialog.showModal();
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
    dialog.replaceChildren(); // stops the video or the YouTube player
    if (trigger) trigger.focus();
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
      if (open(link.getAttribute('data-project'), link)) e.preventDefault();
    });
  });
})();
