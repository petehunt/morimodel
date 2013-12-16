var JSONMoriModel = require('./JSONMoriModel');

describe('JSONMoriModel', function() {
  it('works', function() {
    var graph = new JSONMoriModel();

    expect(graph.getNode('mykey')).toBe(null);
    graph.addNode('mykey', {name: 'myvalue'});
    expect(graph.getNode('mykey')).toEqual({name: 'myvalue'});

    graph.addNode('mykey2', {name: 'myvalue2'});
    graph.addEdge('friends', 'mykey', 'mykey2');

    var graph2 = graph.commit();

    expect(graph.getNode('mykey')).toBe(null);
    expect(graph2.getNode('mykey')).toEqual({name: 'myvalue'});

    graph = graph2;

    expect(graph.getNodesByType('friends', 'mykey')).toEqual([{name: 'myvalue2'}]);

    graph.updateNode('mykey2', {name2: 'changed name'});

    expect(graph.getNodesByType('friends', 'mykey')).toEqual([{name: 'myvalue2', name2: 'changed name'}]);

    graph = graph.commit();
  })
});