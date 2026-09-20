import React, { useState, useRef, useEffect } from "react";
import { X, Camera, User, Loader2, AtSign, Check, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showMinimalToast } from "./MinimalToast";
import { handleError } from "../utils";

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialUsername?: string;
  initialAvatar?: string;
  onSuccess?: (updatedData: { name: string; username: string; avatar?: string }) => void;
}

export function UpdateProfileModal({
  isOpen,
  onClose,
  initialName = "",
  initialUsername = "",
  initialAvatar = "",
  onSuccess,
}: UpdateProfileModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(initialName || localStorage.getItem("name") || "");
  const [username, setUsername] = useState(initialUsername || localStorage.getItem("username") || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialAvatar || localStorage.getItem("avatar") || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const role = localStorage.getItem("role") || "user";

  useEffect(() => {
    if (isOpen) {
      setName(initialName || localStorage.getItem("name") || "");
      setUsername(initialUsername || localStorage.getItem("username") || "");
      setAvatarPreview(initialAvatar || localStorage.getItem("avatar") || null);
      setAvatarFile(null);
      setError(null);
    }
  }, [isOpen, initialName, initialUsername, initialAvatar]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanName) {
      setError("Name cannot be empty");
      return;
    }

    if (!cleanUsername) {
      setError("Username cannot be empty");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setError("Username must be 3-20 alphanumeric characters or underscores");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to update your profile");
      }

      const formData = new FormData();
      formData.append("name", cleanName);
      formData.append("username", cleanUsername);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      const updatedUser = data.data.user;
      const updatedName = updatedUser.name;
      const updatedUsername = updatedUser.username;
      const updatedAvatar = updatedUser.avatar_url || updatedUser.avatar || avatarPreview;

      // Update localStorage
      localStorage.setItem("name", updatedName);
      localStorage.setItem("username", updatedUsername);
      if (updatedAvatar) {
        localStorage.setItem("avatar", updatedAvatar);
      }
      window.dispatchEvent(new Event("avatarChange"));

      showMinimalToast("Profile updated successfully");

      if (onSuccess) {
        onSuccess({
          name: updatedName,
          username: updatedUsername,
          avatar: updatedAvatar,
        });
      }

      onClose();

      // Navigate to the updated profile URL
      navigate(`/user/${updatedUsername}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Edit Profile
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your photo, name, and username
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="pt-5 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Avatar Edit Section */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-md cursor-pointer bg-slate-100 flex items-center justify-center"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={name || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl">
                  {(name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              Change Profile Photo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              maxLength={50}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                maxLength={20}
                required
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              3-20 characters (letters, numbers, underscores)
            </p>
          </div>

          {/* Role badge */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Account Role</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize bg-indigo-50 text-indigo-700">
              {role}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-full shadow-sm shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
