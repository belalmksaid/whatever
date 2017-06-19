$( window ).on('resize load', function() {
    if(sandbox.offsetWidth > sandbox.width) {
        sandbox.width = sandbox.offsetWidth;
	    sandbox.height = sandbox.width;
    }
});

class world {
    constructor() {
        this.pellets = new Array();
        this.sweepers = new Array();
    }

    draw(c) {
        for(let i = 0; i < this.pellets.length; i++) {
           this.pellets[i].draw(C);
        }
        for(let i = 0; i < this.sweeprs.length; i++) {
           this.sweepers[i].draw(C);
        }
    }
}

class sweeper {
    constructor(pos, or, spd, rad) {
        this.position = pos;
        this.orientation = or;
        this.speed = spd;
        this.brain = new NeuralNetwork();
        this.input = new Array();
        this.radius = rad;
    }

    reset() {

    }

    update() {
        
    }

    draw(c) {
        c.save();
	    c.translate(this.position.x, this.position.y);
	    c.rotate(this.orientation);
	    c.translate(-this.position.x, -this.position.y);
        rectangleB(c, this.position.x, this.position.y, this.radius, this.radius);
        c.restore();
    }
}

class pellet {
    constructor(pos, rad, col) {
        this.position = pos;
        this.radius = rad;
        this.color = col;
        this.visible = true;
    }

    draw(c) {
        if(this.visible) {
            circleF(c, this.position.x, this.position.y, this.radius, this.color);
        }
    }
}