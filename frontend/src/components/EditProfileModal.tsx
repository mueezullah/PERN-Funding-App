import React, { useEffect, useRef, useState } from "react";
import { X, User, AtSign, Loader2, Check } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentUsername: string;
  onSuccess?: (updatedData: { name: string; username: string }) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  currentUsername,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName || "");
  const [username, setUsername] = useState(currentUsername || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; username?: string }>({});
  const backdropRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName || "");
      setUsername(currentUsername || "");
      setError(null);
      setFieldErrors({});
      // Focus the name input after a brief delay for the animation
      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [isOpen, currentName, currentUsername]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const validate = (): boolean => {
    const errors: { name?: string; username?: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = "Name is required";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (trimmedName.length > 50) {
      errors.name = "Name must be under 50 characters";
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername) {
      errors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
      errors.username = "3-20 alphanumeric characters or underscores only";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be signed in to update your profile.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            username: username.trim().toLowerCase(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to update profile.");
        return;
      }

      const updatedUser = data.data?.user;
      const newName = updatedUser?.name || name.trim();
      const newUsername = updatedUser?.username || username.trim().toLowerCase();

      // Sync localStorage
      localStorage.setItem("name", newName);
      localStorage.setItem("username", newUsername);

      // Dispatch custom event so Navbar, ProfileFeed, RightCard can react
      window.dispatchEvent(
        new CustomEvent("profileUpdate", {
          detail: { name: newName, username: newUsername },
        })
      );

      onSuccess?.({ name: newName, username: newUsername });
      onClose();
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    name.trim() !== (currentName || "") ||
    username.trim().toLowerCase() !== (currentUsername || "").toLowerCase();

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl border border-slate-200/60 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Update your personal information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Global error */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Name field */}
          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                ref={nameInputRef}
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Your display name"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${
                  fieldErrors.name
                    ? "border-rose-300 bg-rose-50/50 focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white"
                }`}
                maxLength={50}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Username field */}
          <div>
            <label
              htmlFor="edit-username"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="edit-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.replace(/\s/g, ""));
                  if (fieldErrors.username)
                    setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }}
                placeholder="your_username"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${
                  fieldErrors.username
                    ? "border-rose-300 bg-rose-50/50 focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                    : "border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white"
                }`}
                maxLength={20}
              />
            </div>
            {fieldErrors.username && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {fieldErrors.username}
              </p>
            )}
            <p className="mt-1.5 text-xs text-slate-400">
              3-20 characters. Letters, numbers, and underscores only.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.97] transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving…</span>
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
