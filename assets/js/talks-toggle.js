/* Collapsible past talks on the Presentation page.
   Finds the "Past Talks" / "지난 발표" section and turns each talk title (h4)
   into a toggle that shows/hides the venue list beneath it.
   Markdown stays untouched — this is progressive enhancement. */
(function () {
  var content = document.querySelector('.content');
  if (!content) return;

  var SECTION_TITLES = /^(past talks|지난 발표)$/i;

  var heads = content.querySelectorAll('h2');
  var section = null;
  for (var i = 0; i < heads.length; i++) {
    if (SECTION_TITLES.test(heads[i].textContent.trim())) { section = heads[i]; break; }
  }
  if (!section) return;

  /* Collect nodes between the Talks h2 and the next h2 */
  var nodes = [];
  var el = section.nextElementSibling;
  while (el && el.tagName !== 'H2') {
    nodes.push(el);
    el = el.nextElementSibling;
  }

  var idx = 0;
  for (var j = 0; j < nodes.length; j++) {
    if (nodes[j].tagName !== 'H4') continue;
    var h4 = nodes[j];

    /* Gather this talk's body: siblings until the next h4 (or section end) */
    var body = document.createElement('div');
    body.className = 'talk-body';
    var k = j + 1;
    while (k < nodes.length && nodes[k].tagName !== 'H4') {
      body.appendChild(nodes[k]);
      nodes.splice(k, 1);
    }
    if (!body.childNodes.length) continue;

    /* Turn the h4 into an accessible toggle button */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'talk-toggle';
    var bodyId = 'talk-body-' + (++idx);
    body.id = bodyId;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', bodyId);
    var title = document.createElement('span');
    title.className = 'talk-title';
    while (h4.firstChild) title.appendChild(h4.firstChild);
    var caret = document.createElement('span');
    caret.className = 'talk-caret';
    caret.setAttribute('aria-hidden', 'true');
    btn.appendChild(caret);
    btn.appendChild(title);
    h4.appendChild(btn);
    h4.className = (h4.className ? h4.className + ' ' : '') + 'talk-head';

    body.hidden = true;
    h4.parentNode.insertBefore(body, h4.nextSibling);

    btn.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      document.getElementById(this.getAttribute('aria-controls')).hidden = expanded;
    });
  }
})();
