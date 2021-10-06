define([
  'common/lodash', 'views/ro/ro-tagging-admin'
], function(_) {
  function Ctrl() {
  }
  Ctrl.tweakBundle = function(bundle, extension) {
    var entityRoots = _.get(bundle, 'entityHierarchy.roots')
        || _.get(bundle, 'entityList', []);
    bundle.entityTree = buildWebixTree({ children: entityRoots });
    bundle.tagTree = buildWebixTree({
      children: _.get(bundle, 'tagHierarchy.roots', []) || []
    });
    bundle.allocations = (bundle.allocations || []).map(function(alloc) {
      return { id: alloc.id, object: alloc };
    });
    bundle.profile = _.find(bundle.profiles);
  };
  Ctrl.prototype.serialize = function(serialization) {
    var self = this;
    Object.keys(serialization || {}).forEach(function(key) {
      if (/^\$allocationValues\$.+$/.test(key)) {
        var allocation = serialization[key];
        var taggings = _.find(_.get(allocation, 'snapshot.auxiliary')) || {};
        if (_.isEmpty(Object.keys(taggings))) {
          delete serialization[key];
          return;
        }
        _.set(allocation, 'snapshot.tags', taggings);
        if (_.every(taggings, function(tag) { return tag === null; })) {
          _.set(allocation, 'snapshot.auxiliary', null);
          _.set(allocation, 'snapshot.tags', null);
          _.set(allocation, 'snapshot.activeTo', self.context.validOn);
          delete allocation.snapshot.activeFrom;
        }
      }
    });
    // Note: it is necessary to clone to avoid interference from the snapshot stripping
    _.set(serialization, 'options.addedTaggings', _.cloneDeep(_.find(this.views).ui.addedTaggings || {}));
    _.set(serialization, 'options.removedTaggings', _.cloneDeep(_.find(this.views).ui.removedTaggings || {}));
    _.values(serialization.options.addedTaggings).forEach(function(tagging) {
      delete tagging.pending;
    });
    _.values(serialization.options.removedTaggings).forEach(function(tagging) {
      delete tagging.pending;
    });
  };
  Ctrl.prototype.populate = function(bundle, extension, options, task) {
    var view = _.find(this.views);
    _.set(view, 'ui.addedTaggings', options.addedTaggings || {});
    _.set(view, 'ui.removedTaggings', options.removedTaggings || {});
    _.set(view, 'ui.savedAddedTaggings', _.cloneDeep(options.addedTaggings) || {});
    _.set(view, 'ui.savedRemovedTaggings', _.cloneDeep(options.removedTaggings) || {});
  };
  return Ctrl;

  function buildWebixTree(hierarchy, tree) {
    hierarchy = hierarchy || {};
    tree = tree || {};
    if (_.get(hierarchy, 'children.length')) {
      tree.data = [];
      hierarchy.children.forEach(function(child) {
        var item = {
          id: child.id,
          object: {
            id: child.id,
            snapshot: _.cloneDeep(child.snapshot || {})
          }
        };
        tree.data.push(item);
        buildWebixTree(child, item);
      });
    }
    return tree;
  }
});
