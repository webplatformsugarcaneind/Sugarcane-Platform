const express = require('express');
const router = express.Router();
const CropListing = require('../models/cropListing.model');
const multer = require('multer');
const path = require('path');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sugarcane_farms',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
    transformation: [{ width: 1200, crop: 'limit' }]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

const { protect, authorize } = require('../middleware/auth.middleware');

// Helper to sanitize data
const sanitizeListingData = (listing) => {
  const s = listing.toObject ? listing.toObject() : listing;
  return {
    ...s,
    sugarcane_variety: s.sugarcane_variety || s.crop_variety || 'Unknown',
    delivery_location: s.delivery_location || s.location || 'Unknown Location',
    quantity_available: s.quantity_available?.value ? s.quantity_available : { value: s.quantity_in_tons || 0, unit: 'gunthas' },
    price_details: s.price_details?.price_per_unit ? s.price_details : { price_per_unit: s.expected_price_per_ton || 0, price_negotiable: true },
    delivery_timeframe: s.delivery_timeframe || { available_from: s.harvest_availability_date || null, available_until: null },
    seed_quality: s.seed_quality || { disease_free_status: 'Standard Quality' },
    farm_images: s.farm_images || [],
    bulk_discount: s.bulk_discount || { available: false }
  };
};

// Helper to parse FormData
const parseFormData = (req, res, next) => {
  try {
    const jsonFields = [
      'seed_quality', 'quantity_available', 'price_details', 
      'delivery_timeframe', 'bulk_discount', 'equipment', 'tags'
    ];
    
    jsonFields.forEach(field => {
      if (req.body[field]) {
        try {
          req.body[field] = typeof req.body[field] === 'string' ? JSON.parse(req.body[field]) : req.body[field];
        } catch (e) {
          console.error(`Failed to parse ${field}:`, req.body[field]);
        }
      }
    });

    if (req.files && req.files.length > 0) {
      req.body.farm_images = req.files.map((file, i) => ({
        url: file.path,
        caption: file.originalname,
        image_type: i === 0 ? 'farm_overview' : 'crop_closeup'
      }));
    }
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid form data' });
  }
};

