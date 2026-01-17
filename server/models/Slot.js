const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true,
    index: { expires: 0 } // auto-delete when 'time' < now
  },
  docID:{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Doctor",
  },
  charges : {
    type : Number,
    required : true,
  }
});

const Slot = mongoose.model('Slot', slotSchema);
module.exports = Slot;