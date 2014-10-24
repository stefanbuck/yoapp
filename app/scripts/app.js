'use strict';

var _ = require('lodash');

var $generator = $('#generator-name');
var $subGenerator = $('#sub-generator-name');
var $btnRun = $('#btn-run');
var $log = $('#log');
var $prompts = $('#prompts');
var $step1 = $('#step1');
var $step2 = $('#step2');

var updateSelect = function($el, list) {
  $el.empty();
  _.each(list, function(item) {
    $el.append('<option name="'+ item +'">' + item + '</option>');
  });
};

var GUIAdapter = module.exports = function GUIAdapter() {};

GUIAdapter.prototype.log = function log(msg) {
  $log.append(msg.replace(/\n/gm, '<br>'));
};

GUIAdapter.prototype.prompt = function prompt (prompts) {


  _.each(prompts, function(prompt) {
    var $formElement;

    if (!prompt.type || prompt.type === 'input') {
      $formElement = $('<div class="form-group"><label for="' + prompt.name + '">' + prompt.message + '</label><input type="text" class="form-control" id="' + prompt.name + '" placeholder="' + (prompt.default || '') + '"></div>');
    }
    else if (prompt.type === 'list') {
      $formElement = $('<div class="form-group generator"><label for="' + prompt.name + '">' + prompt.message + '</label><select class="form-control" id="' + prompt.name + '"></select></div>');
      updateSelect($formElement.find('select'), prompt.choices);
    } else {
      $formElement = '<div class="alert alert-warning">Not supported yet! <pre>' + JSON.stringify(prompt, null, ' ') + '</pre></div>';
    }

    if ($formElement) {
      $prompts.append($formElement);
    }
  });
};

GUIAdapter.prototype._colorDiffAdded = [42, 49];
GUIAdapter.prototype._colorDiffRemoved = [41, 49];
GUIAdapter.prototype._colorLines = function colorLines() {};
GUIAdapter.prototype.diff = function diff() {};

var env = require('yeoman-environment').createEnv([], {}, new GUIAdapter());


env.alias(/^([^:]+)$/, '$1:all');
env.alias(/^([^:]+)$/, '$1:app');

env.on('end', function () {
  console.log('Done running sir');
});

env.on('error', function (err) {
  console.error('Error', process.argv.slice(2).join(' '), '\n');
  console.error(err.message);
  //process.exit(err.code || 1);
});

env.getNpmPaths = function() {
  // TODO get path from ... ????
  return ['/usr/local/lib/node_modules'];
};

$('#btn-back').on('click', function() {
  window.location.reload();
});

env.lookup(function () {

  var generators = _.pluck(env.getGeneratorsMeta(), 'namespace');
  var list = _.groupBy(generators, function(item) {
    return item.split(':')[0];
  });

  _.each(list, function(item, key) {
     list[key] = _.map(item, function(name) {
      return name.split(':')[1];
    });
  });

  $btnRun.on('click', function() {
    $step1.addClass('hide');
    $step2.removeClass('hide');

    var gen = $generator.val();
    var subGen = $subGenerator.val();
    if (gen && subGen) {
      env.run([gen+':'+subGen]);
    }
  });

  $generator.on('change', function() {
    $log.empty();
    $btnRun.removeAttr('disabled');
    updateSelect($subGenerator, list[this.value]);
  });

  var genList = Object.keys(list);
  genList.unshift('');
  updateSelect($generator, genList);
});
