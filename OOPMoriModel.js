var mori = require('mori');

var utils = require('./utils');
var copyProperties = utils.copyProperties;
var emptyFunction = utils.emptyFunction;

var JSONMoriModel = require('./JSONMoriModel');

function OOPMoriModel(moriModel, nodeClasses, onChange) {
  this._moriModel = moriModel || new JSONMoriModel();
  this._nodeClasses = nodeClasses;
  this._onChange = onChange || emptyFunction;
}

copyProperties(OOPMoriModel.prototype, {
  _convertToOOP: function(key, data) {
    if (!data) {
      return null;
    }
    return new this._nodeClasses(this, key, data);
  },
  _convertFromOOP: function(obj) {
    return obj.data;
  },
  getNode: function(key) {
    return this._convertToOOP(key, this._moriModel.getNode(key));
  },
  addNode: function(key, value) {
    this._moriModel.addNode(key, this._convertFromOOP(value));
  },
  updateNode: function(key, updates) {
    this._moriModel.updateNode(key, this._convertFromOOP(newNode));
  },
  removeNode: function(key) {
    var prevNode = this.getNode(key);

    if (prevNode) {
      prevNode.nodeWillDestroy();
    }

    this._moriModel.removeNode(key);
  },
  addEdge: function(type, key, key2, order, data) {
    this._moriModel.addEdge(type, key, key2, order, data);
  },
  removeEdge: function(type, key, key2) {
    this._moriModel.removeEdge(type, key, key2);
  },
  getEdge: function(type, key, key2) {
    return this._moriModel.getEdge(type, key, key2);
  },
  getEdges: function(type, key) {
    return this._moriModel.getEdges(type, key);
  },
  getNodesByType: function(type, key) {
    return mori.reduce(function(accum, edge) {
      accum.push(this.getNode(edge.key2));
      return accum;
    }.bind(this), [], this.getEdges(type, key));
  },
  getNodeByType: function(type, key) {
    return this.getNodes(type, key)[0];
  },
  commit: function() {
    var nextMoriModel = this._moriModel.commit();
    var nextOOPMoriModel = new OOPMoriModel(
      nextMoriModel,
      this._nodeClasses,
      this._onChange
    );
    this._onChange(nextOOPMoriModel);
    return nextOOPMoriModel;
  }
});

copyProperties(OOPMoriModel, {
  createNodeClass: function(type, spec) {
    function NodeClass(model, data) {
      this.nodeWillCreate();

      this.model = model;
      this.data = data;

      this.nodeDidCreate();
    }

    NodeClass.type = type;

    copyProperties(NodeClass.prototype, {
      update: function(update)
    });

    return NodeClass;
  }
});

module.exports = OOPMoriModel;