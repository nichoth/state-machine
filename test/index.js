var test = require('tape')
var Model = require('../')

function MyModel (state) {
    if (!(this instanceof MyModel)) return new MyModel(state)
    Model.call(this, {
        foo: 'bar'
    })
}

Model.extend(MyModel)

MyModel.prototype.update = function (data) {
    this.state.foo = data
    this.publish()
}

test('events', function (t) {
    t.plan(2)
    var myModel = MyModel()
    myModel.onChangeOnce(function (state) {
        console.log('change', state)
        t.deepEqual(state, { foo: 'test' }, 'should emit change')
    })

    var unlisten = myModel.onChange(function () {
        t.fail('should remove listener')
    })
    unlisten()

    myModel.update('test')

    var bus = Model.Bus()
    myModel.listenTo(bus)

    myModel.onChange(function (state) {
        console.log('change2', state)
        t.deepEqual(state, { foo: 'test2' }, 'should listen to the event bus')
    })

    bus.emit('update', 'test2')
})

test('child models', function (t) {
    t.plan(1)

    function Parent (state) {
        if (!(this instanceof Parent)) return new Parent(state)
        Model.call(this, state)
    }
    Model.extend(Parent)

    var child = MyModel()
    var parent = Parent({
        child: child
    })
})

