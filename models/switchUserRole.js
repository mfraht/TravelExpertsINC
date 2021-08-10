const { User } = require("./user");
const { Agent } = require("./agent");
const { Customer } = require("./customersMdl");

module.exports = function (userId, newRole, callback) {

  User.findOne({ userId: userId }, (err, user) => {
    
    if (err) {
      console.error(err);
      return callback(err);
    }
    
    if (user.role === "customer" || user.role === "manager") {
      customerId = user.customerId;
      console.log(customerId);
      Customer.findOne({ CustomerId: customerId }, (err, customer) => {
        if (err) {
          console.error(err);
          return callback(err);
        }
        console.log(customer);
        const agent = new Agent();
        // Copy some data from customer to Agent table before we delete the customer record
        agent.AgtFirstName = customer.CustFirstName;
        agent.AgtLastName = customer.CustLastName;
        agent.AgentId = customer.CustomerId;
        agent._id = customer._id;
        console.log(agent);
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
