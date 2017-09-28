'use strict'

function dumpWindow() {
  return ObjC.classes.UIWindow.keyWindow().recursiveDescription().toString()
}

let originalImplementation = null


function toggleTouchID(enable) {
  const subject = 'touchid'
  const { LAContext } = ObjC.classes
  if (!LAContext) {
    return {
      status: 'error',
      reason: 'Touch ID may not be supported by this device'
    }
  }

  const method = LAContext['- evaluatePolicy:localizedReason:reply:']
  if (originalImplementation && !enable) {
    method.implementation = originalImplementation
    originalImplementation = null

    return {
      status: 'ok',
      reason: 'Successfully re-enabled touch id'
    }
  } else if (!originalTouchIdMethod && enable) {
    originalImplementation = method.implementation
    method.implementation = ObjC.implement(method, function(self, sel, policy, reason, reply) {
      send({
        subject,
        event: 'request',
        reason,
        // todo: backtrace
      })
      
      // dismiss the dialog
      const callback = new ObjC.Block(ptr(reply))
      callback.implementation(1, null)
    })
  } else {
    return {
      status: 'error',
      reason: 'invalid on/off argument'
    }
  }
}

module.exports = {
  dumpWindow,
  toggleTouchID,
}