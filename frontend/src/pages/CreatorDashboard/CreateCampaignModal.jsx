import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../utils";
import { useCreateCampaign } from "../../features/creator/creatorSlice";
import { X, Megaphone, Image as ImageIcon, CalendarDays, DollarSign, FileText } from "lucide-react";

const CreateCampaignModal = () => {
  const navigate = useNavigate();
  const { create, loading } = useCreateCampaign();

  const [form, setForm] = useState({
    title: "",
    description: "",
    goal_amount: "",
    deadline: "",
    media_url: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";

    if (!form.goal_amount) {
      newErrors.goal_amount = "Goal amount is required";
    } else if (parseFloat(form.goal_amount) <= 0) {
      newErrors.goal_amount = "Goal must be greater than $0";
    }

    if (!form.deadline) {
      newErrors.deadline = "Deadline is required";
    } else if (new Date(form.deadline) <= new Date()) {
      newErrors.deadline = "Deadline must be in the future";
    }

    if (form.media_url && !isValidUrl(form.media_url)) {
      newErrors.media_url = "Enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await create({
        title: form.title.trim(),
        description: form.description.trim(),
        goal_amount: parseFloat(form.goal_amount),
        deadline: form.deadline,
        media_url: form.media_url.trim() || null,
      });
      handleSuccess("Campaign created successfully!");
      setTimeout(() => navigate("/feed"), 1000);
    } catch (err) {
      handleError(err.message || "Failed to create campaign");
    }
  };

  // Minimum date for deadline (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 px-4 md:px-8 flex items-center border-b border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => navigate("/feed")}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors mr-4"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Megaphone className="w-5 h-5 text-indigo-600" />
          <span>Create Campaign</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-slate-900 text-white text-[14px] font-bold rounded-full hover:bg-slate-800 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>

      {/* Form */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 mr-2 text-slate-400" />
                  Campaign Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Give your campaign a compelling title..."
                  className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.title ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all`}
                />
                {errors.title && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 mr-2 text-slate-400" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell people about your campaign, why it matters, and how the funds will be used..."
                  rows={5}
                  className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.description ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all resize-none`}
                />
                {errors.description && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.description}</p>}
              </div>

              {/* Goal Amount & Deadline Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                    Goal Amount (USD)
                  </label>
                  <input
                    type="number"
                    name="goal_amount"
                    value={form.goal_amount}
                    onChange={handleChange}
                    placeholder="10000"
                    min="1"
                    step="0.01"
                    className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.goal_amount ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all`}
                  />
                  {errors.goal_amount && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.goal_amount}</p>}
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                    <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    min={minDate}
                    className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.deadline ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all`}
                  />
                  {errors.deadline && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.deadline}</p>}
                </div>
              </div>

              {/* Media URL */}
              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <ImageIcon className="w-4 h-4 mr-2 text-slate-400" />
                  Media URL
                  <span className="text-slate-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="url"
                  name="media_url"
                  value={form.media_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.media_url ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all`}
                />
                {errors.media_url && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.media_url}</p>}

                {/* Image Preview */}
                {form.media_url && isValidUrl(form.media_url) && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50">
                    <img
                      src={form.media_url}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Mobile Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:hidden py-3 bg-slate-900 text-white text-[15px] font-bold rounded-full hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Publishing..." : "Publish Campaign"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateCampaignModal;
