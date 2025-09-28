import React, { useState } from 'react';
import { CreditCard, Lock, Check, ArrowLeft, MapPin, Calendar, Users, DollarSign } from 'lucide-react';

interface PaymentPageProps {
  eventData: any;
  locationData: { lat: number; lng: number; address: string } | null;
  onBack: () => void;
  onPaymentComplete: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ eventData, locationData, onBack, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: '',
    bankName: ''
  });

  // Calculate pricing based on event type and attendees
  const calculatePricing = () => {
    const basePrice = eventData?.eventType === 'conference' ? 5000 : 
                     eventData?.eventType === 'workshop' ? 3000 :
                     eventData?.eventType === 'seminar' ? 2000 : 2500;
    
    const attendeeMultiplier = Math.ceil((eventData?.expectedAttendees || 50) / 50);
    const subtotal = basePrice * attendeeMultiplier;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    return { basePrice, subtotal, tax, total };
  };

  const pricing = calculatePricing();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    onPaymentComplete();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Event Details</span>
            </div>
            <div className="w-16 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Location</span>
            </div>
            <div className="w-16 h-0.5 bg-indigo-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-indigo-600">Payment</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">Complete Your Booking</h1>
          <p className="text-xl text-gray-600">Secure payment for your event planning service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      paymentMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                    <span className="text-sm font-medium">Credit/Debit Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      paymentMethod === 'upi'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-6 h-6 mx-auto mb-2 bg-indigo-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      UPI
                    </div>
                    <span className="text-sm font-medium">UPI Payment</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      paymentMethod === 'netbanking'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-6 h-6 mx-auto mb-2 bg-indigo-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      NB
                    </div>
                    <span className="text-sm font-medium">Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="space-y-6">
                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setFormData(prev => ({ ...prev, cardNumber: formatted }));
                        }}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        autoComplete="cc-number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          autoComplete="cc-exp"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={4}
                          autoComplete="cc-csc"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        autoComplete="cc-name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </>
                )}

                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      placeholder="yourname@upi"
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank</label>
                    <select
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                    </select>
                  </div>
                )}

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Location</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{pricing.total.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Event Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Summary</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{eventData?.eventName}</p>
                    <p className="text-sm text-gray-600 capitalize">{eventData?.eventType}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{eventData?.expectedAttendees} Attendees</p>
                    <p className="text-sm text-gray-600">Expected participants</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Ambernath, Thane</p>
                    <p className="text-sm text-gray-600">
                      {locationData ? `${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}` : 'Location selected'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Service Fee</span>
                  <span className="font-medium">₹{pricing.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendee Scaling</span>
                  <span className="font-medium">₹{(pricing.subtotal - pricing.basePrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">₹{pricing.tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-indigo-600">₹{pricing.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Lock className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Secure Payment</h4>
              </div>
              <p className="text-sm text-green-700">
                Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;