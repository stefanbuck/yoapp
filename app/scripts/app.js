'use strict';

var _ = require('lodash');

var GUIAdapter = module.exports = function GUIAdapter() {};

GUIAdapter.prototype.log = function log(msg) {
  $('pre').append(msg);
};

GUIAdapter.prototype.prompt = function prompt (prompts) {
  $('pre').append(JSON.stringify(prompts, null, ' '));
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

var updateSelect = function($el, list) {
  $el.empty();
  _.each(list, function(item) {
    $el.append('<option name="'+ item +'">' + item + '</option>');
  });
};

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

  var $generator = $('#generator');
  var $subGenerator = $('#subGenerator');
  var $btnRun = $('#btnRun');

  $btnRun.on('click', function() {
    $('pre').empty();
    var gen = $generator.val();
    var subGen = $subGenerator.val();
    if (gen && subGen) {
      env.run([gen+':'+subGen]);
    }
  });

  $generator.on('change', function() {
    $('pre').empty();
    $btnRun.removeAttr('disabled');
    updateSelect($subGenerator, list[this.value]);
  });

  var genList = Object.keys(list);
  genList.unshift('');
  updateSelect($generator, genList);
});
