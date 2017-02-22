var GOF = {
	LAYERS: 3,
	NPL: 8,
	RADIUS: 5,
	MAXSPEED: 2,
	FOODCOLOR: new color(255, 110, 100),
	FOODVALUE: 75,
	BIRTH: 200
}

function sprite(w) {
	this.type = "sprite";
	this.brain = new NeuralNetwork(14, 6, GOF.LAYERS, GOF.NPL);
	if(w == null) {
		this.brain.create();
	}
	else {
		this.brain.putWeights(w);
	}
	this.gene = new gene(this.brain.getWeights(), 0);
	this.memory = [0, 0, 0, 0];
	this.position = v(40, 40);
	this.radius = GOF.RADIUS;
	this.orientation = 0;
	this.speed = 1;
	this.health = GOF.BIRTH;
	this.vertices = [];
	this.geneType = 0;
	this.setShape = function() {
		this.vertices = [];
		for(var i = 0; i < this.gene.weights.length; i += Math.floor(this.gene.weights.length / 6)) {
			this.vertices.push(v(this.gene.weights[i] * this.radius, this.gene.weights[i + 1] * this.radius));
		}
	}
	this.setShape();
	this.update = function(a, b, c, d, e) {
		this.position.x += this.speed * Math.cos(this.orientation);
		this.position.y += this.speed * Math.sin(this.orientation);
		var op = this.brain.update([this.position.x, this.position.y, this.speed, this.orientation, this.health, a, b, c, d, e, this.memory[0], this.memory[1], this.memory[2], this.memory[3]]);
		this.orientation = op[0] * Math.PI * 2.0;
		this.speed = op[1];
		this.memory = op.splice(2, 4);
		this.health -= 0.1;// + this.speed * 0.025;
		this.gene.fitness = this.health;
		this.geneType = this.memory[3];
	}
	this.draw = function(c) {
		//drawPolyB(c, this.position.x, this.position.y, this.vertices, this.orientation);
		//circleB(c, this.position.x, this.position.y, this.radius);
		circleF(c, this.position.x, this.position.y, this.radius, new color(Math.floor(this.memory[0] * 255), Math.floor(this.memory[1] * 255), Math.floor(this.memory[2] * 255)))
	}
}

function food() {
	this.type = "food";
	this.radius = GOF.RADIUS * 0.25;
	this.position = v(0, 0);
	this.health = GOF.FOODVALUE;
	this.draw = function(c) {
		circleF(c, this.position.x, this.position.y, this.radius, GOF.FOODCOLOR);
	}
	this.update = function() {		
	}
}

function Camera(s, z) {
	this.center = s;
	this.zoom = z;
}

function intersect(a, b) {
	return Math.sqrt((a.position.x - b.position.x) * (a.position.x - b.position.x) + (a.position.y - b.position.y) * (a.position.y - b.position.y)) < (a.radius + b.radius);
}

