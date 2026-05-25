const mongoose = require('mongoose');
require('./models/user.model.js');
const User = mongoose.model('User');

mongoose.connect('mongodb://localhost:27017/CaneSetu')
  .then(async () => {
    console.log("Connected to DB. Syncing associatedFactories...");
    const factories = await User.find({ role: 'Factory', associatedHHMs: { $exists: true } });
    
    for (const factory of factories) {
      if (factory.associatedHHMs && factory.associatedHHMs.length > 0) {
        for (const hhmId of factory.associatedHHMs) {
          await User.findByIdAndUpdate(hhmId, {
            $addToSet: { associatedFactories: factory._id }
          });
          console.log(`Linked HHM ${hhmId} to Factory ${factory.name}`);
        }
      }
    }
    
    console.log("Done syncing.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
