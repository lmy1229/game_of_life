/* global window */
/* global document */

var World = {};
var Engine = {};
var Render = {};

(function() {
  var _createCanvas = function(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.oncontextmenu = function() {
      return false;
    };
    canvas.onselectstart = function() {
      return false;
    };
    return canvas;
  };

  var _getCoordinate = function(event) {
    var x = event.clientX;
    var y = event.clientY;
    return {x: x, y: y};
  };

  var _getIndices = function(render, coor) {
    var rect = render.canvas.getBoundingClientRect();
    var options = render.options;
    var y = Math.floor((coor.x - options.startPointX - rect.left) / options.blockSize);
    var x = Math.floor((coor.y - options.startPointY - rect.top) / options.blockSize);
    return {x: x, y: y};
  };

  var _mousedown = function(engine, coor) {
    engine.lastBlock = {x: coor.x, y: coor.y};
    engine.startSetting = true;
    World.setBlock(engine.world, coor.x, coor.y);
    Render.render(engine.render);
  };

  var _mousemove = function(engine, coor) {
    // if the mouse is not pressed down.
    if (engine.startSetting === false) {
      return;
    }
    // if this block is the same as the last one.
    if (coor.x === engine.lastBlock.x && coor.y === engine.lastBlock.y) {
      return;
    }
    engine.lastBlock = coor;
    World.setBlock(engine.world, coor.x, coor.y);
    Render.render(engine.render);
  };

  var _mouseup = function(engine, coor) {
    engine.lastBlock = null;
    engine.startSetting = false;
  };

/* -------------------  WORLD  -------------------- */

  /**
   * Create a new 2D world
   * @method create
   * @param {int} m -- height of the world
   * @param {int} n -- width of the world
   * @return {world} world -- world created
   */
  World.create = function(m, n) {
    var world = {};
    world.map = new Array(m);
    world.backmap = new Array(m);
    world.height = m;
    world.width = n;
    world.round = 0;

    var temp;
    for (var i = 0; i < m; i++) {
      temp = new Array(n);
      for (var j = 0; j < temp.length; j++) {
        temp[j] = 0;
      }
      world.map[i] = temp.concat();
      world.backmap[i] = temp.concat();
    }
    return world;
  };

  /**
   * Randomize a created world
   * @method randomize
   * @param {world} world -- pre-created world
   */
  World.randomize = function(world) {
    var m = world.height;
    var n = world.width;
    var temp = 0;
    for (var i = 0; i < m; i++) {
      for (var j = 0; j < n; j++) {
        temp = Math.round(Math.random() * 10);
        world.map[i][j] = temp < 2 ? 1 : 0;
      }
    }
  };

  /**
   * Clear the world
   * @method clear
   * @param {world} world -- pre-created world
   */
  World.clear = function(world) {
    var m = world.height;
    var n = world.width;
    for (var i = 0; i < m; i++) {
      for (var j = 0; j < n; j++) {
        world.map[i][j] = 0;
      }
    }
    world.round = 0;
  };

  /**
   * Set(flip) one block
   * @method setBlock
   * @param {world} world -- pre-created world
   * @param {int} i -- y index of the block
   * @param {int} j -- x index of the block
   * @param {optional_int} status -- dest status
   */
  World.setBlock = function(world, i, j, status) {
    var m = world.height;
    var n = world.width;
    if (i < 0 || i >= m || j < 0 || j >= n) {
      return;
    }
    if (status === undefined) {
      world.map[i][j] = 1 - world.map[i][j];
    } else if (status === 0 || status === 1) {
      world.map[i][j] = status;
    }
  };

  /**
   * Count the living blocks surrounding a given block
   * @method sCount
   * @param {world} world -- pre-created world
   * @param {int} x -- x coordinate of the given block
   * @param {int} y -- y coordinate of the given block
   * @return {int} count -- number of the living surrounding blocks
   */
  World.sCount = function(world, x, y) {
    var m = world.height;
    var n = world.width;

    // Out of bound
    if (x < 0 || x >= m || y < 0 || y >= n) {
      return 0;
    }

    var count = 0;
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++) {
        if (i !== 0 || j !== 0) {
          count += world.map[(x + i + m) % m][(y + j + n) % n];
        }
      }
    }
    return count;
  };

