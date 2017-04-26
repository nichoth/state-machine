var Bus = require('nanobus')
var inherits = require('inherits')

function Model (initState) {
    if (!(this instanceof Model)) return new Model(initState)
    this.state = initState
    var bus = Bus()
    this._bus = bus
    var self = this
    Object.keys(initState).forEach(function (k) {
        if (typeof initState[k].onChange === 'function') {
            console.log('child', initState[k])
            console.log('in here', initState[k].onChange)
            console.log('bla', initState)
            self.state[k] = initState[k].state
            initState[k].onChange.call(initState[k], function (newState) {
                self.state[k] = newState
            })
        }
    })
}

Model.prototype.onChange = function (listener) {
    var self = this
    self._bus.on('change', listener)
    return function removeListener () {
        self._bus.removeListener('change', listener)
    }
}

Model.prototype.onChangeOnce = function (listener) {
    this._bus.once('change', listener)
}

Model.prototype.listenTo = function (bus) {
    var self = this
    bus.on('*', function (evName, data) {
        if (typeof self[evName] !== 'function') return
        self[evName].call(self, data)
    })
}

Model.prototype.publish = function () {
    this._bus.emit('change', this.state)
}

Model.extend = function (constructor) {
    constructor.extend = function (_cons) {
        inherits(_cons, constructor)
    }
    inherits(constructor, Model)
    return constructor
}

Model.Bus = Bus

module.exports = Model
