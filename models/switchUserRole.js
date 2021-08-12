const { User } = require("./user");
const { Agent } = require("./agent");
const { Customer } = require("./customersMdl");

module.exports = function (userId, newRole, callback) {
  console.log(userId);
  console.log(newRole);
  User.findOne({ userId: userId }, (err, user) => {
    console.log(`Line 19 user ${user}`);
    if (err) {
      console.error(err);
      return callback(err);
    }
    
    if (user.role === "customer" || user.role === "manager") {
      customerId = userId;
      console.log(customerId);
      Customer.findOne({ CustomerId: customerId }, (err, customer) => {
        console.log(`Line 19 customer ${customer}`);
        if (err) {
          console.error(err);
          return callback(err);
        }
        const agent = new Agent();
        // Copy some data from customer to Agent table before we delete the customer record
        agent.AgtFirstName = user.fname;
        agent.AgtLastName = user.lname;
        agent.AgentId = user.agentId;
        agent._id = user.agentId;
        console.log(`agent ${agent}`);
        //agent.registeredOn = customer.registeredOn;
        customer.delete((err) => {
          if (err) return console.error(err);
          agent.save((err) => {
            if (err) {
              console.error(err);
              return callback(err);
            }
            user.role = newRole;
            user.agentId = agent._id;
            user.agentId = agent.AgentId;
            user.customerId = null;
            user.save((err) => {
              if (err) {
                console.error(err);
                return callback(err);
              }
              callback(null);
            });
          });
        });
      });
    } else {
      if (newRole !== "customer") {
        console.log(newRole);
        // will process manager <-> agent
        user.role = newRole;
        user.save((err) => {
          if (err) {
            console.error(err);
            return callback(err);
          }
          callback(null);
        });
      }
    }
  });
};
