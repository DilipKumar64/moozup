const { createOrUpdateFeatureSetting } = require("../models/featureSetting.model");

// @desc create Feature Seting
// @route POST /api/feature-setsing/
// @access Private

exports.createFeatureSeting = async (req, res) => {
  try {
    const setting = await createOrUpdateFeatureSetting(req.body);
    res.status(201).json(setting);
  } catch (err) {
    console.error("Feature Setting Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// @desc Get Feature By Event
// @route GET /api/feature-seting/:event_id
// @access Private
exports.getFeatureSetingByEvent = async (req, res) => { }

// @desc Update Feature Seting By Id
// @route PUT /api/feature-seting/:id
// @access Private
exports.updateFeatureSeting = async (req, res) => { }

// @desc Delete Feature Seting By Id
// @route DELETE /api/feature-seting/:id
// @access Private
exports.deleteFeatureSeting = async (req, res) => { }