// By Carlos León, 2025
// Licensed under Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
//////////////////////////////////////////////////////////////////////////////

// Entity type to differentiate entities and have them attack those not
// belonging to the same kind
const EntityType = {
  GOOD: 0,
  EVIL: 1
};

// Entity constructor
// 
// Entities have a name (it doesn't have to be unique, but it helps) and a type
//
// Additionally, entities accept a list of instantiated components
class Entity {
  constructor(entityName, entityType, components) {
    this.entityName = entityName;

    // Instead of assigning the parameter, we call `addComponent`, which is a
    // bit smarter than default assignment
    this.components = [];
    components.forEach((component) => { this.addComponent(component); });
    this.type = entityType;
  }

  addComponent(component) {
    this.components.push(component);
    component.entity = this;
  }
  // This function delegates the tick on the components, gathering their messages
  // and aggregating them into a single list of messages to be delivered by the
  // message manager (the game itself in this case
  tick() {
    const outcoming = [];
    this.components.forEach((component) => {
      const messages = component.tick();
      messages.forEach((message) => {
        outcoming.push(message);
      });
    });
    return outcoming;
  };

  // All received messages are forwarded to the components
  receive(message) {
    // If the receiver is `null`, this is a broadcast message that must be
    // accepted by all entities
    if (!message.receiver || message.receiver === this) {
      this.components.forEach((component) => {
        component.receive(message);
      });
    }
  };
}



//////////////////////////////////////////////////////////////////////////////
// if the receiver is null, it is a broadcast message
class Message {
  constructor(receiver) {
    this.receiver = receiver;

  }
}

//////////////////////////////////////////////////////////////////////////////
class Component {
  constructor(entity) {
    this.entity = entity;
    this.messageQueue = [];
  }

  tick() {
    // We return a copy of the `messageQueue`, and we empty it
    const aux = [...this.messageQueue];
    this.messageQueue = [];
    return aux;
  };
  receive(message) {
  };

}



//////////////////////////////////////////////////////////////////////////////

class Game {
  constructor(entities) {
    this.entities = entities;
    this.messageQueue = [];
  }

  mainLoop(ticks) {
    let i = 0;
    function line() {
      console.log("-----------------------------------------");
    }
    while (!ticks || i < ticks) {
      line();
      console.log("Tick number " + i);
      line();
      this.tick();
      i++;
    }
  };

  // Each tick, all entities are notified by calling their `tick` function
  tick() {
    // We create `Presence` messages for all entities to let others that they
    // exists in the game
    this.entities.forEach((entity) => {
      this.messageQueue.push(new Presence(entity));
    });

    // All messages coming from the entities are put in the queue
    this.entities.forEach((entity) => {
      let tickMessages = entity.tick();

      tickMessages.forEach((tickMessage) => {
        this.messageQueue.push(tickMessage);
      });
    });

    this.deliver();
  };


  // All messages in the queue are delivered to all the entities
  deliver() {


    this.messageQueue.forEach((message) => {
      if (!message.receiver) {
        this.entities.forEach(function(entity) {
          entity.receive(message);
        });
      }
      else {
        message.receiver.receive(message);
      }
    });

    this.messageQueue = [];
  };
}

//////////////////////////////////////////////////////////////////////////////
// Components
//////////////////////////////////////////////////////////////////////////////
class Attacker extends Component {
  receive(message) {
    if (message instanceof Presence) {
      if (message.who.type != this.entity.type) {
        this.messageQueue.push(new Attack(this.entity, message.who));
      }
    }
  };
}

//////////////////////////////////////////////////////////////////////////////
class Defender extends Component {
  receive(message) {
    if (message instanceof Attack) {
      console.log(this.entity.entityName + " was attacked by " + message.who.entityName);
    }
  };
}



//////////////////////////////////////////////////////////////////////////////
// Messages
//////////////////////////////////////////////////////////////////////////////
class Presence extends Message {
  constructor(who, receiver) {
    super(receiver);
    this.who = who;
  }
}

//////////////////////////////////////////////////////////////////////////////
class Attack extends Message {
  constructor(who, receiver) {
    super(receiver);
    this.who = who;
  }

}
//////////////////////////////////////////////////////////////////////////////



// helper functions creating new components
const attacker = () => new Attacker();
const defender = () => new Defender();

// entities in the game
const link = new Entity("link", EntityType.GOOD, [attacker(), defender()]);
const ganon = new Entity("ganon", EntityType.EVIL, [attacker(), defender()]);
const octorok = new Entity("octorok", EntityType.EVIL, [defender()]);
const armos = new Entity("armos", EntityType.EVIL, [attacker()]);

// we create the game with the entities
const game = new Game([link, ganon, armos, octorok]);

game.mainLoop(10);
