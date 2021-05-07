function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }

outer_space = 100;

class Stage {
	constructor(canvas){
		this.canvas = canvas;
		
		canvas.width = 1200;
		canvas.height = 800;
	
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.player=null; // a special actor, the player
	
		// the logical width and height of the stage
		this.width = 1500;
		this.height = 1500;
		this.won = false;
	
		// Add the player to the center of the stage
		var velocity = new Pair(0,0);
		var position = new Pair(Math.floor(this.width/2), Math.floor(this.height/2));
		this.addPlayer(new Player(this, position, velocity));
		this.enemies = 0;
	
		// Add in some Barrels
		var total = 0;
		while(total < 15){
			var x=Math.floor(Math.random()*(this.width - outer_space)); 
			var y=Math.floor(Math.random()*(this.height - outer_space)); 
			if(this.getActor(x,y)===null && (x < this.width / 2 - 75 || x > this.width / 2 + 75) && (y < this.canvas.height / 2 - 50 || y > this.canvas.height / 2 + 30)){
				var red=165, green=42, blue=42; //Brown barrels
				var radius = 50;
				var colour= 'rgba('+red+','+green+','+blue+')';
				var position = new Pair(x,y);
				var barrel = new Barrel(this, position, colour, radius);
				this.addActor(barrel);
				total++;
			}
		}
		var total = 0;
		while(total < 5){
			var x=Math.floor((Math.random()*(this.width - outer_space))); 
			var y=Math.floor((Math.random()*(this.height - outer_space))); 
			if(this.getActor(x,y)===null && (x < this.width / 2 - 50 || x > this.width / 2 + 50) && (y < this.canvas.height / 2 - 30 || y > this.canvas.height / 2 + 30)){
				var position = new Pair(x,y);
				var medi = new MediShot(this, position);
				this.addActor(medi);
				total++;
			}
		}
		var total = 0;
		while(total < 5){
			var x=Math.floor((Math.random()*(this.width - outer_space)));
			var y=Math.floor((Math.random()*(this.height - outer_space)));
			if(this.getActor(x,y)===null && (x < this.width / 2 - 30 || x > this.width / 2 + 30) && (y < this.canvas.height / 2 - 30 || y > this.canvas.height / 2 + 30)) {
				var position = new Pair(x,y);
				var gun = new Rifle(this, position);
				this.addActor(gun);
				total++;
			}
		}
		total = 0;
		while(total < 2){
			var x=Math.floor((Math.random()*(this.width - outer_space))); 
			var y=Math.floor((Math.random()*(this.height - outer_space))); 
			if(this.getActor(x,y)===null && (x < this.width / 2 - 500|| x > this.width / 2 + 500) && (y < this.canvas.height / 2 - 30 || y > this.canvas.height / 2 + 30)) {
				var velocity = new Pair(rand(10), rand(10));
				var position = new Pair(x,y);
				var enemy = new Enemy(this, position, velocity);
				this.addActor(enemy);
				total++;
			}
		}
		this.enemies = total;
	}

	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}

	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}

	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step();
		}
	}

	draw(){
		var context = this.canvas.getContext('2d');

		context.fillStyle = "#d3d3d3";
		context.fillRect(-outer_space / 2, -outer_space / 2, this.width + outer_space, this.height + outer_space);
		
		context.fillStyle = "#00cc00";
		context.fillRect(0, 0, this.width, this.height);
		context.fillStyle = "#00ff00";
		// context.drawImage(document.getElementById("source_bg"), 0, 0, this.width, this.height);
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].draw(context);
		}
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}
} // End Class Stage

class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}
}

class Barrel{
	constructor(stage, position, colour, radius){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.colour = colour;
		this.radius = radius;
	}

	toString(){
		return "Barrel at " + this.position.toString();
	}

	getType() {
		return "Barrel";
	}

	step() {}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	draw(context){
		context.fillStyle = this.colour;
   		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath();
		context.rect(this.x, this.y, this.radius, this.radius);
		context.fill();
	}
}

class Player {
	constructor(stage, position, velocity){
		this.stage = stage;
		this.position = position;
		this.intPosition(); // this.x, this.y are int version of this.position
		this.velocity=velocity;
		this.ammo = 0;
		this.radius = 50;
		this.score = 0;
		document.getElementById('score').innerHTML = this.score;
		this.colour = 'rgba(200,0,0,1)';
		this.rotation = 0;
		this.start_x = 0;
		this.start_y = 0;
		this.hp = 100;
	}
	
