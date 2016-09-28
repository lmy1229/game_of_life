# Technical Report

吕梦扬<br/>
2014013452<br/>
lmy1229@126.com

------------------------------------------
## Experiment Requirement

1. Use JavaScript to implement the *Game of Life*. Good style of code, Scalability and module arrangement are required.
2. Use <a href="http://mochajs.org">Mocha</a> to perform **Unit Test**.
3. Technical report, including implementation details and scheme of unit test.

------------------------------------------

## Features

1. Good coding style. The `GameOfLife.js` conforms to Google JavaScript Style.
2. Highly modular and scalable library. Many customized settings.
3. Can be used to implement all kinds of cellular automaton without changing the JavaScript file.
4. Canvas are added to the page in dynamic. User can create a different game at any time he wants to.
5. Adjustable refresh rate.
6. Users can user mouse to create their own pattern. Except for clicking the block one by one, they can simply press the mouse button and drag over the canvas. All blocks on the way will be set.

------------------------------------------

## Implementation Details

  The whole project consists of three parts: a library called `GameOfLife`, a view built on HTML and some control code in JavaScript. The library, located in *src/js/GameOfLife.js*, is the main part of the project. It has three components: the `World` object, which saves the data of the game, the `Engine` object, which controls the logic of the game, and the `Render` object, which is used to draw the world onto the canvas. These three parts will be introduced later in detail. The HTML part and the control part of the project are very simple and will not be introduced in detail.

#### GameOfLife library

  * The `GameOfLife` library is a highly modular library, which can be split into `World`, `Engine` and `Render`. The inspiration of this design comes from the library I used in the summer term called <a href="http://brm.io/matter-js/">Matter.js</a>.
  * The idea is simple. Each object started with a capital letter(`World`, `Engine`, `Render`) has a function called `create`, which is used to create a object with letters in lowercase(`world`, `engine`, `render`). These lowercase objects do not have any functions, but store a set of personal settings that affect the behavior of those uppercase objects. For example, if a `render` object has `render.options.strokeColor = "black"`, the `Render` object will draw a black grid based on this setting.
  * There are several advantages of this design
    1. It is very convenient for users to use this library. Users can change the behavior of the program with simply changing the settings stored in lowercase objects, instead of change the code inside the library.
    2. Users can create several lowercase objects of the same type, providing them several customized settings. More than one games can be running simultaneously with different settings.
    3. It provides good scalability. With this design, the user can control every step of this game without knowing the logic behind the scene. They can even assign a new rule to determine whether or not a block of life is going to become alive or dead.
    4. It easy to run unit test on this library, for there are no global variables except for the `World`, `Engine` and `Render`, and these objects contains no information for a unit test to run on. Every test has to be run on local variables like `world`, `engine` and `render`.
  * Now I will cover the three part of the library respectively.

###### `World` Object

  * Basic information
    * The `World` object and `world` objects only controls the data of the game, including how big the world is and status of each block. It provides no logic function more than calculating number of the surrounding living blocks.
    * The structure of a `world` object is two 2D arrays combined with some other informations. The two 2D arrays are `world.map`, which saves the status of each block, and `world.backmap`, which is used in the `engine` to update the status.
  * `World` functions
    * **World.create(height, width)** Creates a new `world` with given parameters. All blocks of the new world is set to 0 (dead). It uses a nested for-loop to create a 2D world with value 0.
    * **World.randomize(world)** Randomizes the status of each block inside the `world` provided. The probability of a block being set to 1 (alive) is about 20%.
    * **World.clear(world)** Clear the `world` provided and set status of all blocks to 0 (dead).
    * **World.setBlock(World, i, j, status)** Sets the status of block `(i, j)` in the `world` to `status`. When `status` is not provided, it flips the status(1->0, 0->1).
    * **World.sCount(world, x, y)** Calculates the number of living blocks surrounding the block `(x, y)`. When the block is on the border of the map, blocks on the other side of the map will be counted. The calculation is achieved with a nested for-loop that will only run 9 times, as is shown below. Notice that the equation `(x + i + m) % m` can do the trick to count the blocks on the other side of the map.
      ```
      var count = 0;
      for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
          if (i !== 0 || j !== 0) {
            count += world.map[(x + i + m) % m][(y + j + n) % n];
          }
        }
      }
      ```
  * `world` properties
    * **world.map** stores the status informations of the whole world in a 2D array. A value of `1` means the corresponding block is alive, while a value of `0` means dead.
    * **world.backmap** is a auxiliary 2D array that is used by `engine` object in the `Engine.tick` function. It is used to save the time of allocating memory each time the `tick` function is called.
    * **world.height** height of the world.
    * **world.width** width of the world.
    * **world.round** indicates how many rounds has this world been through. Started at 0, and add 1 each time `tick` is called.

