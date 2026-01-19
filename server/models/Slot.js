const mongoose = require('mongoose');

// Helper to convert "HH:mm" to minutes for comparison
const getMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const TimeSlotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  
  // The specific calendar date (Time component normalized to 00:00:00)
  date: {
    type: Date,
    required: true,
    index: true,
    set: (d) => {
      const date = new Date(d);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  },

  // Specific time for this slot (e.g., "09:00")
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)']
  },

  // End time for this slot (e.g., "09:30")
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
    validate: {
      validator: function(value) {
        return getMinutes(value) > getMinutes(this.startTime);
      },
      message: 'End time must be after start time'
    }
  },

  isBooked: {
    type: Boolean,
    default: false,
    index: true
  },
  
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  }
}, { timestamps: true });

// --- INDEXING: Prevent exact duplicate slots ---
TimeSlotSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });

// --- VALIDATION: Prevent Overlaps ---
TimeSlotSchema.pre('save', async function(next) {
  if (!this.isNew && !this.isModified('startTime') && !this.isModified('endTime') && !this.isModified('date')) {
    return next();
  }

  const newStart = getMinutes(this.startTime);
  const newEnd = getMinutes(this.endTime);

  // Find any existing slot for this doctor on this date
  const existingSlots = await mongoose.models.TimeSlot.find({
    doctorId: this.doctorId,
    date: this.date,
    _id: { $ne: this._id } // Exclude self if updating
  });

  // Check overlap: (StartA < EndB) and (EndA > StartB)
  const hasOverlap = existingSlots.some(slot => {
    const existingStart = getMinutes(slot.startTime);
    const existingEnd = getMinutes(slot.endTime);
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (hasOverlap) {
    const err = new Error('This time slot overlaps with an existing slot.');
    return next(err);
  }
  next();
});

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);