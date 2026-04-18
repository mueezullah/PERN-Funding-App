import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { handleError, handleSuccess } from "../utils"; // Assuming you have these toast helpers

const CheckoutForm = ({ onSuccess, amount }) => {
    // Stripe hooks
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent submission until Stripe has fully loaded
        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        // Confirm the payment with Stripe
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required", // Tells Stripe NOT to automatically refresh the page
        });

        if (error) {
            // This happens if the card was declined, or they typed wrong info
            setErrorMessage(error.message);
            handleError(error.message || "Payment failed");
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Payment went through on Stripe! 
            // Now we tell our backend to confirm it and update the campaign progress bar
            try {
                const token = localStorage.getItem("token");
                const confirmResponse = await fetch("http://localhost:8080/payments/confirm", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ paymentIntentId: paymentIntent.id })
                });

                if (!confirmResponse.ok) {
                    throw new Error("Could not update campaign progress.");
                }

                handleSuccess("Thank you! Your donation was successful.");
                if (onSuccess) onSuccess();
            } catch (err) {
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
            {/* PaymentElement securely collects all card details automatically */}
            <PaymentElement />
            
            {/* Show any Stripe-provided error messages to the user */}
            {errorMessage && <div className="text-red-500 text-sm font-medium">{errorMessage}</div>}
            
            {/* Submit Button */}
            <button
                disabled={isLoading || !stripe || !elements}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-4 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="animate-pulse">Processing...</span>
                ) : (
                    `Pay $${amount}`
                )}
            </button>
        </form>
    );
};

export default CheckoutForm;
