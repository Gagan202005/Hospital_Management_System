const mongoose = require("mongoose");

const overviewSchema = mongoose.Schema({
  docNumbers: {
    type: Number,
  },

  patientNumbers: {
    type: Number,
  },

  nurseNumbers: {
    type: Number,
  },

  ambulanceNumbers: {
    type: Number,
  },

  roomsNumbers: {
    type: Number,
  },

  bedNumbers: {
    type: Number,
  },

  appointmentNumbers: {
    type: Number,
  },

  reportsNumbers: {
    type: Number,
  },
});


module.exports = mongoose.model("Overview", overviewSchema);
