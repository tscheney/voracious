(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./app/preload.js ***!
  \************************/

const { ipcRenderer, contextBridge, } = __webpack_require__(/*! electron */ "electron");
contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        // whitelist channels
        //let validChannels = ["toMain"];
        //if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
        //}
    },
    receive: (channel, func) => {
        //if (Object.values(CONTENT_EVENTS.E2C).includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        const subscription = (event, ...args) => func(...args);
        ipcRenderer.on(channel, subscription);
        return () => {
            ipcRenderer.removeListener(channel, subscription);
        };
        //}
    },
    // From render to main and back again.
    invoke: (channel, ...args) => {
        //let validChannels = ipc.render.sendReceive;
        //if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
        //}
    }
});

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTzs7Ozs7Ozs7OztBQ1ZBOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7O0FDdEJBLE1BQU0sRUFDRixXQUFXLEVBQ1gsYUFBYSxHQUNoQixHQUFHLG1CQUFPLENBQUMsMEJBQVUsQ0FBQyxDQUFDO0FBRXhCLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUU7SUFDM0IsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ3BCLHFCQUFxQjtRQUNyQixpQ0FBaUM7UUFDakMsd0NBQXdDO1FBQ3BDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BDLEdBQUc7SUFDUCxDQUFDO0lBQ0QsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ3ZCLDREQUE0RDtRQUMxRCxvREFBb0Q7UUFDcEQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3ZELFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsV0FBVyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNILEdBQUc7SUFDUCxDQUFDO0lBQ0Qsc0NBQXNDO0lBQ3RDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFO1FBQ3pCLDZDQUE2QztRQUM3Qyx3Q0FBd0M7UUFDcEMsT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2hELEdBQUc7SUFDUCxDQUFDO0NBQ0osQ0FDSixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vVm9yYWNpb3VzL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9Wb3JhY2lvdXMvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcImVsZWN0cm9uXCIiLCJ3ZWJwYWNrOi8vVm9yYWNpb3VzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1ZvcmFjaW91cy8uL2FwcC9wcmVsb2FkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSB7XG5cdFx0dmFyIGEgPSBmYWN0b3J5KCk7XG5cdFx0Zm9yKHZhciBpIGluIGEpICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgPyBleHBvcnRzIDogcm9vdClbaV0gPSBhW2ldO1xuXHR9XG59KShnbG9iYWwsICgpID0+IHtcbnJldHVybiAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiY29uc3Qge1xyXG4gICAgaXBjUmVuZGVyZXIsXHJcbiAgICBjb250ZXh0QnJpZGdlLFxyXG59ID0gcmVxdWlyZShcImVsZWN0cm9uXCIpO1xyXG5cclxuY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZCgnYXBpJywge1xyXG4gICAgICAgICAgICBzZW5kOiAoY2hhbm5lbCwgZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gd2hpdGVsaXN0IGNoYW5uZWxzXHJcbiAgICAgICAgICAgICAgICAvL2xldCB2YWxpZENoYW5uZWxzID0gW1widG9NYWluXCJdO1xyXG4gICAgICAgICAgICAgICAgLy9pZiAodmFsaWRDaGFubmVscy5pbmNsdWRlcyhjaGFubmVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmQoY2hhbm5lbCwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVjZWl2ZTogKGNoYW5uZWwsIGZ1bmMpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vaWYgKE9iamVjdC52YWx1ZXMoQ09OVEVOVF9FVkVOVFMuRTJDKS5pbmNsdWRlcyhjaGFubmVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHkgc3RyaXAgZXZlbnQgYXMgaXQgaW5jbHVkZXMgYHNlbmRlcmAgXHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IChldmVudCwgLi4uYXJncykgPT4gZnVuYyguLi5hcmdzKTtcclxuICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIub24oY2hhbm5lbCwgc3Vic2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5yZW1vdmVMaXN0ZW5lcihjaGFubmVsLCBzdWJzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8gRnJvbSByZW5kZXIgdG8gbWFpbiBhbmQgYmFjayBhZ2Fpbi5cclxuICAgICAgICAgICAgaW52b2tlOiAoY2hhbm5lbCwgLi4uYXJncykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9sZXQgdmFsaWRDaGFubmVscyA9IGlwYy5yZW5kZXIuc2VuZFJlY2VpdmU7XHJcbiAgICAgICAgICAgICAgICAvL2lmICh2YWxpZENoYW5uZWxzLmluY2x1ZGVzKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlwY1JlbmRlcmVyLmludm9rZShjaGFubmVsLCAuLi5hcmdzKTtcclxuICAgICAgICAgICAgICAgIC8vfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9