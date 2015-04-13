log = require 'loglevel'

class Log
  @_instance = null
  @instance: () ->
    @_instance ?= new @
    @_instance
  constructor: (@logDiv="#logger", @out="#dataOut", @in="#dataIn") ->

  writeCustomLogDom: (message,severity="warn") ->
    # Possibly update a Dom element with message
    $log = $(@logDiv)
    if $log and $log.size > 0
      $msg = $ "<span class='#{severity} logmsg'>#{message}</span><br/>"
      $log.append($msg)
      $log[0].scrollTop = $log[0].scrollHeight

  warn: (m) ->
    @writeCustomLogDom m, "warn"
    log.warn m
  
  info: (m) ->
    @writeCustomLogDom m, "info"
    log.info m
  
  error: (m) ->
    @writeCustomLogDom m, "error"
    log.error m
    
  dataIn: (message) ->
    $(@in.text) message
  
  dataOut: (message) ->
    $(@out.text) message

module.exports = Log
