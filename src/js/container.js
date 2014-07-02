/*
Copyright (c) 2013 William Malone (www.williammalone.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*global window */

var BLOCKS;

if (BLOCKS === undefined) {
	BLOCKS = {};
}

BLOCKS.container = function () {
	
	"use strict";
	
	var container = BLOCKS.eventDispatcher(),
	
		// Private Properties
		motors = [],
		layers = [],
		views = [],
		
		// Private Methods
		motorDestroyed = function (motor) {
			
			var i;
			
			motor.removeEventListener("destroyed", motorDestroyed);
			
			for (i = 0 ; i < motors.length; i += 1)  {
				motors.splice(i, 1);
				break;
			}
		};
	
	// Public Properties
	container.visible = true;
	container.dirty = true;
	
	container.addLayer = function (layer) {
	
	};
	
	container.removeLayer = function (layer) {
	
	};
	
	container.addView = function (view) {
	
		var i, layerInArray;
	
		view.addEventListener("destroyed", container.removeView);
		views.push(view);
		
		for (i = 0; i < layers.length; i += 1) {
			if (view.layer === layers[i]) {
				layerInArray = true;
				break;
			}
		}
		if (!layerInArray) {
			layers.push(view.layer);
		}
	};
	
	container.removeView = function (view) {
	
		var i, layer, keepLayer;
		
		view.removeEventListener("destroyed", container.removeView);
		
		for (i = 0; i < views.length; i += 1) {
			
			if (view === views[i]) {
				layer = views.layer;
				views.splice(i, 1);
				break;
			}
		}
		
		for (i = 0; i < views.length; i += 1) {
			if (view.layer === layer) {
				keepLayer = true;
				break;
			}
		}
		if (!keepLayer) {
			for (i = 0; i < layers.length; i += 1) {
				if (layer === layers[i]) {
					layers.splice(i, 1);
					break;
				}
			}
		}
	};
	
	container.clear = function () {
	
		var i;
			
		for (i = 0; i < layers.length; i += 1) {
			container.layers[i].clear();
		}
	};
	
	container.motorize = function (motor) {
	
		motor.addEventListener("destroyed", motorDestroyed);
		motors.push(motor);
	};
	
	container.removeMotors = function (type) {
		
		var i, motorArr = [];
		
		for (i = 0 ; i < motors.length; i += 1)  {
			if (type) {
				if (motors[i].type === type) {
					motors[i].destroy();
				} else {
					motorArr.push(motors[i]);
				}
			} else {
				motors[i].destroy();
			}
		}
		motors = motorArr;
	};
	
	container.update = function () {
	
		var i;
	
		for (i = 0; i < views.length; i += 1) {
			views[i].update();
		}
	};
	
	container.render = function (e) {
	
		var i, key,
			dirtyLayers = {};

		// Check if any layers were set to dirty (or the container is dirty)
		for (i = 0; i < layers.length; i += 1) {
			if (layers[i].dirty || container.dirty) {
				dirtyLayers[layers[i].name] = layers[i];
			}
		}
		
		// If any view is dirty then mark its layer dirty
		for (i = 0; i < views.length; i += 1) {
			if (views[i].dirty) {
				dirtyLayers[views[i].layer.name] = views[i].layer;
			}
		}
		
		// Clear all dirty layers
		for (key in dirtyLayers) {
			if (dirtyLayers.hasOwnProperty(key)) {
				dirtyLayers[key].clear();
			}
		}
	
		// Mark all container views dirty
		for (i = 0; i < views.length; i += 1) {
			if (dirtyLayers[views[i].layer.name]) {
				views[i].dirty = true;
			}
			if (container.visible) {
				views[i].render(e);
			}
		}
		
		container.dirty = false;
	};
		
	container.destroy = function () {
	
		var i;
		
		for (i = 0; i < views.length; i += 1) {
			container.removeView(views[i]);
			views[i].destroy();
			views[i] = null;
		}
		views = null;
		layers = null;
		motors = null;
	};
	
	return container;
};