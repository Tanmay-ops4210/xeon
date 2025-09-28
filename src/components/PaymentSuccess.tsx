import React from 'react';
import { CheckCircle, Download, Calendar, MapPin, Mail, Phone } from 'lucide-react';

interface PaymentSuccessProps {
  eventData: any;
  locationData: { lat: number; lng: number; address: string } | null;
  onBackToHome: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ eventData, locationData, onBackToHome }) => {
  const bookingId = `EVT-${Date.now().toString().slice(-8)}`;
  
  const handleDownloadReceipt = () => {
    // In a real application, this would generate and download a PDF receipt
    const receiptData = {
      bookingId,
      eventName: eventData?.eventName,
      eventType: eventData?.eventType,
      attendees: eventData?.expectedAttendees,
      location: locationData,
      date: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `receipt-${bookingId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Your event has been successfully booked</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-2xl font-bold">Booking Confirmation</h2>
                <p className="text-green-100">Booking ID: {bookingId}</p>
              </div>
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Event Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{eventData?.eventName}</p>
                      <p className="text-sm text-gray-600 capitalize">{eventData?.eventType} Event</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Ambernath, Thane, Maharashtra</p>
                      <p className="text-sm text-gray-600">
                        {locationData ? `Coordinates: ${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}` : 'Location confirmed'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">{eventData?.expectedAttendees}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Expected Attendees</p>
                      <p className="text-sm text-gray-600">Capacity planning confirmed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-indigo-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Confirmation Email</p>
                      <p className="text-sm text-gray-600">You'll receive a detailed confirmation email within 5 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-indigo-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Event Coordinator Contact</p>
                      <p className="text-sm text-gray-600">Our team will contact you within 24 hours to discuss details</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-indigo-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Planning Session</p>
                      <p className="text-sm text-gray-600">Schedule a detailed planning session with our experts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">tanmay365210mogabeera@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+91 8652601487</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onBackToHome}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Back to Home
              </button>
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 border border-indigo-600 text-indigo-600 py-3 px-6 rounded-lg font-medium hover:bg-indigo-50 transition-colors duration-200"
              >
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;