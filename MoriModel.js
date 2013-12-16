var mori = require('mori');

var utils = require('./utils');
var copyProperties = utils.copyProperties;
var keyMirror = utils.keyMirror;

var EdgeKeys = keyMirror({
  TYPE: null,
  KEY: null,
  KEY2: null,
  ORDER: null,
  DATA: null
});

// TODO: node types and edge types (classes, indexing)
// TODO: build JSON interface on top (no need to require() mori)
function MoriModel(nodes, edges) {
  this._nodes = this._prevNodes = nodes || mori.hash_map();
  this._edges = this._prevEdges = edges || mori.hash_map();
  this._committed = false;
}

copyProperties(MoriModel.prototype, {
  getNode: function(key) {
    return mori.get(this._nodes, key);
  },
  addNode: function(key, value) {
    this._nodes = mori.assoc(this._nodes, key, value);
  },
  removeNode: function(key) {
    this.addNode(key, null);
  },
  addEdge: function(type, key, key2, order, data) {
    var newEdge = mori.hash_map(
      EdgeKeys.TYPE, type,
      EdgeKeys.KEY2, key2,
      EdgeKeys.ORDER, order || -1,
      EdgeKeys.DATA, data || mori.hash_map()
    );
    if (!mori.get(this._edges, key)) {
      this._edges = mori.assoc(this._edges, key, mori.vector(newEdge));
    } else {
      var prevEdges = mori.get(this._edges, key);
      var replaced = false;
      var newEdges = mori.map(function(edge) {
        if (mori.get(edge, EdgeKeys.TYPE) === type && mori.get(edge, EdgeKeys.KEY2) === key2) {
          replaced = true;
          return newEdge;
        }
      });
      if (!replaced) {
        newEdges = mori.conj(newEdges, newEdge);
      }
      this._edges = mori.assoc(this._edges, key, newEdges);
    }
  },
  removeEdge: function(type, key, key2) {
    var prevEdges = mori.get(this._edges, key);
    if (prevEdges) {
      var nextEdges = mori.filter(function(edge) {
        return !(mori.get(edge, EdgeKeys.TYPE) === type && mori.get(edge, EdgeKeys.KEY2) === key2);
      });
      this._edges = mori.assoc(this._edges, key, nextEdges);
    }
  },
  getEdge: function(type, key, key2) {
    return mori.filter(function(edge) {
      return mori.get(edge, EdgeKeys.KEY2) === key2;
    }, this.getEdges(type, key));
  },
  getEdges: function(type, key) {
    // TODO: we should use a sortedset
    return mori.sort_by(function(edge) {
      return mori.get(edge, EdgeKeys.ORDER);
    }, mori.filter(function(edge) {
      return mori.get(edge, EdgeKeys.TYPE);
    }, mori.get(this._edges, key)));
  },
  getNodesByType: function(type, key) {
    return mori.map(function(edge) {
      return this.getNode(mori.get(edge, EdgeKeys.KEY2));
    }.bind(this), this.getEdges(type, key));
  },
  getNodeByType: function(type, key) {
    return mori.first(this.getNodesByType(type, key));
  },
  commit: function() {
    if (this._committed) {
      throw new Error('You already called commit() on this model.');
    }

    var nextGraph = new this.constructor(this._nodes, this._edges);
    this._nodes = this._prevNodes;
    this._edges = this._prevEdges;
    this._committed = true;

    return nextGraph;
  }
});

module.exports = MoriModel;