var EE = require('../deps/ee2/lib/eventemitter2').EventEmitter2,
    util = require('util');

NAPI = {
  __proto__: EE.prototype,
};

NAPI.utils = {};

/*
 * Return complete request in the callback passed as parameter
 *
 * @param {String} url
 * @param {Boolean|Optional} dom
 * @param {Function} callback
 * @api private
 *
 */

NAPI.utils._get = function(/* url, [dom], cbl*/) {
  var args = [].slice.call(arguments),
      cbl = args.pop(),
      url = args.shift(),
      dom = args.pop();
  
  var req = new XMLHttpRequest();

  req.open("GET", url, true);

  if (dom) req.responseType = 'document';
  
  req.onreadystatechange = function() {
    if (req.readyState !== 4) return;

    cbl(req);
  };

  req.send(null);
};

/*
 * Throw if assertion isn't respected
 *
 * @param {Mixed} value
 * @api private
 *
 */

NAPI.utils._asyncAssertEq = function(a) {
  return function(b) {
    console.log("Asserting " + a + " === " + b);
    
    if (a !== b) throw new Error("Assertion failed: " + a + " === " + b);
  };
};

/*
 * Return id from the project name
 *
 * @param {String} name
 * @param {Function} cbl
 * @api public
 */

NAPI.getProjectIdFromName = function(/*[user], name, cbl*/) {
  var args = [].slice.call(arguments),
      cbl = args.pop(),
      name = args.pop(),
      user = args.pop();

  this.utils._get('/' + escape(name.replace(/ /g, '+')) + (user ? '.' : ':'), true, function(req) {
    var postlist = req.responseXML.getElementById('postlist');

    if (!postlist) return cbl(null);

    cbl(
      parseInt(
        (user) ? postlist.getAttribute('data-profileid') : postlist.getAttribute('data-projectid')
      )
    );
  });
};

/*
 * Return id from the username
 *
 * @param {String} username
 * @param {Function} cbl
 * @api public
 */

NAPI.getUserIdFromUserName = NAPI.getProjectIdFromName.bind(NAPI, true);

/*
 * Return name from the project id
 *
 * @param {Number} id
 * @param {Function} cbl
 * @api public
 *
 */

NAPI.getNameFromProjectId = function(/*[user], id, cbl*/) {
  var args = [].slice.call(arguments),
      cbl = args.pop()
      id = args.pop(),
      user = args.pop();

  this.utils._get((user ? '/userslist.php' : '/projectslist.php') + '?orderby=id&desc=0&q=' + id, true, function(req) {
    var name = req.responseXML.getElementsByTagName('tbody')[0].rows[1];
    
    if (!name) return cbl(null);

    cbl(
      name.getElementsByTagName("td")[1].childNodes[0].innerHTML
    );
  });
};

/*
 * Return name from user id
 *
 * @param {Number} id
 * @param {Function} cbl
 * @api public
 *
 */

NAPI.getUsernameFromUserId = NAPI.getNameFromProjectId.bind(NAPI, true);

/*
 * Add option in the "profile" section
 *
 * @param {String} name
 * @param {DOM|Optional} input
 * @api public
 *
 */

NAPI.addOption = function(name, input) {
  this.on('pref_profile', function(d) {
    var parser = new DOMParser(),
        parsed = parser.parseFromString(d, 'text/html'), 
        doc = parsed.documentElement.ownerDocument, table;

    if (!doc.getElementById('optTable')) {
      table = document.createElement('table');
      table.id = 'optTable';
      table.className = 'intable';

      doc.body.appendChild(table);
    } else {
      table = doc.getElementById('optTable');
    }

    var tr = document.createElement('tr'),
        col1 = document.createElement('td'),
        col2 = document.createElement('td');

    col1.innerHTML = name;
    
    if (!input) {
      input = document.createElement('input');
      input.type = 'text';
    }

    [].slice.call(doc.getElementsByTagName('br'))
      .slice(-2)
      .forEach(function(br) {
        br.parentNode.removeChild(br);
      });

    input.name = name;

    console.log("LELELEL %s", input.value);

    col2.appendChild(input);

    tr.appendChild(col1);
    tr.appendChild(col2);

    table.appendChild(tr);

    if (!doc.getElementById('optTable')) doc.body.appendChild(table);
    doc.body.appendChild(table);

    return parsed.body.innerHTML;
  });
};

/*
 * Add button to the api form
 *
 * @param {String} name
 * @param {Function} callback on click
 * @api public
 *
 */

NAPI.addButton = function(name, fn) {
  this.on('pref_profile', function(d) {
    var parser = new DOMParser(),
        parsed = parser.parseFromString(d, 'text/html'),
        doc = parsed.documentElement.ownerDocument;
    
    var table = doc.getElementById('optTable');
    
    if (!table) return;
    
    var btn = document.createElement('button');

    btn.innerHTML = name;
    btn.setAttribute('onclick', '(' + (function(el) { NAPI.emit('optclick_' + el.innerHTML) }).toString() + ')(this)');

    doc.body.appendChild(
      document.createElement('br')
    );
    
    var tr = document.createElement('tr'),
        td = document.createElement('td');

    td.appendChild(btn);
    
    tr.appendChild(td)
    tr.appendChild(
      document.createElement('td')
    );

    table.appendChild(td);

    return doc.body.innerHTML;
  });

  this.on('optclick_' + name, function() {
    var table = document.getElementById('optTable'),
        opts = {};

    if (!table) return;

    [].slice.call(table.rows).forEach(function(row) {
      var cols = [].slice.call(row.getElementsByTagName('td')),
          name = cols[0].innerHTML,
          value = cols[1];

      if (!value) return;

      opts[name] = value.firstChild.value;
    });

    fn(opts);
  });
};

/*
 * It filters `data` passing it to listeners
 *
 * @param {String} event
 * @param {Mixed} data
 * @api private
 *
 */

NAPI._fireMiddlewares = function(e, data) {
  var fns = this.listeners(e);

  for (var i = 0; i < fns.length; i++)
    data = fns[i](data);

  return data;
};

/* HOOKS */

/*
 * Comment hook
 *
 * Event: `comment`
 *
 * @api public
 *
 */

N.html.profile.getComments = (function (jObj,done) {this.post('http://www.nerdz.eu/pages/profile/comments.html.php?action=show',jObj,function(d){d=NAPI._fireMiddlewares('comment',d);done(d);});})

document.addEventListener("DOMContentLoaded", function() {
  /*
   * Prefbar (preferences) hooks
   *
   * Events: `pref_account pref_profile pref_guests pref_projects pref_language pref_delete`
   *
   * @api public
   *
   */

  if (document.getElementById('prefbar')) {
    $('#prefbar').unbind();
    $("#prefbar").click(function (event) {
      var c = $("#content");
      c.html($("#loadtxt").data('loading'));
      
      N.html.post('/pages/preferences/' + event.target.id + '.html.php', {}, function (data) {
        console.log('lel');
        data = NAPI._fireMiddlewares('pref_' + event.target.id, data);
        c.html(data);
      });
    });
  }
  /* --- */
  
  if (localStorage.userscript) {
    var input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('value', localStorage.userscript);
    
    console.log('lelwat');

    NAPI.addOption('Moar userscript', input);
  } else {
    NAPI.addOption('Moar userscript');
  }

  NAPI.addButton('Update', function(opts) {
    localStorage.userscript = opts['Moar userscript'];
  });

  if (localStorage.userscript) {
    var s = document.createElement('script');
    s.src = localStorage.userscript;
    s.type = 'application/javascript';

    document.body.appendChild(s);
  }
});
