# MoriModel

A Backbone.Model-like thing based on persistent data structures.

## Overview

You get a `Model` which is just a big graph. It takes an `onChange` callback
as well as initial data. You can do things that look like mutations and then
call `commit()` when you're done which will trigger the `onChange` callback
with a new `Model` instance, leaving the original one untouched.

So you get the benefits of an easy-to-approach, imperative API with the
niceties of immutability.

Then you can create OOP-like views into the `Model` using `createNode()`.
Use this to model your program domain, much like an ORM.

## How to use it

First, model your problem.

```javascript

var morimodel = require('morimodel');

var User = morimodel.createNode({
  getName: function() {
    return this.getData().name;
  },

  uploadPhoto: function(jpgUrl, caption) {
    return Photo.upload(this.model, this, jpgUrl);
  },

  getPhotos: function() {
    return this.getNodesByType('photo', Photo);
  },

  static: {
    register: function(model, name) {
      return this.create(model, name, {name: name});
    }
  }
});

var Photo = morimodel.createNode({
  getHTML: function() {
    // This is a bad idea but I just made it up
    var data = this.getData();
    return '<img src=' + JSON.stringify(data.jpgUrl) + ' alt=' + JSON.stringify(data.caption) + ' />';
  },

  static: {
    upload: function(user, jpgUrl) {
      var newPhoto = this.create(
        model,
        'photo' + Date.now(), // create some unique ID
        {jpgUrl: jpgUrl}
      );
      newPhoto.addEdge('owner', user);
      user.addEdge('photo', newPhoto);
    }
  }
});
```

Then play with your objects:

```javascript
var model = new morimodel.Model(/* change callback here */);

var user = User.register('joe user');
user.uploadPhoto('http://mycdn.com/myjpg.jpg');

// user.getPhotos().length === 1

// commit() saves your changes
var nextModel = model.commit();
var nextUser = User.get(nextModel, 'joe user');

// user.getPhotos().length === 0
// nextUser.getPhotos().length === 1
```

## FAQ

### Is this production ready?

Hell no.

### Why persistent data structures?

They're fast and easy to reason about.

### Why a graph vs Model/Collections?

Graphs are more general and are IMO more natural to work with.

### Why all the OOP?

Because it's easy for people to "fill in the blanks" and model their problem
as objects. The problem with OOP is all the mutation which this removes.

### What about server communication?

We need to build an open-source version of [Flux](https://github.com/cascadiajs/2013.cascadiajs.com/blob/master/proposals/a-better-way-to-structure-clientside-apps_jingc.md)
that uses this library.
