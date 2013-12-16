var mori = require('mori');
var MoriModel = require('./MoriModel');

describe('MoriModel', function() {
  it('works', function() {
    var graph = new MoriModel();

    expect(graph.getNode('mykey')).toBe(null);
    graph.addNode('mykey', mori.hash_map('name', 'myvalue'));
    expect(
      mori.equals(graph.getNode('mykey'), mori.hash_map('name', 'myvalue'))
    ).toBe(true);

    graph.addNode('mykey2', mori.hash_map('name', 'myvalue2'));
    graph.addEdge('friends', 'mykey', 'mykey2');

    var graph2 = graph.commit();

    expect(graph.getNode('mykey')).toBe(null);
    expect(
      mori.equals(graph2.getNode('mykey'), mori.hash_map('name', 'myvalue'))
    ).toBe(true);

    graph = graph2;

    expect(
      mori.equals(
        graph.getNodesByType('friends', 'mykey'),
        mori.vector(mori.hash_map('name', 'myvalue2'))
      )
    ).toBe(true);
  })
});