	headTo(position){
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}

	getType() {
		return "Player";
	}

	fire(direction) {
		if (this.ammo > 0) {
			var shooting_dir = new Pair(direction.x, direction.y);
			shooting_dir.normalize();
			var bullet = new Bullet(this.stage, new Pair(this.x + shooting_dir.x * 20, this.y + shooting_dir.y * 20), new Pair(shooting_dir.x * 20, shooting_dir.y * 20));
			this.stage.addActor(bullet);
			this.ammo--;
		}
		
	}

	step(){
		for (var i = 1; i < this.stage.actors.length; i++) {
			if (Math.abs(this.stage.actors[i].position.x - this.position.x - this.velocity.x) < this.stage.actors[i].radius && Math.abs(this.stage.actors[i].position.y - this.position.y - this.velocity.y) < this.stage.actors[i].radius) { // collision
				if (this.stage.actors[i].getType() === 'Barrel') { // collision with barrel
					this.velocity.x = 0;
					this.velocity.y = 0;
				} else if (this.stage.actors[i].getType() === 'Rifle') { // collision with ammo
					this.ammo += this.stage.actors[i].ammo;
					this.stage.removeActor(this.stage.actors[i]);
				} else if (this.stage.actors[i].getType() === 'MediShot') { // collision with medishot
					if (this.hp == 100){
						break;
					} else if (this.hp + this.stage.actors[i].health >= 100) {
						this.hp = 100;
						this.stage.removeActor(this.stage.actors[i]);
					} else {
						this.hp += this.stage.actors[i].health;
						this.stage.removeActor(this.stage.actors[i]);
					}
				}
			}
		}

		this.position.x=this.position.x+1.5*this.velocity.x;
		this.position.y=this.position.y+1.5*this.velocity.y;

		// bounce off the walls
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width - this.radius){
			this.position.x=this.stage.width - this.radius;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height - this.radius){
			this.position.y=this.stage.height - this.radius;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		this.intPosition();
	}
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	rotate(mouse_x, mouse_y){
		var diff_x = mouse_x - this.stage.canvas.width/2;
        var diff_y = mouse_y - this.stage.canvas.height/2;
		if (this.stage.canvas.width / 2 - this.x > outer_space) {
			var diff_x = mouse_x - this.x - outer_space;
		}
		if (this.stage.canvas.height / 2 - this.y > outer_space) {
			var diff_y = mouse_y - this.y - outer_space;
		}
		if (this.x + this.stage.canvas.width / 2 - this.stage.width > outer_space) {
			var diff_x = mouse_x - (this.x - (this.stage.width - this.stage.canvas.width) - outer_space);
		}
		if (this.y + this.stage.canvas.height / 2 - this.stage.height > outer_space) {
			var diff_y = mouse_y - (this.y - (this.stage.height - this.stage.canvas.height) - outer_space);
		}
        this.rotation = Math.atan2(diff_y, diff_x);
	}

	draw(context){
		
		context.resetTransform();
		this.start_x = this.stage.canvas.width / 2 - this.x;
		this.start_y = this.stage.canvas.height / 2 - this.y;

		if (this.stage.canvas.width / 2 - this.x > outer_space) {
			this.start_x = outer_space;
		}
		if (this.stage.canvas.height / 2 - this.y > outer_space) {
			this.start_y = outer_space;
		}
		if (this.x + this.stage.canvas.width / 2 - this.stage.width > outer_space) {
			this.start_x = this.stage.canvas.width - outer_space - this.stage.width;
		}
		if (this.y + this.stage.canvas.height / 2 - this.stage.height > outer_space) {
			this.start_y = this.stage.canvas.height - outer_space - this.stage.height;
		}

		context.translate(this.start_x, this.start_y);
		context.save();
		
		context.translate((this.x + this.radius/2), (this.y + this.radius/2));
        context.rotate(this.rotation);
		context.translate(-(this.x + this.radius/2), -(this.y + this.radius/2));

		context.fillStyle = this.colour;
		context.drawImage(document.getElementById('source'), this.x, this.y, this.radius, this.radius);

		context.fillStyle = "#ff0000";
		context.fillRect(this.x, this.y + 50, 50, 10);

		context.fillStyle = "#e3e3e3";
		context.fillRect(this.x, this.y + 50, 50*this.hp/ 100, 10);

		context.restore();
	}
}

