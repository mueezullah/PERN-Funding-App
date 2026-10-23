import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { handleError } from "../utils";

interface CheckoutFormProps {
  onSuccess?: () => void;
  amount: number | string;
}

export function CheckoutForm({ onSuccess, amount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed");
      handleError(error.message || "Payment failed");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        const token = localStorage.getItem("token");
        const confirmResponse = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/payments/confirm`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          },
        );

        if (!confirmResponse.ok) {
          throw new Error("Could not update campaign progress.");
        }

        // Signal success to the parent DonationModal — it will show the success screen
        if (onSuccess) onSuccess();
      } catch (err: any) {
        setErrorMessage(err.message);
        handleError(err.message);
      }
    } else {
      setErrorMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <PaymentElement />

      {errorMessage && (
        <div className="text-[#f87171] text-sm font-medium">{errorMessage}</div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        style={{ background: isLoading ? undefined : "#018cf1" }}
        className="w-full hover:opacity-90 text-white font-bold py-3 mt-4 rounded-lg transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          `Pay $${amount}`
        )}
      </button>
    </form>
  );
}

export default CheckoutForm;
