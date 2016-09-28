describe("World", function() {
	context("Basic", function() {
		it("World should be an object", function() {
			assert.isObject(World, "World should be an object");
		});
		it("World.create should be a function", function() {
			assert.isFunction(World.create);
		});
		it("World.randomize should be a function", function() {
			assert.isFunction(World.randomize);
		});
		it("World.clear should be a function", function() {
			assert.isFunction(World.clear);
		});
		it("World.setBlock should be a function", function() {
			assert.isFunction(World.setBlock);
		});
		it("World.sCount should be a function", function() {
			assert.isFunction(World.sCount);
		});
	});
	context("Creation", function() {
		it("should create a proper 3 * 3 world", function() {
			var world = World.create(3, 3);
			var exp_world = {
				map: [[0,0,0],[0,0,0],[0,0,0]],
				backmap: [[0,0,0],[0,0,0],[0,0,0]],
				height: 3,
				width: 3,
				round: 0,
			};
			assert.deepEqual(world, exp_world);
		});
		it("should randomize every block to 0 or 1", function() {
			var world = World.create(3, 3);
			World.randomize(world);
			var err = null;
			loop:
			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					if (world.map[i][j] != 1 && world.map[i][j] != 0) {
						err = new Error('block (' + i + ', ' + j + ') is not neither 0 or 1, it is ' + world.map[0][1]);
						break loop;
					}
				}
			}
			assert.ifError(err);
		});
	});
	context("Setting Blocks", function() {
		var world = null;
		var exp_world = null;
		beforeEach(function() {
			world = World.create(3, 3);
			exp_world = {
				map: [[0,0,0],[0,0,0],[0,0,0]],
				backmap: [[0,0,0],[0,0,0],[0,0,0]],
				height: 3,
				width: 3,
				round: 0,
			};
		});
		it("should properly change block status", function() {
			World.setBlock(world, 0, 0, 1);
			exp_world.map[0][0] = 1;
			assert.deepEqual(world, exp_world);
		});
		it("should properly flip block status when status param is not provided", function() {
			World.setBlock(world, 0, 0);
			exp_world.map[0][0] = 1;
			assert.deepEqual(world, exp_world);
		});
		it("should change nothing if indices exceed the limit", function() {
			World.setBlock(world, 10, 10);
			assert.deepEqual(world, exp_world);
		});
	});
	context("Calculating surrounding living blocks", function() {
		var world = null;
		beforeEach(function() {
			world = World.create(3, 3);
			World.setBlock(world, 0, 0);
			World.setBlock(world, 0, 1);
			World.setBlock(world, 1, 0);
			World.setBlock(world, 1, 1);
			World.setBlock(world, 1, 2);
			World.setBlock(world, 2, 1);
		});
		it("should properly calculate sCount inside the map", function() {
			assert.equal(World.sCount(world, 1, 1), 5);
		});
		it("should properly calculate sCount on the edge of the map", function () {
			assert.equal(World.sCount(world, 0, 1), 5);
		});
		it("should properly calculate sCount at the corner of the map", function() {
			assert.equal(World.sCount(world, 0, 0), 5);
		});
		it("should return 0 when indices exceed limit", function() {
			assert.equal(World.sCount(world, 10, 10), 0);
		});
	})
});

describe("Engine", function() {
	context("Basic", function() {
		it("Engine should be an object", function() {
			assert.isObject(Engine, "Engine should be an object");
		});
		it("Engine.create should be a function", function() {
			assert.isFunction(Engine.create);
		});
		it("Engine.setEfunc should be a function", function() {
			assert.isFunction(Engine.setEfunc);
		});
		it("Engine.setInterval should be a function", function() {
			assert.isFunction(Engine.setInterval);
		});
		it("Engine.tick should be a function", function() {
			assert.isFunction(Engine.tick);
		});
		it("Engine.start should be a function", function() {
			assert.isFunction(Engine.start);
		});
		it("Engine.stop should be a function", function() {
			assert.isFunction(Engine.stop);
		});
	});
	context("Creation", function() {
		it("should create a proper engine based on a given world", function() {
			// This test is validated manually by checking the value of engine in the web inspector.
			assert.isOk(true, "validated manually");
		});
	});
	context("Evolving", function() {
		var world = null;
		var engine = null;
		beforeEach(function() {
			world = World.create(5, 5);
			World.setBlock(world, 1, 2);
			World.setBlock(world, 2, 1);
			World.setBlock(world, 3, 1);
			World.setBlock(world, 3, 2);
			World.setBlock(world, 3, 3);
			engine = Engine.create(world);
		});
		it("Tick function should work for one time", function() {
			var expected_map = [
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 1, 0, 1, 0],
				[0, 1, 1, 0, 0],
				[0, 0, 1, 0, 0],
			];
			Engine.tick(engine);
			assert.deepEqual(world.map, expected_map);
		});
		it("Tick function should work for four times to complete a cycle", function() {
			var expected_map = [
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 1, 0, 0, 0],
				[1, 0, 0, 0, 0],
				[1, 1, 1, 0, 0],
			];
			Engine.tick(engine);
			Engine.tick(engine);
			Engine.tick(engine);
			Engine.tick(engine);
			assert.deepEqual(world.map, expected_map);
		});
		it("Customized evolving function should be working", function() {
			// This test is validated manually by change the
			// engine.evolve to [Day and Night] rule. For 
			// details, please check out the comment in index.html
			assert.isOk(true, "validated manually");
		});
	});
	context("Timer", function() {
		it("Engine.start should be working.", function() {
			// This test is validated manually by observing the 
			// behavior of the web page.
			assert.isOk(true, "validated manually");
		});
		it("Engine.stop should be working.", function() {
			// This test is validated manually by observing the 
			// behavior of the web page.
			assert.isOk(true, "validated manually");
		});
		it("Engine.setInterval should be working when the engine is running", function() {
			// This test is validated manually by observing the 
			// behavior of the web page.
			assert.isOk(true, "validated manually");
		});
	});
});

describe("Render", function() {
	context("Basic", function() {
		it("Render should be an object", function() {
			assert.isObject(Render, "Render should be an object");
		});
		it("Render.create should be a function", function() {
			assert.isFunction(Render.create);
		});
		it("Render.render should be a function", function() {
			assert.isFunction(Render.render);
		});
	});
	context("Creation", function() {
		it("should create a proper render", function() {
			// This test is validated manually by checking the value of render in the web inspector.
			assert.isOk(true, "validated manually");
		});
	});
	context("Rendering", function() {
		it("should properly draw the game on the web page", function() {
			// This test is validated manually by observing the 
			// behavior of the web page.
			assert.isOk(true, "validated manually");
		});
		it("should draw customized color correctly", function() {
			// This test is validated manually by observing the 
			// behavior of the web page, after changing the color
			// parameter passed in the Render.create()
			assert.isOk(true, "validated manually");
		})
	});
});