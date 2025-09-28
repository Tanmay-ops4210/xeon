import React from 'react';
import { EventFormData, EventValidationErrors, TicketTypeFormData } from '../../../types/eventManagement';
import { Plus, Trash2, DollarSign } from 'lucide-react';

interface TicketsStepProps {
  formData: EventFormData;
  onChange: (field: string, value: any) => void;
  errors: EventValidationErrors;
}

const TicketsStep: React.FC<TicketsStepProps> = ({ formData, onChange, errors }) => {
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  const addTicketType = () => {
    const newTicket: TicketTypeFormData = {
      name: '',
      description: '',
      price: 0,
      quantity: 100,
      benefits: [],
      restrictions: [],
      saleStart: formData.startDate,
      saleEnd: formData.endDate,
      isActive: true
    };
    
    onChange('ticketTypes', [...formData.ticketTypes, newTicket]);
  };

  const updateTicketType = (index: number, field: keyof TicketTypeFormData, value: any) => {
    const updatedTickets = [...formData.ticketTypes];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    onChange('ticketTypes', updatedTickets);
  };

  const removeTicketType = (index: number) => {
    const updatedTickets = formData.ticketTypes.filter((_, i) => i !== index);
    onChange('ticketTypes', updatedTickets);
  };

  const addBenefit = (ticketIndex: number) => {
    const benefit = prompt('Enter a benefit:');
    if (benefit?.trim()) {
      const updatedTickets = [...formData.ticketTypes];
      updatedTickets[ticketIndex].benefits = [...updatedTickets[ticketIndex].benefits, benefit.trim()];
      onChange('ticketTypes', updatedTickets);
    }
  };

  const removeBenefit = (ticketIndex: number, benefitIndex: number) => {
    const updatedTickets = [...formData.ticketTypes];
    updatedTickets[ticketIndex].benefits = updatedTickets[ticketIndex].benefits.filter((_, i) => i !== benefitIndex);
    onChange('ticketTypes', updatedTickets);
  };

  const addRestriction = (ticketIndex: number) => {
    const restriction = prompt('Enter a restriction:');
    if (restriction?.trim()) {
      const updatedTickets = [...formData.ticketTypes];
      updatedTickets[ticketIndex].restrictions = [...updatedTickets[ticketIndex].restrictions, restriction.trim()];
      onChange('ticketTypes', updatedTickets);
    }
  };

  const removeRestriction = (ticketIndex: number, restrictionIndex: number) => {
    const updatedTickets = [...formData.ticketTypes];
    updatedTickets[ticketIndex].restrictions = updatedTickets[ticketIndex].restrictions.filter((_, i) => i !== restrictionIndex);
    onChange('ticketTypes', updatedTickets);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets & Pricing</h3>
        
        {/* Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency *
          </label>
          <select
            value={formData.currency}
            onChange={(e) => onChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        {/* Registration Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">Registration Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attendees
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxAttendees}
                onChange={(e) => onChange('maxAttendees', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => onChange('registrationDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tickets Per Person
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxTicketsPerPerson}
                onChange={(e) => onChange('maxTicketsPerPerson', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) => onChange('requireApproval', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Require approval for registrations</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowWaitlist}
                onChange={(e) => onChange('allowWaitlist', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Allow waitlist when sold out</span>
            </label>
          </div>
        </div>

        {/* Ticket Types */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Ticket Types</h4>
            <button
              type="button"
              onClick={addTicketType}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Ticket Type
            </button>
          </div>

          {formData.ticketTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No ticket types added yet</p>
              <p className="text-sm">Click "Add Ticket Type" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.ticketTypes.map((ticket, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-medium text-gray-900">
                      Ticket Type {index + 1}
                    </h5>
                    <button
                      type="button"
                      onClick={() => removeTicketType(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Early Bird, General Admission"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ({formData.currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={ticket.quantity}
                        onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="100"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={ticket.isActive}
                          onChange={(e) => updateTicketType(index, 'isActive', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={ticket.description}
                      onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe what's included with this ticket"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Start
                      </label>
                      <input
                        type="datetime-local"
                        value={ticket.saleStart}
                        onChange={(e) => updateTicketType(index, 'saleStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale End
                      </label>
                      <input
                        type="datetime-local"
                        value={ticket.saleEnd}
                        onChange={(e) => updateTicketType(index, 'saleEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Benefits
                      </label>
                      <button
                        type="button"
                        onClick={() => addBenefit(index)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        + Add Benefit
                      </button>
                    </div>
                    <div className="space-y-2">
                      {ticket.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center">
                          <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                            {benefit}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeBenefit(index, benefitIndex)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Restrictions
                      </label>
                      <button
                        type="button"
                        onClick={() => addRestriction(index)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        + Add Restriction
                      </button>
                    </div>
                    <div className="space-y-2">
                      {ticket.restrictions.map((restriction, restrictionIndex) => (
                        <div key={restrictionIndex} className="flex items-center">
                          <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                            {restriction}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRestriction(index, restrictionIndex)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errors.ticketTypes && (
            <p className="mt-2 text-sm text-red-600">{errors.ticketTypes}</p>
          )}
        </div>

        {/* Refund Policy */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Refund Policy
          </label>
          <textarea
            value={formData.refundPolicy}
            onChange={(e) => onChange('refundPolicy', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe your refund policy..."
          />
        </div>
      </div>
    </div>
  );
};

export default TicketsStep;

