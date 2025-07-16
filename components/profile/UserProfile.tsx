'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

export default function UserProfile() {
  const { user, dbUser, loading } = useAuth();
  const [name, setName] = useState(dbUser?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  if (loading) {
    return (
      <div data-testid="profile-loading" className="flex justify-center items-center min-h-[400px]" aria-label="Loading profile">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return (
      <div className="text-center p-4" role="alert">
        Not authenticated. Please sign in to view your profile.
      </div>
    );
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUpdating(true);
      setMessage({ text: 'Uploading photo...', type: 'info' });

      // Upload photo to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Update user profile with new photo URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMessage({ text: 'Photo uploaded successfully', type: 'success' });
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage({ text: 'Failed to upload photo', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setMessage({ text: 'Updating profile...', type: 'info' });

      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24">
            {dbUser.photo_url ? (
              <Image
                src={dbUser.photo_url}
                alt={`${dbUser.name}'s profile photo`}
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center"
                aria-label="Profile photo placeholder"
              >
                <span className="text-2xl text-gray-500">
                  {dbUser.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
              aria-label="Upload profile photo"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdating}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Change profile photo"
              aria-disabled={isUpdating}
            >
              {isUpdating ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} role="form" className="space-y-6" aria-label="Profile update form">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            disabled={isUpdating}
            required
            minLength={2}
            maxLength={50}
            aria-label="Name"
            aria-describedby={message.type === 'error' ? 'profile-error' : undefined}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={dbUser.email}
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-50"
            aria-label="Email address (read-only)"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Role
          </label>
          <div
            id="role"
            className="w-full px-3 py-2 border rounded-md bg-gray-50"
            aria-label="User role (read-only)"
          >
            {dbUser.role}
          </div>
        </div>

        {message.text && (
          <div
            id={message.type === 'error' ? 'profile-error' : 'profile-message'}
            className={`p-3 rounded-md ${
              message.type === 'error'
                ? 'bg-red-100 text-red-700'
                : message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
            role="alert"
            aria-live="polite"
          >
            {message.text}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            aria-disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 