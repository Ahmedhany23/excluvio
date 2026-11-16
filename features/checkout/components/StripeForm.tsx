"use client";
import { useGetCart } from "@/hooks/useGetCart";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button, Col, Form, message, Row, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { useCheckoutCart } from "../hooks/useCheckoutCart";
import { useCreatePaymentIntent } from "../hooks/useCreatePaymentIntent";
import { IBillingDetails } from "./StripeCheckout";

interface StripeFormProps {
  amount: number;
  billingDetails: IBillingDetails;
}

const StripeForm = ({ amount, billingDetails }: StripeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const requiredKeys = [
    "street_address",
    "apartment",
    "city",
    "phone",
    "email",
  ];
  const hasMissingKeys = requiredKeys.some(
    (key) => !billingDetails || !billingDetails[key],
  );

  const { cart: cartItems } = useGetCart();

  const { mutationCreatePaymentIntent, loadingCreatePaymentIntent } =
    useCreatePaymentIntent();

  const { mutationCheckoutCart, loadingCheckoutCart } = useCheckoutCart();

  useEffect(() => {
    // Only fetch client secret if we have all required data
    if (amount > 0) {
      mutationCreatePaymentIntent({ amount })
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            throw new Error("No client secret received");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          messageApi.error(error.message || "Failed to initialize payment");
        });
    }
  }, [amount, messageApi, mutationCreatePaymentIntent]);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      messageApi.error("Payment system not ready. Please try again.");
      return;
    }

    if (hasMissingKeys) {
      setErrorMessage("Please fill your billing details");
      messageApi.error("Please fill your billing details");
      return;
    }

    if (!clientSecret) {
      messageApi.error("Payment not initialized. Please try again.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || "Payment failed");
      setLoading(false);
      return;
    }

    try {
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          payment_method_data: {
            billing_details: {
              name: billingDetails.name || "",
              email: billingDetails.email,
              phone: billingDetails.phone,
              address: {
                line1: billingDetails.address,
                city: billingDetails.city,
                country: billingDetails.country || "US",
                postal_code: billingDetails.zipCode,
                state: billingDetails.state || "",
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Payment failed");
        messageApi.error(result.error.message || "Payment failed");
      } else if (result.paymentIntent?.status === "succeeded") {
        // Handle successful payment without redirect
        messageApi.success("Payment successful!");

        await mutationCheckoutCart({
          amount,
          cartItems,
          billingDetails,
          paymentIntentId: result.paymentIntent.id, // important!
        })
          .then(
            (data) =>
              (window.location.href = `/payment-success?amount=${amount}&&orderId=${data.orderId}`),
          )
          .catch((error) => {
            console.error("Error:", error);
            messageApi.error(error.message || "Failed to checkout");
          });
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      messageApi.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex w-full flex-col gap-3">
        <Skeleton.Input active size="large" />
        <Skeleton.Input active size="large" />
        <Skeleton.Input active size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <Form onFinish={handleSubmit}>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <PaymentElement
              options={{
                layout: {
                  type: "tabs",
                  defaultCollapsed: false,
                },
              }}
            />
          </Col>
          {errorMessage && (
            <Col xs={24}>
              <div className="text-center text-red-500">{errorMessage}</div>
            </Col>
          )}
          <Col xs={24}>
            <Button
              data-cy="pay-submit"
              type="primary"
              htmlType="submit"
              size="large"
              disabled={
                !stripe ||
                loading ||
                hasMissingKeys ||
                loadingCreatePaymentIntent ||
                loadingCheckoutCart
              }
              loading={
                loading || loadingCreatePaymentIntent || loadingCheckoutCart
              }
              className="w-full"
            >
              Pay ${amount.toFixed(2)}
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default StripeForm;