class Rifle { // pistol
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
		this.radius = 30;
		this.ammo = 10;
	}

	toString() {
		return "Rifle: " + this.position;
	}

	getType() {
		return "Rifle";
	}

	step() {}

	draw(context) {
		context.beginPath();
		context.drawImage(document.getElementById('gun'), this.position.x, this.position.y, this.radius + 10, this.radius);
	}
}

class MediShot {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
		this.health = 30;
		this.radius = 30;
	}

	getType() {
		return "MediShot";
	}

	toString() {
		return "MediShot: " + this.position;
	}

	step() {}

	draw(context) {
		context.beginPath();
		context.drawImage(document.getElementById('medishot'), this.position.x, this.position.y, this.radius, this.radius);
	}
}

class Bullet {
	constructor(stage, position, direction) {
		this.stage = stage;
		this.position = position;
		this.velocity = direction;
		this.radius = 5;
		this.lifetime = 12; // about 1.8 - 2 seconds 
	}

	toString() {
		return "Bullet: " + this.position;
	}

	getType() {
		return "Bullet";
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	step() {
		this.lifetime = this.lifetime - 1;
		if (this.lifetime === 0) {
			stage.removeActor(this);
			return;
		}

		this.position.x=this.position.x+1.75*this.velocity.x;
		this.position.y=this.position.y+1.75*this.velocity.y;

		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width - this.radius){
			this.position.x=this.stage.width - this.radius;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height - this.radius){
			this.position.y=this.stage.height - this.radius;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		this.intPosition();

		for (var i = 0; i < this.stage.actors.length; i++) {
			if ((this.stage.actors[i].radius + this.radius) >= Math.sqrt((this.stage.actors[i].position.y - this.velocity.y - this.position.y) ** 2 + (this.stage.actors[i].position.x - this.velocity.x - this.position.x) ** 2)) {
				if (this.stage.actors[i].getType() === 'Player') {
					this.stage.player.hp -= 15;
					this.stage.removeActor(this);
					if(this.stage.player.hp <=0){
						alert("You lost the game! In order to restart, please press OK and then R key!");
						this.stage.removePlayer();
					}
				} else if (this.stage.actors[i].getType() === 'Enemy') {
					if (this.stage.actors[i].hp - 25 <= 0) {
						this.stage.removeActor(this.stage.actors[i]);
						this.stage.player.score ++;
						document.getElementById('score').innerHTML = this.stage.player.score;
						this.stage.removeActor(this);
						this.stage.enemies--;
					} else {
						this.stage.actors[i].hp -= 25;
						this.stage.removeActor(this);
					}
					this.stage.removeActor(this);
					if(this.stage.enemies <= 0){
						alert("You won the game! In order to restart, please press OK and then R key!");
					}
				} else if (this.stage.actors[i].getType() === 'Barrel') { // collision with barrel
					this.stage.removeActor(this);
					this.stage.removeActor(this.stage.actors[i]);
				}
			}
		}
	}

	draw(context) {
		context.fillStyle = "#000000";
		context.beginPath();
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
		context.fill();
	}
}
		
class Enemy extends Player{
	constructor(stage, position, velocity){
		super(stage, position, velocity);
		this.intPosition(); // this.x, this.y are int version of this.position
		this.ammo = 100;
		this.shooting_time = 0;
		this.radius = 50;
		this.rotation = 0;
		this.start_x = 0;
		this.start_y = 0;
		this.hp = 100;
	}

	getType() {
		return "Enemy";
	}

	step(){

		this.position.x=this.position.x+0.5*this.velocity.x;
		this.position.y=this.position.y+0.5*this.velocity.y;
			
		// bounce off the walls
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
			this.velocity.y=-Math.abs(this.velocity.y);
		}

		if (this.shooting_time % 25 == 0){
			var aimtoPlayer = new Pair(this.stage.player.position.x - this.x, this.stage.player.position.y - this.y);
			this.fire(aimtoPlayer);
		}
		this.shooting_time ++;

		this.intPosition();
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	draw(context){
		context.beginPath();
		context.drawImage(document.getElementById('enemy1'), this.x, this.y, this.radius, this.radius);
		context.fill();

		context.fillStyle = "#ff0000";
		context.fillRect(this.x, this.y + 50, 50, 10);

		context.fillStyle = "#e3e3e3";
		context.fillRect(this.x, this.y + 50, 50*this.hp/ 100, 10);
	}
}
