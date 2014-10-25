'use strict';

var _ = require('lodash');
var path = require('path');
var $log = $('#log');
var $prompts = $('#prompts');

var GUIAdapter = module.exports = function GUIAdapter() {};

GUIAdapter.prototype.log = function log(msg) {
  $log.append(msg.replace(/\n/gm, '<br>'));
};

GUIAdapter.prototype.log.conflict = function log(msg) {
  $log.append(msg.replace(/\n/gm, '<br>'));
};

var callback = null;
GUIAdapter.prototype.prompt = function prompt (prompts, cb) {
  // TODO find out why this is needed
  callback = cb;
  _.each(prompts, function(prompt) {
    var $formElement;

    if (!prompt.type || prompt.type === 'input') {
      $formElement = $('<div class="form-group"><label for="' + prompt.name + '">' + prompt.message + '</label><input type="text" class="form-control" id="' + prompt.name + '" value="' + (prompt.default || '') + '"></div>');
    }
    else if (prompt.type === 'list') {
      $formElement = $('<div class="form-group generator"><label for="' + prompt.name + '">' + prompt.message + '</label><select class="form-control" id="' + prompt.name + '"></select></div>');
      var $select = $formElement.find('select');
      _.each(prompt.choices, function(item) {
        var $item = null;
        if (item.type === 'separator') {
          $item = $('<optgroup />');
          if( item.line) {
            $item.attr('label', item.line);
          }
        } else {
          $item = $('<option />');
          var name = item.name || item;
          $item.attr('name', name);
          $item.attr('value', JSON.stringify(item.value));
          $item.html(name);
        }
        $select.append($item);
      });
    }
    else if ( prompt.type === 'confirm') {
      $formElement = $('<div class="checkbox"><label><input type="checkbox" name="' + prompt.name + '">' + prompt.message + '</label></div>');
    }
    else if ( prompt.type === 'checkbox') {
      $formElement = $('<div>' + prompt.message + '</div>');
      _.each(prompt.choices, function(item) {
        $formElement.append('<div class="checkbox"><label><input type="checkbox" name="' + prompt.name + '" value="' + item.value + '">' + item.name + '</label></div>');
      });
    }
    else {
      $formElement = '<div class="alert alert-warning">Not supported yet! <pre>' + JSON.stringify(prompt, null, ' ') + '</pre></div>';
    }

    $prompts.append($formElement);
  });

  var $btn = $('<button type="submit" class="btn btn-default">Next</button>');
  if ($prompts.find('button').length === 0) {
    $prompts.append($btn);
  }

  $prompts.submit(function(e) {
    e.preventDefault();
    var result = {};
    _.each(this.elements, function(item) {
      if (item.tagName === 'SELECT') {
        result[item.id] = JSON.parse(item.value);
      } else if (item.type === 'checkbox') {
        if (item.checked) {
          if (!result[item.name]) {
            result[item.name] = [];
          }
          result[item.name].push(item.value);
        }
      } else if (item.tagName === 'INPUT') {
        result[item.id] = item.value;
      }
    });
    $prompts.empty();
    if(Object.keys(result).length) {
      callback(result);
    }
  });
};

GUIAdapter.prototype._colorDiffAdded = [42, 49];
GUIAdapter.prototype._colorDiffRemoved = [41, 49];
GUIAdapter.prototype._colorLines = function colorLines() {};
GUIAdapter.prototype.diff = function diff() {};

function init() {
  var env = require('yeoman-environment').createEnv([], {}, new GUIAdapter());

  env.getNpmPaths = function() {
    // TODO get path from ... ????
    return ['/usr/local/lib/node_modules'];
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

init();