router.get('/marketplace', async (req, res) => {
  try {
    const listings = await CropListing.find({ status: 'active' })
      .populate('farmer_id', 'name email phone location')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: listings.map(l => sanitizeListingData(l)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching listings' });
  }
});

router.post('/create', protect, authorize('Farmer'), upload.array('farm_images', 5), parseFormData, async (req, res) => {
  try {
    const data = req.body;
    const listingFields = {
      farmer_id: req.user._id,
      title: data.title,
      sugarcane_variety: data.sugarcane_variety,
      crop_type: data.crop_type,
      seed_quality: data.seed_quality,
      crop_age: data.crop_age ? parseInt(data.crop_age) : undefined,
      germination_percentage: data.germination_percentage ? parseInt(data.germination_percentage) : undefined,
      seed_type: data.seed_type,
      soil_type: data.soil_type,
      irrigation_method: data.irrigation_method,
      quantity_available: data.quantity_available,
      unit_type: data.unit_type,
      price_details: data.price_details,
      bulk_discount: data.bulk_discount,
      delivery_location: data.delivery_location,
      delivery_method: data.delivery_method,
      transport_available: data.transport_available === 'true' || data.transport_available === true,
      delivery_radius: data.delivery_radius ? parseInt(data.delivery_radius) : undefined,
      delivery_timeframe: data.delivery_timeframe,
      harvest_method: data.harvest_method,
      storage_condition: data.storage_condition,
      tags: data.tags,
      description: data.description,
      farm_images: data.farm_images,
      status: 'active'
    };

    const newListing = new CropListing(listingFields);
    await newListing.save();
    res.status(201).json({ success: true, data: newListing });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, authorize('Farmer'), upload.array('farm_images', 5), parseFormData, async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Not found' });
    if (listing.farmer_id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    const data = req.body;
    
    // Update basic fields
    const basicFields = [
      'title', 'sugarcane_variety', 'crop_type', 'seed_type', 'soil_type', 
      'irrigation_method', 'unit_type', 'delivery_location', 'delivery_method', 
      'harvest_method', 'storage_condition', 'description', 'status'
    ];
    basicFields.forEach(f => {
      if (data[f] !== undefined) listing[f] = data[f];
    });

    // Update numeric fields
    if (data.crop_age !== undefined) listing.crop_age = data.crop_age ? parseInt(data.crop_age) : undefined;
    if (data.germination_percentage !== undefined) listing.germination_percentage = data.germination_percentage ? parseInt(data.germination_percentage) : undefined;
    if (data.delivery_radius !== undefined) listing.delivery_radius = data.delivery_radius ? parseInt(data.delivery_radius) : undefined;

    // Update boolean fields
    if (data.transport_available !== undefined) {
      listing.transport_available = data.transport_available === 'true' || data.transport_available === true;
    }

    // Update JSON objects
    if (data.seed_quality) listing.seed_quality = data.seed_quality;
    if (data.quantity_available) listing.quantity_available = data.quantity_available;
    if (data.price_details) listing.price_details = data.price_details;
    if (data.bulk_discount) listing.bulk_discount = data.bulk_discount;
    if (data.delivery_timeframe) listing.delivery_timeframe = data.delivery_timeframe;
    if (data.tags) listing.tags = data.tags;

    // Map legacy fields if present to ensure backward compatibility
    if (data.crop_variety !== undefined) {
      listing.sugarcane_variety = data.crop_variety;
      listing.crop_variety = data.crop_variety;
    }
    if (data.location !== undefined) {
      listing.delivery_location = data.location;
      listing.location = data.location;
    }
    if (data.quantity_in_tons !== undefined) {
      const val = parseFloat(data.quantity_in_tons);
      listing.quantity_in_tons = val;
      listing.quantity_available = {
        value: val,
        unit: listing.quantity_available?.unit || 'gunthas'
      };
    }
    if (data.expected_price_per_ton !== undefined) {
      const val = parseFloat(data.expected_price_per_ton);
      listing.expected_price_per_ton = val;
      listing.price_details = {
        price_per_unit: val,
        price_negotiable: listing.price_details?.price_negotiable ?? true,
        minimum_order_quantity: listing.price_details?.minimum_order_quantity || 0
      };
    }
    if (data.harvest_availability_date !== undefined) {
      listing.harvest_availability_date = data.harvest_availability_date;
      listing.delivery_timeframe = {
        available_from: data.harvest_availability_date,
        available_until: listing.delivery_timeframe?.available_until || null,
        preferred_delivery_time: listing.delivery_timeframe?.preferred_delivery_time || 'Flexible'
      };
    }


    // Update images
    // If keep_existing_images is provided, it means the user managed images
    if (data.keep_existing_images) {
      const keep = JSON.parse(data.keep_existing_images);
      const newImages = data.farm_images || [];
      listing.farm_images = [...keep, ...newImages];
    } else if (data.farm_images && data.farm_images.length > 0) {
      // Fallback: if only new images provided without explicit "keep" list
      listing.farm_images = [...listing.farm_images, ...data.farm_images];
    }

    await listing.save();
    res.json({ success: true, data: listing });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/my-listings', protect, authorize('Farmer'), async (req, res) => {
  try {
    const listings = await CropListing.find({ farmer_id: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: listings.map(l => sanitizeListingData(l)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your listings' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id).populate('farmer_id', 'name email phone');
    if (!listing) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: sanitizeListingData(listing) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

router.delete('/:id', protect, authorize('Farmer'), async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id);
    if (!listing || listing.farmer_id.toString() !== req.user._id.toString()) return res.status(404).json({ success: false });
    await listing.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
