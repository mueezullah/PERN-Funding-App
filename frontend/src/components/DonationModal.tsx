import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { X, CheckCircle2, Heart, Sparkles } from "lucide-react";
import { handleError } from "../utils";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  goal?: number;
  raised?: number;
}

export function DonationModal({
  isOpen,
  onClose,
  campaignId,
  goal,
  raised,
}: DonationModalProps) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const remainingAmount =
    goal !== undefined && raised !== undefined && goal !== null && raised !== null
      ? Math.max(0, Number(goal) - Number(raised))
      : null;

  // Auto-close countdown after success
  useEffect(() => {
    if (stage !== 3) return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          setStage(1);
          setAmount("");
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, onClose]);

  if (!isOpen) return null;

  const handleContinue = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      handleError("Please enter a valid amount greater than 0.");
      return;
    }

    if (remainingAmount !== null && numAmount > remainingAmount) {
      handleError(
        `You cannot fund more than the required amount. Maximum allowed: $${remainingAmount.toFixed(2)}`
      );
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/payments/create-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: numAmount,
            campaignId: campaignId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      setClientSecret(data.clientSecret);
      setStage(2);
    } catch (error: any) {
      handleError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    // Move to animated success screen
    setStage(3);
  };

  const appearance = {
    theme: "stripe" as const,
  };
  const options = {
    clientSecret: clientSecret || undefined,
    appearance,
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto flex flex-col relative">

        {/* ─── Stage 3: Success Screen ─────────────────────────────── */}
        {stage === 3 ? (
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center gap-5">
            {/* Animated ring + check */}
            <div className="relative w-24 h-24">
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: "rgba(0,175,240,0.2)", animationDuration: "1.2s", animationIterationCount: 1 }}
              />
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00aff0, #018cf1)" }}
              >
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Payment Successful! 🎉
              </h2>
              <p className="text-slate-500 text-sm">
                Your donation has been delivered successfully
              </p>
            </div>

            {/* Amount badge */}
            <div
              className="px-6 py-3 rounded-xl font-extrabold text-white text-2xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #00aff0, #018cf1)" }}
            >
              ${parseFloat(amount || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* Thank you message */}
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed border border-slate-200/60 w-full">
              <div className="flex items-center justify-center gap-2 mb-2 font-semibold text-slate-800">
                <Heart className="w-4 h-4 text-rose-500 fill-current" />
                Thank you for your generosity!
              </div>
              Your contribution has been successfully delivered to this campaign.
              Every donation makes a real difference and helps creators achieve their goals.
            </div>

            {/* Countdown note */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>This window will close in {countdown}s…</span>
            </div>

            {/* Manual close */}
            <button
              onClick={() => {
                onClose();
                setStage(1);
                setAmount("");
                window.location.reload();
              }}
              className="mt-1 px-8 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #00aff0, #018cf1)" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ─── Stage 1 & 2: Header ──────────────────────────────── */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {stage === 1 ? "Back this Project" : "Payment Details"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* ─── Stage 1: Amount selection ───────────────────────── */}
              {stage === 1 && (
                <div className="flex flex-col gap-4">
                  <p className="text-gray-600 text-sm">
                    Enter the amount you would like to contribute. Your support
                    makes a difference!
                  </p>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      max={remainingAmount !== null ? remainingAmount : undefined}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={
                        remainingAmount !== null
                          ? String(Math.min(50, remainingAmount))
                          : "50"
                      }
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium"
                      style={{ "--tw-ring-color": "#00aff0" } as React.CSSProperties}
                    />
                  </div>

                  {remainingAmount !== null && (
                    <p className="text-sm text-gray-500">
                      Remaining amount needed:{" "}
                      <span className="font-semibold text-gray-700">
                        $
                        {remainingAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </p>
                  )}

                  {amount &&
                    remainingAmount !== null &&
                    parseFloat(amount) > remainingAmount && (
                      <p className="text-sm text-red-500 font-medium">
                        Amount exceeds the remaining required funding.
                      </p>
                    )}

                  <button
                    onClick={handleContinue}
                    disabled={
                      isLoading ||
                      !amount ||
                      parseFloat(amount) <= 0 ||
                      (remainingAmount !== null &&
                        parseFloat(amount) > remainingAmount)
                    }
                    className="w-full mt-2 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #00aff0, #018cf1)" }}
                  >
                    {isLoading ? "Preparing..." : "Continue to Payment"}
                  </button>
                </div>
              )}

              {/* ─── Stage 2: Stripe payment form ────────────────────── */}
              {stage === 2 && clientSecret && (
                <div className="min-h-100">
                  <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm amount={amount} onSuccess={handleSuccess} />
                  </Elements>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DonationModal;