/* -------------------  ENGINE  -------------------- */

  /**
   * Create a new engine
   * @method create
   * @param {optional_world} world -- the world that will bind with the engine
   * @return {engine} engine -- the engine created
   */
  Engine.create = function(world) {
    var engine = {};

    // default
    engine.world = world;
    engine.interval = 30;
    engine.intervalHandle = undefined;
    engine.status = 0;    // 0-stopped | 1-running
    engine.render = undefined;
    engine.startSetting = false;

    engine.evolve = function(status, surCount) {
      if (surCount === 3) {
        return 1;
      } else if (surCount === 2) {
        return status;
      }
      return 0;
    };

    return engine;
  };

  /**
   * Set evolvement function of a created engine(override)
   * @method setEfunc
   * @param {engine} engine -- created engine
   * @param {function} efunc -- evolvement function
   */
  Engine.setEfunc = function(engine, efunc) {
    engine.evolve = efunc;
  };

  /**
   * Set interval time of a created engine(override the default)
   * @method setInterval
   * @param {engine} engine - created engine
   * @param {int} interval -- interval time(in ms)
   */
  Engine.setInterval = function(engine, interval) {
    engine.interval = interval;
    if (engine.status === 1) {
      engine.status = 0;
      window.clearInterval(engine.intervalHandle);
      this.start(engine);
    }
  };

  /**
   * Proceed the world with one round
   * @method tick
   * @param {engine} engine - created engine
   */
  Engine.tick = function(engine) {
    var m = engine.world.height;
    var n = engine.world.width;
    var world = engine.world;
    var map = engine.world.map;
    var temp = engine.world.backmap;
    var i = 0;
    var j = 0;

    for (i = 0; i < m; i++) {
      for (j = 0; j < n; j++) {
        temp[i][j] = engine.evolve(map[i][j], World.sCount(world, i, j));
      }
    }

    for (i = 0; i < m; i++) {
      for (j = 0; j < n; j++) {
        map[i][j] = temp[i][j];
      }
    }

    world.round += 1;
  };

  /**
   * Start engine
   * @method start
   * @param {engine} engine - created engine
   */
  Engine.start = function(engine) {
    if (engine.status === 1) {
      return;
    }
    engine.intervalHandle = window.setInterval(function() {
      Engine.tick(engine);
      Render.render(engine.render);
    }, engine.interval);
    engine.status = 1;
  };

  /**
   * Stop engine
   * @method stop
   * @param {engine} engine - created engine
   */
  Engine.stop = function(engine) {
    if (engine.status === 0) {
      return;
    }
    window.clearInterval(engine.intervalHandle);
    engine.status = 0;
  };

/* -------------------  RENDER  -------------------- */

  /**
   * Create a render
   * @method create
   * @param {obj} opts -- render options
   * @return {render} render -- render created
   */
  Render.create = function(opts) {
    var render = {};
    // default values
    render.options = {};
    render.options.strokeColor = opts.strokeColor || "black";
    render.options.fillColor = opts.fillColor || "black";
    render.options.blockSize = opts.blockSize || 10;
    render.options.startPointX = opts.startPointX || 20;
    render.options.startPointY = opts.startPointY || 20;
    if (opts.engine) {
      render.engine = opts.engine;
      opts.engine.render = render;
    }
    render.options.width = (opts.width ||
                            10 * render.engine.world.width + 40 ||
                            800);
    render.options.height = (opts.height ||
                             10 * render.engine.world.height + 40 ||
                             600);
    render.canvas = opts.canvas ||
                    _createCanvas(render.options.width, render.options.height);
    render.context = render.canvas.getContext('2d');

    // canvas event(handled by engine)
    if (render.engine) {
      render.canvas.addEventListener('mousedown', function(event) {
        var coor = _getCoordinate(event);
        _mousedown(render.engine, _getIndices(render, coor));
      });
      render.canvas.addEventListener('mousemove', function(event) {
        var coor = _getCoordinate(event);
        _mousemove(render.engine, _getIndices(render, coor));
      });
      render.canvas.addEventListener('mouseup', function(event) {
        var coor = _getCoordinate(event);
        _mouseup(render.engine, _getIndices(render, coor));
      });
    }

    return render;
  };

  Render.render = function(render) {
    var engine = render.engine;
    var world = engine.world;
    var map = world.map;
    var canvas = render.canvas;
    var context = render.context;
    var i = 0;
    var j = 0;

    var startPointX = render.options.startPointX;
    var startPointY = render.options.startPointY;
    var blockSize = render.options.blockSize;
    // clear the canvas
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'source-over';
    // set fill and stroke style
    context.fillStyle = render.options.fillColor;
    context.strokeStyle = render.options.strokeColor;

    // draw round number
    context.fillText("Round: " + render.engine.world.round, 10, 15);

    // draw grids
    for (i = 0; i < world.height; i++) {
      for (j = 0; j < world.width; j++) {
        if (map[i][j] === 1) {
          context.fillRect(startPointX + j * blockSize,
                           startPointY + i * blockSize,
                           blockSize,
                           blockSize);
          context.strokeRect(startPointX + j * blockSize,
                           startPointY + i * blockSize,
                           blockSize,
                           blockSize);
        } else {
          context.strokeRect(startPointX + j * blockSize,
                           startPointY + i * blockSize,
                           blockSize,
                           blockSize);
        }
      }
    }
  };
})();
