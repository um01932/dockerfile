define(["app/plugins/sdk"], function(__WEBPACK_EXTERNAL_MODULE_1__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PanelCtrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sdk = __webpack_require__(1);

__webpack_require__(2);

__webpack_require__(3);

__webpack_require__(4);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // will be resolved to app/plugins/sdk

// Remove next imports if you don't need separate styles for light and dark themes


// Remove up to here

var Ctrl = function (_MetricsPanelCtrl) {
    _inherits(Ctrl, _MetricsPanelCtrl);

    function Ctrl($scope, $injector) {
        _classCallCheck(this, Ctrl);

        var _this = _possibleConstructorReturn(this, (Ctrl.__proto__ || Object.getPrototypeOf(Ctrl)).call(this, $scope, $injector));

        _this.events.on('data-received', _this._onDataReceived.bind(_this));
        return _this;
    }

    _createClass(Ctrl, [{
        key: '_onDataReceived',
        value: function _onDataReceived(data) {
            // Group data by level
            var groupByLevel = {};
            var maxLevel = -1;
            for (var i = 0; i < data[0].rows.length; i++) {
                var current = data[0].rows[i];
                if (!groupByLevel.hasOwnProperty(current[3])) groupByLevel[current[3]] = [];

                groupByLevel[current[3]].push({
                    id: current[0],
                    text: current[1],
                    parentId: current[2],
                    lvl: current[3],
					sts: current[4] 
                });

                if (current[3] > maxLevel)
					maxLevel = current[3];
            }

            var nodeLevels = { maxLevel: maxLevel };
            // Now group by parent
            for (var level in groupByLevel) // Go over each level
            {
                nodeLevels[level] = [];

                var nodesInLevel = groupByLevel[level];
                for (var j = 0; j < nodesInLevel.length; j++) // Go over each node in level 
                {
                    var node = nodesInLevel[j];
                    if (node.parentId == null) // Treat case for no parents
                        node.parentId = -1;

                    if (!nodeLevels[level].hasOwnProperty(node.parentId)) nodeLevels[level][node.parentId] = [];

                    nodeLevels[level][node.parentId].push(node);
                }
            }

            this.$scope.nodeLevels = nodeLevels;
            this.$scope.parents = this.getChildNodes();
        }
    }, {
        key: 'getChildNodes',
        value: function getChildNodes(parentId, level) {
            var nodeLevels = this.$scope.nodeLevels;
            level = typeof level === 'undefined' ? 0 : level;
            parentId = typeof parentId === 'undefined' ? parentId = Object.keys(nodeLevels[0])[0] : parentId;
            if (level > nodeLevels.maxLevel) 
				return [];

            var result = [];
			
			for (var index in nodeLevels[level][parentId])
			{
				var node = nodeLevels[level][parentId][index];
				result.push({
					id: node.id,
					text: node.text,
					sts: node.sts,
					children: this.getChildNodes(node.id, level + 1)
				});
			}

            return result;
        }
    }, {
        key: 'link',
        value: function link(scope, element) {
            this.initStyles();
        }
    }, {
        key: 'initStyles',
        value: function initStyles() {
            window.System.import(this.panelPath + 'css/panel.base.css!');
            // Remove next lines if you don't need separate styles for light and dark themes
            if (grafanaBootData.user.lightTheme) {
                window.System.import(this.panelPath + 'css/panel.light.css!');
            } else {
                window.System.import(this.panelPath + 'css/panel.dark.css!');
            }
            // Remove up to here
        }
    }, {
        key: 'panelPath',
        get: function get() {
            if (this._panelPath === undefined) {
                this._panelPath = '/public/plugins/' + this.pluginId + '/';
            }
            return this._panelPath;
        }
    }]);

    return Ctrl;
}(_sdk.MetricsPanelCtrl);

Ctrl.templateUrl = 'partials/template.html';

exports.PanelCtrl = Ctrl;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 4 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ])});;