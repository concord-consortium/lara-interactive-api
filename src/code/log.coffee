log = require 'loglevel'

class Log
  @_instance = null
  @instance: () ->
    @_instance ?= new @
    @_instance
  constructor: (@log="#logger", @out="#dataOut", @in="#dataIn") ->
  warn: (message) ->
    $log = $(@log)
    $msg = $ "<span class='logmsg'>#{message}</span><br/>"
    $log.append($msg)
    $log[0].scrollTop = $log[0].scrollHeight
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