function World(canvas, w, h, n) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.width = w;
	this.height = h;
	this.sprites = [];
	this.foodSprites = [];
	this.genePool = new GenePool();
	this.foodCounter = 10;
	this.n = n;
	this.reset = function() {
		this.sprites = [];
		this.foodSprites = [];
		for(var i = 0; i < this.n; i++) {
			this.sprites.push(new sprite());
			this.sprites[this.sprites.length - 1].position = v(Disque.random(0, this.width), Disque.random(0, this.height));
			this.genePool.genes.push(this.sprites[this.sprites.length - 1].gene);
			if(i % 5 == 0) {
				this.foodSprites.push(new food());
				this.foodSprites[this.foodSprites.length - 1].position = v(Disque.random(0, this.width), Disque.random(0, this.height));
			}
		}
	}
	this.reset();
	this.clearRect = function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	this.bottleNeck = function() {
		this.genePool.epoch2(this.n);
		this.sprites = [];
		this.foodSprites = [];
		for(var i = 0; i < this.genePool.genes.length; i++) {
			this.sprites.push(new sprite());
			this.sprites[this.sprites.length - 1].position = v(Disque.random(0, this.width), Disque.random(0, this.height));
			this.sprites[this.sprites.length - 1].gene = this.genePool.genes[i];
			this.sprites[this.sprites.length - 1].brain.putWeights(this.genePool.genes[i].weights);
			this.sprites[this.sprites.length - 1].setShape();
			if(i % 5 == 0) {
				this.foodSprites.push(new food());
				this.foodSprites[this.foodSprites.length - 1].position = v(Disque.random(0, this.width), Disque.random(0, this.height));
			}
		}
	}
	this.resolveInteraction = function(a, b, i, j) {
		if(b.type == "food") {
			a.health += b.health;
			//this.foodSprites.splice(j, 1)
			b.position = v(Disque.random(0, this.width), Disque.random(0, this.height));
		}
		else {
			if(Math.abs(a.geneType - b.geneType) < this.genePool.elite / 5 && (a.health > 2 * GOF.BIRTH && b.health > 2 * GOF.BIRTH)) {
				var child1 = new sprite(), child2 = new sprite();
				var gene1 = new Array();
				var gene2 = new Array();
				this.genePool.breed(a.gene.weights, b.gene.weights, gene1, gene2);
				child1.gene.weights = gene1;
				child2.gene.weights = gene2;
				child1.brain.putWeights(gene1);
				child2.brain.putWeights(gene2);
				a.health -= GOF.BIRTH;
				b.health -= GOF.BIRTH;
				child1.health = child2.health = GOF.BIRTH;
				child1.position = v(Disque.random(0, this.width), Disque.random(0, this.height));
				child2.position = v(Disque.random(0, this.width), Disque.random(0, this.height));
				this.genePool.genes.push(child1.gene);
				this.genePool.genes.push(child2.gene);
				child1.setShape();
				child2.setShape();
				this.sprites.push(child1);
				this.sprites.push(child2);
				console.log("Children!");
			}
			else if(Math.abs(Math.abs(a.geneType) - Math.abs(b.geneType)) > this.genePool.elite * 1.5) {
				if(Math.abs(a.geneType) > Math.abs(b.geneType)) {
					a.health += b.health;
					b.health = 0;
					console.log("KO!");
					return 1;
				}
				else {
					b.health += a.health;
					a.health = 0;
					console.log("KO!");
					return 2;
				}
			}
		}
		return 0;
	}
	this.update = function() {
		/*this.foodCounter--;
		if(this.foodCounter <= 0) {
			this.foodCounter = 10;
			this.foodSprites.push(new food());
			this.foodSprites[this.foodSprites.length - 1].position = v(Disque.random(0, this.width), Disque.random(0, this.height));
		}*/
		for(var i = 0; i < this.sprites.length; i++) {
			var d = 100000;
			var ind = 0;
			var a = this.sprites[i];
			var ind2 = 0;
			var d2 = 100000;
			if(a.position.x < 0 || a.position.x > this.width || a.position.y < 0 || a.position.y > this.height) {
				this.sprites.splice(i, 1);
				this.genePool.genes.splice(i, 1);
				console.log("Out of line!");
				continue;
			}
			for(var j = 0; j < this.foodSprites.length; j++) {
				if(intersect(this.sprites[i], this.foodSprites[j])) { 
					var n = this.resolveInteraction(this.sprites[i], this.foodSprites[j], i, j);
				}
			}
			for(var j = 0; j < this.foodSprites.length; j++) {
				var b = this.foodSprites[j];
				var t = (a.position.x - b.position.x) * (a.position.x - b.position.x) + (a.position.y - b.position.y) * (a.position.y - b.position.y);
				if(t < d2) {
					ind2 = j;
					d2 = t;
				}
			}
			for(var j = i + 1; j < this.sprites.length; j++) {
				if(intersect(this.sprites[i], this.sprites[j])) {
					var n = this.resolveInteraction(this.sprites[i], this.sprites[j]);
				}
			}
			for(var j = i + 1; j < this.sprites.length; j++) {
				var b = this.sprites[j];
				var t = (a.position.x - b.position.x) * (a.position.x - b.position.x) + (a.position.y - b.position.y) * (a.position.y - b.position.y);
				if(t < d) {
					ind = j;
					d = t;
				}
			}
			if(this.sprites.length <= this.n * this.genePool.elite2) {// || this.foodSprites.length == 0) {
				this.bottleNeck();
				console.log("Forced Breeding!")
				break;
			}
			this.sprites[i].update(a.position.x - this.sprites[ind].position.x, a.position.y - this.sprites[ind].position.y, this.sprites[ind].geneType, a.position.x - this.foodSprites[ind2].position.x, a.position.y - this.foodSprites[ind2].position.y);
			if(this.sprites[i].health <= 0) {
				if(this.sprites.length > this.n * this.genePool.elite2) {
					this.sprites.splice(i, 1);
					this.genePool.genes.splice(i, 1);
					console.log("Death!");
					//i--;
				}
				if(this.sprites.length <= this.n * this.genePool.elite2) { //|| this.foodSprites.length == 0) {
					this.bottleNeck();
					console.log("Forced Breeding!")
					break;
				}
			}
		}
	}
	this.draw = function() {
		this.clearRect();
		for(var i = 0; i < this.sprites.length; i++) {
			this.sprites[i].draw(this.context);
		}
		for(var i = 0; i < this.foodSprites.length; i++) {
			this.foodSprites[i].draw(this.context);
		}
	}
}