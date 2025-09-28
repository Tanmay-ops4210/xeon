import React from 'react';
import { EventFormData, EventValidationErrors, SpeakerFormData } from '../../../types/eventManagement';
import { Plus, Trash2, Upload, User } from 'lucide-react';

interface SpeakersStepProps {
  formData: EventFormData;
  onChange: (field: string, value: any) => void;
  onImageUpload: (file: File, type: 'speaker') => void;
  errors: EventValidationErrors;
}

const SpeakersStep: React.FC<SpeakersStepProps> = ({ formData, onChange, onImageUpload, errors }) => {
  const addSpeaker = () => {
    const newSpeaker: SpeakerFormData = {
      name: '',
      title: '',
      company: '',
      bio: '',
      image: null,
      socialLinks: {
        linkedin: '',
        twitter: '',
        website: ''
      },
      sessions: []
    };
    
    onChange('speakers', [...formData.speakers, newSpeaker]);
  };

  const updateSpeaker = (index: number, field: keyof SpeakerFormData, value: any) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers[index] = { ...updatedSpeakers[index], [field]: value };
    onChange('speakers', updatedSpeakers);
  };

  const updateSpeakerSocialLink = (index: number, platform: keyof SpeakerFormData['socialLinks'], value: string) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers[index].socialLinks = {
      ...updatedSpeakers[index].socialLinks,
      [platform]: value
    };
    onChange('speakers', updatedSpeakers);
  };

  const removeSpeaker = (index: number) => {
    const updatedSpeakers = formData.speakers.filter((_, i) => i !== index);
    onChange('speakers', updatedSpeakers);
  };

  const addSession = (speakerIndex: number) => {
    const session = prompt('Enter session title:');
    if (session?.trim()) {
      const updatedSpeakers = [...formData.speakers];
      updatedSpeakers[speakerIndex].sessions = [...updatedSpeakers[speakerIndex].sessions, session.trim()];
      onChange('speakers', updatedSpeakers);
    }
  };

  const removeSession = (speakerIndex: number, sessionIndex: number) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers[speakerIndex].sessions = updatedSpeakers[speakerIndex].sessions.filter((_, i) => i !== sessionIndex);
    onChange('speakers', updatedSpeakers);
  };

  const handleImageUpload = (file: File, speakerIndex: number) => {
    onImageUpload(file, 'speaker');
    // Note: In a real implementation, you'd need to handle the upload result
    // and update the specific speaker's image
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Speakers</h3>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Event Speakers</h4>
            <button
              type="button"
              onClick={addSpeaker}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Speaker
            </button>
          </div>

          {formData.speakers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No speakers added yet</p>
              <p className="text-sm">Click "Add Speaker" to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.speakers.map((speaker, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-medium text-gray-900">
                      Speaker {index + 1}
                    </h5>
                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Speaker Image */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {speaker.image ? (
                            <img
                              src={typeof speaker.image === 'string' ? speaker.image : URL.createObjectURL(speaker.image)}
                              alt={speaker.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, index);
                                updateSpeaker(index, 'image', file);
                              }
                            }}
                            className="hidden"
                            id={`speaker-image-${index}`}
                          />
                          <label
                            htmlFor={`speaker-image-${index}`}
                            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Speaker Details */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={speaker.name}
                            onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title/Position *
                          </label>
                          <input
                            type="text"
                            value={speaker.title}
                            onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="CEO, CTO, Director, etc."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company/Organization
                        </label>
                        <input
                          type="text"
                          value={speaker.company}
                          onChange={(e) => updateSpeaker(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Company Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio *
                        </label>
                        <textarea
                          value={speaker.bio}
                          onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Brief biography of the speaker..."
                        />
                      </div>

                      {/* Social Links */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Social Links
                        </label>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                            <input
                              type="url"
                              value={speaker.socialLinks.linkedin || ''}
                              onChange={(e) => updateSpeakerSocialLink(index, 'linkedin', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="https://linkedin.com/in/username"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Twitter</label>
                            <input
                              type="url"
                              value={speaker.socialLinks.twitter || ''}
                              onChange={(e) => updateSpeakerSocialLink(index, 'twitter', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="https://twitter.com/username"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Website</label>
                            <input
                              type="url"
                              value={speaker.socialLinks.website || ''}
                              onChange={(e) => updateSpeakerSocialLink(index, 'website', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="https://example.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sessions */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Sessions
                          </label>
                          <button
                            type="button"
                            onClick={() => addSession(index)}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            + Add Session
                          </button>
                        </div>
                        <div className="space-y-2">
                          {speaker.sessions.map((session, sessionIndex) => (
                            <div key={sessionIndex} className="flex items-center">
                              <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                                {session}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeSession(index, sessionIndex)}
                                className="ml-2 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakersStep;

