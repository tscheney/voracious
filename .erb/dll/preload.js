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
/*!*****************************!*\
  !*** ./src/main/preload.js ***!
  \*****************************/

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTzs7Ozs7Ozs7OztBQ1ZBOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7O0FDdEJBLE1BQU0sRUFDRixXQUFXLEVBQ1gsYUFBYSxHQUNoQixHQUFHLG1CQUFPLENBQUMsMEJBQVUsQ0FBQyxDQUFDO0FBRXhCLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUU7SUFDM0IsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ3BCLHFCQUFxQjtRQUNyQixpQ0FBaUM7UUFDakMsd0NBQXdDO1FBQ3BDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BDLEdBQUc7SUFDUCxDQUFDO0lBQ0QsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ3ZCLDREQUE0RDtRQUMxRCxvREFBb0Q7UUFDcEQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3ZELFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsV0FBVyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNILEdBQUc7SUFDUCxDQUFDO0lBQ0Qsc0NBQXNDO0lBQ3RDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFO1FBQ3pCLDZDQUE2QztRQUM3Qyx3Q0FBd0M7UUFDcEMsT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2hELEdBQUc7SUFDUCxDQUFDO0NBQ0osQ0FDSixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vVm9yYWNpb3VzL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9Wb3JhY2lvdXMvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcImVsZWN0cm9uXCIiLCJ3ZWJwYWNrOi8vVm9yYWNpb3VzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1ZvcmFjaW91cy8uL3NyYy9tYWluL3ByZWxvYWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIHtcblx0XHR2YXIgYSA9IGZhY3RvcnkoKTtcblx0XHRmb3IodmFyIGkgaW4gYSkgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyA/IGV4cG9ydHMgOiByb290KVtpXSA9IGFbaV07XG5cdH1cbn0pKGdsb2JhbCwgKCkgPT4ge1xucmV0dXJuICIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImVsZWN0cm9uXCIpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJjb25zdCB7XHJcbiAgICBpcGNSZW5kZXJlcixcclxuICAgIGNvbnRleHRCcmlkZ2UsXHJcbn0gPSByZXF1aXJlKFwiZWxlY3Ryb25cIik7XHJcblxyXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCdhcGknLCB7XHJcbiAgICAgICAgICAgIHNlbmQ6IChjaGFubmVsLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyB3aGl0ZWxpc3QgY2hhbm5lbHNcclxuICAgICAgICAgICAgICAgIC8vbGV0IHZhbGlkQ2hhbm5lbHMgPSBbXCJ0b01haW5cIl07XHJcbiAgICAgICAgICAgICAgICAvL2lmICh2YWxpZENoYW5uZWxzLmluY2x1ZGVzKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZChjaGFubmVsLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIC8vfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZWNlaXZlOiAoY2hhbm5lbCwgZnVuYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiAoT2JqZWN0LnZhbHVlcyhDT05URU5UX0VWRU5UUy5FMkMpLmluY2x1ZGVzKGNoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSBzdHJpcCBldmVudCBhcyBpdCBpbmNsdWRlcyBgc2VuZGVyYCBcclxuICAgICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gKGV2ZW50LCAuLi5hcmdzKSA9PiBmdW5jKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICBpcGNSZW5kZXJlci5vbihjaGFubmVsLCBzdWJzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlwY1JlbmRlcmVyLnJlbW92ZUxpc3RlbmVyKGNoYW5uZWwsIHN1YnNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBGcm9tIHJlbmRlciB0byBtYWluIGFuZCBiYWNrIGFnYWluLlxyXG4gICAgICAgICAgICBpbnZva2U6IChjaGFubmVsLCAuLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2xldCB2YWxpZENoYW5uZWxzID0gaXBjLnJlbmRlci5zZW5kUmVjZWl2ZTtcclxuICAgICAgICAgICAgICAgIC8vaWYgKHZhbGlkQ2hhbm5lbHMuaW5jbHVkZXMoY2hhbm5lbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXBjUmVuZGVyZXIuaW52b2tlKGNoYW5uZWwsIC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgLy99XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=