const CardRequest = require('../models/CardRequest');
const Card = require('../models/Card');
const Account = require('../models/Account');
const { logAction } = require('../services/auditLog');

const requestCard = async (req, res) => {
  try {
    const { type } = req.body;
    
    // Check if user already has a pending request
    const existingRequest = await CardRequest.findOne({ 
      user_id: req.user._id, 
      status: 'pending' 
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending card request' });
    }
    
    const request = await CardRequest.create({
      user_id: req.user._id,
      type,
      status: 'pending'
    });
    
    await logAction({
      userId: req.user._id,
      action: 'REQUEST_CARD',
      entity: 'card_requests',
      details: { type },
      ip: req.clientIp
    });
    
    res.status(201).json({ message: 'Card request submitted successfully', request });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get user's cards
const getMyCards = async (req, res) => {
  try {
    const accounts = await Account.find({ user_id: req.user._id });
    const accountIds = accounts.map(a => a._id);
    const cards = await Card.find({ account_id: { $in: accountIds } });
    res.json(cards);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get user's card requests
const getCardRequests = async (req, res) => {
  try {
    const requests = await CardRequest.find({ user_id: req.user._id });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Activate a card
const activateCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    
    const account = await Account.findById(card.account_id);
    if (account.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your card' });
    }
    
    if (card.status !== 'inactive') {
      return res.status(400).json({ message: 'Card cannot be activated' });
    }
    
    card.status = 'active';
    await card.save();
    
    await logAction({
      userId: req.user._id,
      action: 'ACTIVATE_CARD',
      entity: 'cards',
      details: { cardId: card._id },
      ip: req.clientIp
    });
    
    res.json({ message: 'Card activated successfully', card });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { requestCard, getMyCards, activateCard, getCardRequests };