var EdgeKeys = require('./EdgeKeys');

var utils = require('./utils');
var copyProperties = utils.copyProperties;
var emptyFunction = utils.emptyFunction;
var keyMirror = utils.keyMirror;

var LifecycleHooks = keyMirror({
  nodeWillInitialize: null,
  nodeDidInitialize: null,
  nodeDidCreate: null,
  nodeWillUpdate: null,
  nodeDidUpdate: null,
  nodeWillDestroy: null,
  edgeWillAdd: null,
  edgeDidAdd: null,
  edgeWillRemove: null,
  edgeDidRemove: null
});

function combineLifecycleHooks(prevHook, nextHook) {
  return function() {
    prevHook.apply(this, arguments);
    nextHook.apply(this, arguments);
  };
}

function createNode(spec) {
  spec = spec || {};

  var staticSpec = spec.static || {};

  delete spec.static;

  function Node(jsonMoriModel, key) {
    this.nodeWillInitialize();

    this.key = key;
    this.model = jsonMoriModel;

    this.nodeDidInitialize();
  }

  copyProperties(Node.prototype, {
    getData: function() {
      return this.model.getNode(this.key);
    },

    update: function(updates) {
      var prevData = this.getData();

      this.nodeWillUpdate(prevData, updates);

      this.model.updateNode(this.key, updates);

      this.nodeDidUpdate(prevData);
    },

    remove: function() {
      this.nodeWillRemove();

      this.model.removeNode(this.key);
    },

    addEdge: function(type, node, order, data) {
      this.edgeWillAdd(type, node, order, data);

      this.model.addEdge(type, this.key, node.key, order, data);

      this.edgeDidAdd(type, node, order, data);
    },

    removeEdge: function(type, node) {
      this.edgeWillRemove(type, node);

      this.model.removeEdge(type, this.key, node.key);

      this.edgeDidRemove(type, node);
    },

    getEdge: function(type, node) {
      return this.model.getEdge(type, this.key, node.key);
    },

    getEdges: function(type) {
      return this.model.getEdges(type, this.key);
    },

    getNodesByType: function(type, nodeClass) {
      return this.getEdges(type).map(function(edge) {
        return nodeClass.get(this.model, edge[EdgeKeys.KEY2]);
      }.bind(this));
    }
  });

  for (var k in LifecycleHooks) {
    Node.prototype[k] = emptyFunction;
  }

  copyProperties(Node.prototype, spec);

  if (spec.mixins) {
    spec.mixins.forEach(function(mixin) {
      for (var k in mixin) {
        if (!mixin.hasOwnProperty(k)) {
          continue;
        }

        var value = mixin[k];

        if (LifecycleHooks[k]) {
          value = combineLifecycleHooks(Node.prototype[k], value);
        }
        Node.prototype[k] = value;
      }
    });
  }

  copyProperties(Node, {
    get: function(model, key) {
      return new Node(model, key);
    },

    create: function(model, key, data) {
      model.addNode(key, data);
      var node = this.get(model, key);
      node.nodeDidCreate();

      return node;
    }
  });

  if (staticSpec) {
    copyProperties(Node, staticSpec);
  }

  return Node;
}

module.exports = createNode;