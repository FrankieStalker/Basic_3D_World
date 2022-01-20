/*
	Github: https://github.com/danielblagy/three_mmi
	
	MIT License

	Copyright (c) 2021 danielblagy
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
	
	You can find an example project in the github repository (https://github.com/danielblagy/three_mmi) under folder
	named 'example'.
	
	UPDATES:
	1/19/2021: added support for the following even types: mouseenter, mouseleave, mousedown, mouseup
	1/20/2021: fixed bug: mouseleave event wouldn't trigger if there was mouseenter for
							another mesh with the same name property
								(mistake in if condition, due to the utility using the mesh names)
			   added xylophone simulation example project
	9/25/2021: changed local variable 'event' to 'e' in function handleEvent(e), as is logically proper,
				and 'event' being deprecated
	
	USAGE:
	// pass threejs scene and camera
	const mmi = new MouseMeshInteraction(scene, camera);
	
	// create an interactable mesh
	const mesh = new THREE.Mesh(geometry, material);
	// specify a name for the mesh (needed for mmi to work, you can give the same name to multiple meshes)
	mesh.name = 'my_interactable_mesh';
	scene.add(mesh);
	
	// there are 7 types of interactions available:
	//		* 'click' 		(left mouse button click)
	//		* 'dblclick' 	(left mouse button double click)
	//		* 'contextmenu' (right mouse button click, triggered before opening the context menu)
	//		* 'mouseenter' 	(mouse cursor is moved onto the element that has the listener attached)
	//		* 'mouseleave' 	(mouse cursor is moved off the element that has the listener attached)
	//		* 'mousedown' 	(mouse button is pressed on an element)
	//		* 'mouseup' 	(mouse button is released over an element)
	
	// create a handler for when user clicks on the mesh with name 'my_interactable_mesh'
	mmi.addHandler('my_interactable_mesh', 'click', function(mesh) {
		console.log('interactable mesh has been clicked!');
		console.log(mesh);
	});
	
	// put mmi.update() inside the graphics update function
	function animate() {
		requestAnimationFrame( animate );
		
		mmi.update();
		
		renderer.render( scene, camera );
	}
	animate();
*/

import * as THREE from 'three'

//Class to handle adding an event to a mesh
class MouseMeshInteractionHandler {
	constructor(mesh_name, handler_function) {
		this.mesh_name = mesh_name;
		this.handler_function = handler_function;
	}
}

class MouseMeshInteraction {
	constructor(scene, camera) {
		this.scene = scene;
		this.camera = camera;
		
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		
		this.updated = false;
		this.event = '';
		
		// last mesh that the mouse cursor was over
		this.last_mouseenter_mesh = undefined;
		// last mesh that the mouse was pressing down
		this.last_pressed_mesh = undefined;
		
		this.handlers = new Map();
		
		//Setting handlers for interactions
		this.handlers.set('click', []);
		this.handlers.set('dblclick', []);
		this.handlers.set('contextmenu', []);
		
		this.handlers.set('mousedown', []);
		this.handlers.set('mouseup', []);
		this.handlers.set('mouseenter', []);
		this.handlers.set('mouseleave', []);
		
		//Setting evert listeners for interactions
		window.addEventListener('mousemove', this);

		window.addEventListener('click', this);
		window.addEventListener('dblclick', this);
		window.addEventListener('contextmenu', this);

		window.addEventListener('mousedown', this);
	}
	
	//Constant check for mouse move within window to detect motion
	handleEvent(e) {
		switch(e.type) {
			case "mousemove": {
				this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
				this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
				this.updated = true;
				this.event = 'motion';
			}
			break;
			default: {
				this.updated = true;
				this.event = e.type;
			}
		}
	}
	
	//To add a handler to a mesh to allow a mesh to be clicked to perform an action
	addHandler(mesh_name, event_type, handler_function) {
		if (this.handlers.has(event_type)) {
			this.handlers.get(event_type).push(new MouseMeshInteractionHandler(mesh_name, handler_function));
		}
	}
	
	update() {
		if (this.updated) {
			//Update the picking ray with the camera and mouse position
			this.raycaster.setFromCamera(this.mouse, this.camera);
			
			//Calculate objects intersecting the picking ray
			const intersects = this.raycaster.intersectObjects(this.scene.children);
			
			if (intersects.length > 0) {
				//Special test for events: 'mouseenter', 'mouseleave'
				if (this.event === 'motion') {
					let mouseenter_handlers = this.handlers.get('mouseenter');
					let mouseleave_handlers = this.handlers.get('mouseleave');
					
					if (mouseleave_handlers.length > 0) {
						for (const handler of mouseleave_handlers) {
							//If mesh was entered by mouse previously, but not anymore, that means the mouse is no longer intersecting that mesh
							if (this.last_mouseenter_mesh !== undefined && intersects[0].object !== this.last_mouseenter_mesh && handler.mesh_name === this.last_mouseenter_mesh.name) {
								handler.handler_function(this.last_mouseenter_mesh);
								break;
							}
						}
					}
					
					if (mouseenter_handlers.length > 0) {
						for (const handler of mouseenter_handlers) {
							//Check for mesh entering new mesh that is not the previous mesh
							if (handler.mesh_name === intersects[0].object.name && intersects[0].object !== this.last_mouseenter_mesh) {
								this.last_mouseenter_mesh = intersects[0].object;
								handler.handler_function(intersects[0].object);
								break;
							}
						}
					}
				}
				else {
					//If mouseup event has occurred
					if (this.event === 'click' && this.last_pressed_mesh === intersects[0].object) {
						for (const handler of this.handlers.get('mouseup')) {
							if (handler.mesh_name === intersects[0].object.name) {
								handler.handler_function(intersects[0].object);
								break;
							}
						}
						//If mouseup does not occur
						this.last_pressed_mesh = undefined;
					}
					
					//For mouseup event handler to work
					if (this.event === 'mousedown') {
						this.last_pressed_mesh = intersects[0].object;
					}
					
					//Check mesh name being the same as object name
					let handlers_of_event = this.handlers.get(this.event);
					for (const handler of handlers_of_event) {
						if (handler.mesh_name === intersects[0].object.name) {
							handler.handler_function(intersects[0].object);
							break;
						}
					}
				}
			}
			//If mouse doesn't intersect any meshes
			else if (this.event === 'motion') {
				//Special test for 'mouseleave' event (since it may be triggered when cursor doesn't intersect with any meshes)
				for (const handler of this.handlers.get('mouseleave')) {
					//If mesh was entered by mouse previously, but not anymore, that means the mouse is no longer intersecting that mesh
					if (this.last_mouseenter_mesh !== undefined && handler.mesh_name === this.last_mouseenter_mesh.name) {
						handler.handler_function(this.last_mouseenter_mesh);
						this.last_mouseenter_mesh = undefined;
						break;
					}
				}
			}
			//Default set update to false
			this.updated = false;
		}
	}
}

//Export MouseMeshInteraction class
export { MouseMeshInteraction };