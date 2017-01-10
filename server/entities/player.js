var Entity = require('./entity.js'),
    Vector = require('../util/vector.js'),
    Bullet = require('./bullet.js'),

    inventory = require('./');

class Player extends Entity {

  constructor (uuid) { super(uuid);

    // Stuff that is set once
    this.type = "player";
    this.mass = 25;
    this.collides.push(...["asteroid", "powerup"]);

    // ToDo: Vector at 0,0, this should be some kind of global
    this.center = new Vector();

    // Stuff that is set and reset at respawn
  	this.init();

    this.private = Object.assign(this.private, {
      "resources": {
        "electricity": 0, /* Electricity, used for powering the shield, or building stuff */
        "matter": 0,      /* Matter (Cosmic dust), refined to make awesome stuff */
      }
    });

  };

  init () {

  	this.position.set(Math.random()*30000-15000, Math.random()*30000-15000);
    this.velocity = new Vector();
    
  	this.public = Object.assign(this.public, {
  		"hp": {
  			"current": 100,
  			"max": 100
  		},
  		"shield": {
  			"current": 100,
  			"max": 100
  		}
  	});

  	this.private = Object.assign(this.private, {
  		"powerups": {
  		}
  	});

    this.local = Object.assign(this.local, {
      "controls": {},
      "killer": undefined
    });

  }

  setAcceleration (direction, magnitude) {
    this.rotation = {d: direction, m: magnitude};
    this.acceleration = new Vector( Math.cos(direction) * magnitude, Math.sin(direction) * magnitude );
  }

  advance (advanceMs) {

    // Change stuff?
    if (this.local.controls && this.local.controls.rotation) {

      var 
        direction = -Math.atan2(this.local.controls.rotation.x, this.local.controls.rotation.y)+Math.PI/2,
        magnitude = this.local.controls.accelerate ? Math.min(1,new Vector(this.local.controls.rotation.x,this.local.controls.rotation.y).distance(this.center))/50 : 0;

      this.setAcceleration( direction, magnitude );

      if(this.local.controls.reverse) {
        this.acceleration.invert();
      }

      this.local.updated = true;

      // Fire? Rate controlled to one per 250ms
      var rateLimiter = 300;

      // Increase rate-limiter on powerup
      if (this.private.powerups["rapid"] && this.private.powerups["rapid"].engaged) {
        rateLimiter /= 3;
      }

      if ( this.local.controls.fire && (new Date() - (this.lastFire || 0)) > rateLimiter ) {
        this.lastFire = new Date();

        // Spawn new bullets at end of event loop
        let self = this;
        setImmediate(function () {
          var damage = 5,
            bullet;
          
          // Increase damage on powerup
          if (self.private.powerups["damage"] && self.private.powerups["damage"].engaged) {
            damage *= 5;
          }

          // Prepare bullet 1
          bullet = new Bullet(self);
          bullet.public.damage = damage;
          inventory.add(bullet);

          // More bullets on powerup
          if (self.private.powerups["spread"] && self.private.powerups["spread"].engaged) {
          
            // Left
            bullet = new Bullet(self);
            bullet.velocity.rotate(-5);
            bullet.public.damage = damage;
            inventory.add(bullet);

            // Right
            bullet = new Bullet(self);
            bullet.velocity.rotate(5);
            bullet.public.damage = damage;
            inventory.add(bullet);

          }
        });

      }

      // Engage powerups
      let id;
      for(id of ["damage", "spread", "rapid"]) {
        if(this.local.controls[id]) {
          let powerup;
          powerup = this.private.powerups[id];
          if ( powerup && powerup.has && !powerup.engaged) {

            // Oh yeah!
            powerup.engaged = true;
            powerup.has = false;

            // Disengage powerup after 2 minutes
            setTimeout(function () {
              if(powerup) powerup.engaged = false;
            },120000);

          }  
        }
      }
      

    }

    super.advance(advanceMs);

  }

  respawn () {
  	this.init();
  }

  collidedWith (that) {

    if ( that.type == "asteroid" ) {
      that.public.hp.current -= this.public.hp.max;
      this.public.hp.current -= that.public.hp.max;
    } else if ( that.type == "powerup" ) {
      
      if(!this.private.powerups[that.public.dropped.subtype]) {
        this.private.powerups[that.public.dropped.subtype] = {
          has: true,
          engaged: false
        }
      }

      this.private.powerups[that.public.dropped.subtype].has = true;
      that.pendingRemoval = true;
    }

    this.local.updated = true;
    that.local.updated = true;
    
  }
  
};

module.exports = Player;