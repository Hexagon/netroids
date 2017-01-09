var drops = [

  /* Resources */
  {
    type: "powerup",
    subtype: "electricity",
    class: "resource",
    probability: 0.5
  },
  {
    type: "powerup",
    subtype: "gas",
    class: "resource",
    probability: 0.2
  },
  {
    type: "powerup",
    subtype: "dust",
    class: "resource",
    probability: 0.25
  },

  /* Weapons */
  {
    type: "powerup",
    subtype: "rapid",
    class: "weapon",
    probability: 0.2
  },
  {
    type: "powerup",
    subtype: "spread",
    class: "weapon",
    probability: 0.2
  },
  {
    type: "powerup",
    subtype: "damage",
    class: "weapon",
    probability: 0.2
  }

];

module.exports = {
  request: function(base_droprate, callback) {
      
      if(base_droprate >= Math.random()) {
        // Which type of drop to make?
        var drop = drops[Math.round(Math.random()*(drops.length-1))];

        // Will it drop?
        if( drop.probability >= Math.random() ) {
          callback(drop);
        } else {
          callback();
        }
      } else {
        callback();
      }
      
  }
};