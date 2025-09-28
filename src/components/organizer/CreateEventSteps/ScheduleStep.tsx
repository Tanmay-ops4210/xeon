import React from 'react';
import { EventFormData, EventValidationErrors, ScheduleItemFormData } from '../../../types/eventManagement';
import { Plus, Trash2, Clock, MapPin } from 'lucide-react';

interface ScheduleStepProps {
  formData: EventFormData;
  onChange: (field: string, value: any) => void;
  errors: EventValidationErrors;
}

const ScheduleStep: React.FC<ScheduleStepProps> = ({ formData, onChange, errors }) => {
  const scheduleTypes = [
    { value: 'keynote', label: 'Keynote', color: 'bg-purple-100 text-purple-800' },
    { value: 'session', label: 'Session', color: 'bg-blue-100 text-blue-800' },
    { value: 'workshop', label: 'Workshop', color: 'bg-green-100 text-green-800' },
    { value: 'break', label: 'Break', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'networking', label: 'Networking', color: 'bg-pink-100 text-pink-800' },
    { value: 'meal', label: 'Meal', color: 'bg-orange-100 text-orange-800' }
  ];

  const addScheduleItem = () => {
    const newItem: ScheduleItemFormData = {
      startTime: '',
      endTime: '',
      title: '',
      description: '',
      speakerId: '',
      room: '',
      type: 'session'
    };
    
    onChange('schedule', [...formData.schedule, newItem]);
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItemFormData, value: any) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    onChange('schedule', updatedSchedule);
  };

  const removeScheduleItem = (index: number) => {
    const updatedSchedule = formData.schedule.filter((_, i) => i !== index);
    onChange('schedule', updatedSchedule);
  };

  const moveScheduleItem = (index: number, direction: 'up' | 'down') => {
    const updatedSchedule = [...formData.schedule];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < updatedSchedule.length) {
      [updatedSchedule[index], updatedSchedule[newIndex]] = [updatedSchedule[newIndex], updatedSchedule[index]];
      onChange('schedule', updatedSchedule);
    }
  };

  const getSpeakerOptions = () => {
    return formData.speakers.map((speaker, index) => ({
      value: `speaker_${index}`,
      label: speaker.name
    }));
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTypeColor = (type: string) => {
    const typeConfig = scheduleTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Schedule</h3>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Schedule Items</h4>
            <button
              type="button"
              onClick={addScheduleItem}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule Item
            </button>
          </div>

          {formData.schedule.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No schedule items added yet</p>
              <p className="text-sm">Click "Add Schedule Item" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.schedule.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {scheduleTypes.find(t => t.value === item.type)?.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => moveScheduleItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveScheduleItem(index, 'down')}
                        disabled={index === formData.schedule.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeScheduleItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => updateScheduleItem(index, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => updateScheduleItem(index, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateScheduleItem(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Session title"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateScheduleItem(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Session description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) => updateScheduleItem(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {scheduleTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room/Location
                      </label>
                      <input
                        type="text"
                        value={item.room}
                        onChange={(e) => updateScheduleItem(index, 'room', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Room A, Main Hall, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Speaker
                      </label>
                      <select
                        value={item.speakerId || ''}
                        onChange={(e) => updateScheduleItem(index, 'speakerId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Speaker</option>
                        {getSpeakerOptions().map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Preview */}
        {formData.schedule.length > 0 && (
          <div className="mt-8">
            <h4 className="text-md font-medium text-gray-900 mb-4">Schedule Preview</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {formData.schedule
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{item.room || 'TBD'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {scheduleTypes.find(t => t.value === item.type)?.label}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleStep;

