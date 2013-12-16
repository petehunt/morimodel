var JSONMoriModel = require('../src/JSONMoriModel');
var createNode = require('../src/createNode');

describe('createNode', function() {
  it('should work', function() {
    var User = createNode({
      getDescription: function() {
        var data = this.getData();
        return 'User ' + data.name + ', age ' + data.age + ' (' + this.getNodesByType('friend', User).length + ' friends)';
      },
      addFriend: function(node) {
        this.addEdge('friend', node);
        node.addEdge('friend', this);
      },
      getFriends: function() {
        return this.getNodesByType('friend', User);
      },
      static: {
        createUser: function(model, name, age) {
          return this.create(model, name, {name: name, age: age});
        }
      }
    });

    var model = new JSONMoriModel();

    var u1 = User.createUser(model, 'pete', 25);
    var u2 = User.createUser(model, 'tina', 26);

    u1.addFriend(u2);

    expect(u1.getDescription()).toBe('User pete, age 25 (1 friends)');
    expect(u2.getDescription()).toBe('User tina, age 26 (1 friends)');

    model = model.commit();

    u1 = User.get(model, 'pete');

    expect(u1.getDescription()).toBe('User pete, age 25 (1 friends)');
    expect(u1.getFriends().length).toBe(1);
    expect(u1.getFriends()[0].getDescription()).toBe('User tina, age 26 (1 friends)');
  });
});