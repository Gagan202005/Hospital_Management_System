const mongoose = require('mongoose');

// =================================================================
// HELPER: TIME CONVERSION
// =================================================================
// Converts "HH:mm" string (e.g., "09:30") to total minutes (e.g., 570)
// Used for comparing start/end times and detecting overlaps.
const getMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const TimeSlotSchema = new mongoose.Schema({
  // =================================================================
  // IDENTITY & SCOPE
  // =================================================================
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
      // Force time to midnight to ensure strict date matching
      const date = new Date(d);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  },

  // =================================================================
  // TIME DEFINITION
  // =================================================================
  // Format: "HH:mm" (24-hour clock)
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)']
  },

  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
    validate: {
      validator: function(value) {
        // Ensure End Time > Start Time
        return getMinutes(value) > getMinutes(this.startTime);
      },
      message: 'End time must be after start time'
    }
  },

  // =================================================================
  // BOOKING STATUS
  // =================================================================
  isBooked: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Link to the actual appointment if booked
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  }
}, { timestamps: true });


// =================================================================
// INDEXING
// =================================================================
// Prevent duplicate slots: A doctor cannot have two slots with the 
// same Start Time on the same Date.
TimeSlotSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });


// =================================================================
// PRE-SAVE HOOK: OVERLAP DETECTION
// =================================================================
// Before saving, check if this new slot overlaps with any existing 
// slot for this doctor on this specific day.
TimeSlotSchema.pre('save', async function(next) {
  // Skip validation if time fields haven't changed
  if (!this.isNew && !this.isModified('startTime') && !this.isModified('endTime') && !this.isModified('date')) {
    return next();
  }

  const newStart = getMinutes(this.startTime);
  const newEnd = getMinutes(this.endTime);

  // Query existing slots for this doctor + date
  const existingSlots = await mongoose.models.TimeSlot.find({
    doctorId: this.doctorId,
    date: this.date,
    _id: { $ne: this._id } // Exclude current document if updating
  });

  // Check overlap logic: (StartA < EndB) and (EndA > StartB)
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