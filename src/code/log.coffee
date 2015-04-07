log = require 'loglevel'

class Log
  @_instance = null
  @instance: () ->
    @_instance ?= new @
    @_instance
  constructor: (@log="#logger", @out="#dataOut", @in="#dataIn") ->
  warn: (message) ->
    $(@log).prepend message
    $(@log).prepend "<br/>"
    log.warn message
  info: (m) ->
    @warn(m)
  message: (m) ->
    @warn(m)
  dataIn: (message) ->
    $(@in.text) message
  
  dataOut: (message) ->
    $(@out.text) message

module.exports = Log