###### `Engine` Object

  * Basic information
    * `Engine` object is the logic part of the Game of Life, including proceeding the corresponding world with one round, and starting/stopping a timer according the time interval.
    * One thing to mention is that `engine` objects allow personal customized `evolve` function(controlling whether a block should be dead or alive in the next turn). This makes possible for users to implement different kinds of Cellular Automaton without changing the code inside the library.
  * `Engine` functions
    * **Engine.create(world)** Creates a `engine` object with `engine.world` set to `world` parameter. All other options are set to default.
    * **Engine.setEfunc(engine, efunc)** Sets the `engine.evolve` to `efunc`. For more detail about evolving function, see `engine.evolve` below.
    * **Engine.setInterval(engine, interval)** Sets the time interval of the `engine` to call `Engine.tick`. If the engine is currently running, the previous timer is immediately cleared and a new timer is set to ensure the engine is still running.
    * **Engine.tick(engine)** Proceeds the `engine.world` with one round. Because statuses of all blocks should be updated simultaneously, two nested for-loop is used to complete the task. First, it invoke `engine.evolve` on every block of the map to calculate the next status and save the result to `world.backmap`. Then, it copies the `world.backmap` to `world.map`.
    * **Engine.start(engine)** Starts the given `engine`, so that `Engine.tick(engine)` is called periodically. It uses `document.setInterval` to do the task. The timer handler returned by the `setInterval` is stored in `engine.intervalHandle` so that it can be used to stop the timer in `Engine.stop`
    * **Engine.stop(engine)** Stops the given `engine` by the `intervalHandle` property.
  * `engine` properties
    * **engine.world** is the `world` object the engine is bound to. `engine` will manipulate the data in this world only.
    * **engine.interval** is the interval of each time the `tick` function is called.
    * **engine.intervalHandle** is used to stop the timer.
    * **engine.status** is the status of this engine, 0 for stopped and 1 for running.
    * **engine.render** is the render to which this engine is bound. It is set to undefined until a `render` is created from this engine.
    * **engine.startSetting** is used to handle mouse event.
    * **engine.lastBlock** is also used to handle mouse event.
    * **engine.evolve** is a function to determine whether a block is going to die or live in the next turn. Users can specify customized rules in the form of *function(status, sCount) -> status_next_turn*. An example of customized evolving function is provided in `src/html/index.html`


###### `Render` Object

  * Basic information
    * `Render` object is used to draw the game on the web page. Currently it uses *HTML5 canvas*.
    * `render` object is created by `Render` and is bound to one and only one `engine` object. It stores every setting that `Render` would need to do the drawing.
  * `Render` functions
    * **Render.create(opts)** Creates a new `render` object from the `opts` given. The `opts` parameter has to be a object containing the options the user want to customize. Otherwise, the `render` settings will be set to default. For all options users can specify, please see the `render.options` part below.
    * **Render.render(render)** draw the world onto the canvas using the options in the `render`. This function should be called each time the canvas needs to be updated.
  * `render` properties
    * **render.engine** is the `engine` bound to the render. The render will draw the data in this engine onto the canvas. Can be specified in `Render.create(opts)` by setting `opts.engine`.
    * **render.canvas** is a *HTML5 canvas* element. The render will draw the game onto this canvas. Can be specified in `Render.create(opts)` by setting `opts.canvas`. Not passing this argument will cause the function to create a new canvas by calling `_createCanvas(width, height)` function, which is a private function that is not exposed to users. Users have to insert the created canvas into the HTML DOM.
    * **render.context** is the context gained by calling `render.canvas.getContext('2D')`
    * **render.options** is all options `Render` need to draw the game. Including:
      * **strokeColor** color of the grid lines.
      * **fillColor** color of blocks that will be filled.
      * **blockSize** size(height and width) of each block, in pixel.
      * **startPointX** X coordinate of the left-top of the grid.
      * **startPointY** Y coordinate of the left-top of the grid.
      * **width** width of the canvas.
      * **height** height of the canvas.

###### Others (mouse event handling)
  * The mouse event is implemented by adding event listeners to the canvas element. Since I can't tell which one should handle it, the render or the engine, I made it private inside the library(`_mousedown`, `_mousemove` and `_mouseup` function) so that the users don't know anything about it.
  * When the mouse button is pressed, the `_mousedown` function is triggered, setting the `engine.startSetting` to `true`, and `engine.lastBlock` to the coordinate of the pressed block.
  * Then, when the mouse moves with button pressed, the `_mousemove` functions is triggered. It firstly checks if `engine.startSetting` is set. Then, it checks if `engine.lastBlock` is equal to the block currently mouse is in. finally, it changes the status of current block and set `engine.lastBlock` to this block.
  * When the mouse button releases, the `_mouseup` function is triggered, which set `engine.startSetting` back to false, indicating the end of the whole mouse event cycle.

## Unit Test Report

#### Test environment
```
eslint v3.5.0
```

#### Test Detail
  * Most of the tests are to test if a variable is an object or a function, which is very trivial. Some of other tests are UI-based test, which can only be tested manually by looking at the web page. However, there are two tests that I want to introduce in detail.
  * The first one is the test of `World.sCount` function, which is the very foundation of this project. There are three things that needs to be tested: calculating the sCount in the middle/on the edge/in the corner of the map. Therefore, I designed a 3 * 3 map which is initialized as below:
    ```
    [[1, 1, 0],
     [1, 1, 1],
     [0, 1, 0]]
    ```
  I called `World.sCount(world, 1, 1)`, `World.sCount(world, 1, 0)` and `World.sCount(world, 0, 0)` and got a result of 5, 5, 5 respectively, which is exactly what I'm expecting. This result indicates the correctness of `World.sCount` function.
  * The second test is to examine the 
