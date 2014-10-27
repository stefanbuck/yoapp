'use strict';

var _ = require('lodash');
var $log = $('#log');
var $prompts = $('#prompts');
var callback = null;

var GUIAdapter = module.exports = function GUIAdapter() {};

var log = function log(msg) {
  $log.append(msg.replace(/\n/gm, '<br>') + '<br/>');
};

GUIAdapter.prototype.log = log;
GUIAdapter.prototype.log.emit = log;

GUIAdapter.prototype.write = log;
GUIAdapter.prototype.writeln = log;
GUIAdapter.prototype.ok = log;
GUIAdapter.prototype.error = log;
GUIAdapter.prototype.table = log;
GUIAdapter.prototype.log.skip = log;
GUIAdapter.prototype.log.force = log;
GUIAdapter.prototype.log.create = log;
GUIAdapter.prototype.log.invoke = log;
GUIAdapter.prototype.log.conflict = log;
GUIAdapter.prototype.log.identical = log;
GUIAdapter.prototype.log.info = log;


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
      if (prompt.default) {
        $formElement.find('input').attr('checked', 'checked');
      }
    }
    else if ( prompt.type === 'checkbox') {
      $formElement = $('<div>' + prompt.message + '</div>');
      _.each(prompt.choices, function(item) {
        var $el = $('<div class="checkbox"><label><input type="checkbox" name="' + prompt.name + '" value="' + item.value + '">' + item.name + '</label></div>');
        if (item.checked) {
          $el.find('input').attr('checked', 'checked');
        }
        $formElement.append($el);
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

module.exports = GUIAdapter;
