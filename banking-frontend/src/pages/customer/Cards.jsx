import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../../services/api'

const Cards = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState([])
  const [cardRequests, setCardRequests] = useState([])
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestType, setRequestType] = useState('debit')
  const [requestLoading, setRequestLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)
  const [showCardDetails, setShowCardDetails] = useState(false)

  useEffect(() => {
    fetchCards()
    fetchCardRequests()
  }, [])

  const fetchCards = async () => {
    try {
      const response = await API.get('/cards/my-cards')
      setCards(response.data)
    } catch (err) {
      console.error('Error fetching cards:', err)
      setError('Failed to load cards')
    } finally {
      setLoading(false)
    }
  }

  const fetchCardRequests = async () => {
    try {
      const response = await API.get('/cards/card-requests')
      setCardRequests(response.data)
      console.log('Card requests:', response.data)
    } catch (err) {
      console.error('Error fetching card requests:', err)
      setCardRequests([])
    }
  }

  const handleRequestCard = async () => {
    setRequestLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await API.post('/cards/request', { type: requestType })
      setMessage(response.data.message || 'Card request submitted successfully')
      setShowRequestModal(false)
      fetchCardRequests()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request card')
      setTimeout(() => setError(''), 3000)
    } finally {
      setRequestLoading(false)
    }
  }

  const handleActivateCard = async (cardId) => {
    try {
      const response = await API.put(`/cards/activate/${cardId}`)
      setMessage(response.data.message || 'Card activated successfully')
      fetchCards()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate card')
      setTimeout(() => setError(''), 3000)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCardStatusBadge = (status) => {
    const badges = {
      active: 'bg-emerald/10 text-emerald',
      inactive: 'bg-gray-100 text-gray-600',
      blocked: 'bg-red-50 text-red-600',
      pending: 'bg-amber-100 text-amber-700'
    }
    return badges[status] || badges.inactive
  }

  const getRequestStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-emerald/10 text-emerald',
      rejected: 'bg-red-50 text-red-600'
    }
    return badges[status] || badges.pending
  }

  const hasPendingRequest = cardRequests.some(r => r.status === 'pending')
  const pendingRequests = cardRequests.filter(r => r.status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
            <div className="text-xl font-light tracking-wide text-gray-900">COMET</div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Page Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Cards</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your debit and credit cards</p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            disabled={hasPendingRequest}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              hasPendingRequest 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-emerald text-white hover:bg-emerald-dark'
            }`}
          >
            {hasPendingRequest ? 'Request pending' : '+ Request new card'}
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-3 bg-emerald/10 border border-emerald/20 rounded-xl">
            <p className="text-emerald text-sm text-center">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Pending Card Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-gray-800 font-medium mb-4">Pending Requests</h2>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request._id} className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-gray-700 font-medium">{request.type === 'debit' ? 'Debit Card' : 'Credit Card'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getRequestStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">Requested on {new Date(request.requested_at).toLocaleDateString()}</p>
                      <p className="text-gray-400 text-xs mt-2">Waiting for employee approval</p>
                    </div>
                    <div className="text-right">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Cards Section */}
        {cards.filter(c => c.status === 'active').length > 0 && (
          <div className="mb-8">
            <h2 className="text-gray-800 font-medium mb-4">Active Cards</h2>
            <div className="space-y-4">
              {cards.filter(c => c.status === 'active').map((card) => (
                <div key={card._id} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-white/60 text-xs uppercase tracking-wide">{card.type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getCardStatusBadge(card.status)}`}>
                          {card.status}
                        </span>
                      </div>
                      <p className="text-xl font-light tracking-wider mb-3">{card.card_number_masked || '**** **** **** 1234'}</p>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-white/40 text-xs">Expiry</p>
                          <p className="text-white/80">{card.expiry || '12/28'}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Limit</p>
                          <p className="text-white/80">{formatCurrency(card.daily_limit || 500000)} per day</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => {
                          setSelectedCard(card)
                          setShowCardDetails(true)
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition-all"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Cards Section */}
        {cards.filter(c => c.status === 'inactive').length > 0 && (
          <div className="mb-8">
            <h2 className="text-gray-800 font-medium mb-4">Inactive Cards</h2>
            <div className="space-y-4">
              {cards.filter(c => c.status === 'inactive').map((card) => (
                <div key={card._id} className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl p-6 text-white shadow-lg opacity-80">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-white/60 text-xs uppercase tracking-wide">{card.type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getCardStatusBadge(card.status)}`}>
                          {card.status}
                        </span>
                      </div>
                      <p className="text-xl font-light tracking-wider mb-3">{card.card_number_masked || '**** **** **** 1234'}</p>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-white/40 text-xs">Expiry</p>
                          <p className="text-white/80">{card.expiry || '12/28'}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Limit</p>
                          <p className="text-white/80">{formatCurrency(card.daily_limit || 500000)} per day</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => handleActivateCard(card._id)}
                        className="px-4 py-2 bg-emerald hover:bg-emerald-dark text-white text-sm rounded-xl transition-all"
                      >
                        Activate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Cards State */}
        {cards.length === 0 && pendingRequests.length === 0 && (
          <div className="bg-gray-50 rounded-2xl py-16 text-center">
            <p className="text-gray-500 text-lg">No cards yet</p>
            <p className="text-gray-400 text-sm mt-1">Request your first card to get started</p>
          </div>
        )}

        {/* Request Card Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-gray-900">Request a new card</h2>
                <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Card type</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRequestType('debit')}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        requestType === 'debit'
                          ? 'border-emerald bg-emerald/10 text-emerald'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestType('credit')}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        requestType === 'credit'
                          ? 'border-emerald bg-emerald/10 text-emerald'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Credit Card
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                  <p className="font-medium mb-1">Request information:</p>
                  <ul className="text-xs space-y-1 text-gray-500">
                    <li>• Card will be delivered within 5-7 business days</li>
                    <li>• You will need to activate the card after delivery</li>
                    <li>• Daily limit: Rs 500,000 for debit / Rs 500,000 for credit</li>
                    <li>• Per transaction limit: Rs 500,000</li>
                  </ul>
                </div>

                <button
                  onClick={handleRequestCard}
                  disabled={requestLoading}
                  className="w-full bg-emerald hover:bg-emerald-dark text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {requestLoading ? 'Submitting...' : 'Submit request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Details Modal */}
        {showCardDetails && selectedCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-gray-900">Card details</h2>
                <button onClick={() => setShowCardDetails(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white mb-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs uppercase tracking-wide">{selectedCard.type} card</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getCardStatusBadge(selectedCard.status)}`}>
                    {selectedCard.status}
                  </span>
                </div>
                <p className="text-xl tracking-wider mb-4">{selectedCard.card_number_masked}</p>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-white/40 text-xs">Valid through</p>
                    <p>{selectedCard.expiry}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">CVV</p>
                    <p>•••</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Daily limit</span>
                  <span className="text-gray-800">{formatCurrency(selectedCard.daily_limit || 500000)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Used today</span>
                  <span className="text-gray-800">{formatCurrency(selectedCard.used_today || 0)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Remaining today</span>
                  <span className="text-gray-800">{formatCurrency((selectedCard.daily_limit || 500000) - (selectedCard.used_today || 0))}</span>
                </div>
              </div>

              <button
                onClick={() => setShowCardDetails(false)}
                className="w-full mt-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Cards