module.exports = function override(config, env) {
  var babelFilter = function(r) {
    return r.loader && r.loader.indexOf && r.loader.indexOf('babel-loader') >= 0; };
  var babelRule = config.module.rules.filter(babelFilter)[0];
  var storagePath = babelRule.loader.replace(/babel-loader.*/, 'react-native-storage');
  babelRule.include = [].concat(babelRule.include, storagePath);
  return config;
};
