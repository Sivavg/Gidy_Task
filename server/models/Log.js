const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    actor: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceType: { type: String, required: true },
    ipAddress: { type: String, required: true },
    region: { type: String, required: true },
    severity: { type: String, required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, required: true }
});

// Adding indexes to improve filter/search performance
logSchema.index({ actor: 1 });
logSchema.index({ role: 1 });
logSchema.index({ action: 1 });
logSchema.index({ resourceType: 1 });
logSchema.index({ severity: 1 });
logSchema.index({ status: 1 });
logSchema.index({ timestamp: -1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
