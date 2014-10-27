'use strict';

var path = require('path');
var Adapter = require('./browser/adapter.js');
var remote = require('remote');
var dialog = remote.require('dialog');
var $folder = $('#folder');

function init(cwd) {
  process.chdir(cwd);
  $('.hide').removeClass('hide');
  $folder.addClass('hide');

  var env = require('yeoman-environment').createEnv([], {}, new Adapter());

  env.getNpmPaths = function() {
    return process.env.PATH.split(':').map(function(item) {
      return path.join(item, '..', 'lib', 'node_modules');
    });
  };

  // alias any single namespace to `*:all` and `webapp` namespace specifically
  // to webapp:app.
  env.alias(/^([^:]+)$/, '$1:all');
  env.alias(/^([^:]+)$/, '$1:app');

  env.on('end', function () {
    console.log('Done running sir');
  });

  env.on('error', function (err) {
    console.error('Error', process.argv.slice(2).join(' '), '\n');
    // console.error(opts.debug ? err.stack : err.message);
    process.exit(err.code || 1);
  });

  // lookup for every namespaces, within the environments.paths and lookups
  env.lookup(function () {

    // Register the `yo yo` generator.
    env.register(path.resolve(__dirname, '../node_modules/yo/yoyo'), 'yo');
    var args = ['yo'];
    // make the insight instance available in `yoyo`
    // TODO implement insight
    var insight = {track: function() {}};
    var opts = { insight: insight };

    // Note: at some point, nopt needs to know about the generator options, the
    // one that will be triggered by the below args. Maybe the nopt parsing
    // should be done internally, from the args.
    env.run(args, opts);
  });
}

$folder.on('click', function() {

  var defaultPath = window.localStorage.getItem('defaultPath') || '';

  dialog.showOpenDialog(remote.getCurrentWindow(), {defaultPath: defaultPath, properties: ['createDirectory', 'openDirectory']} , function(selectedPath) {
    defaultPath = selectedPath[0];

    window.localStorage.setItem('defaultPath', defaultPath);
    init(defaultPath);
  });
});


