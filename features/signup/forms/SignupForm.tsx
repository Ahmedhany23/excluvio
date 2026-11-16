"use client";

import { Button, Form, Input, message } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type RegsiterFieldForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const SignupForm = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (values: RegsiterFieldForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        messageApi.success("Account created successfully");
        // Use router instead of window.location.href
        router.push("/login");
      } else {
        messageApi.error(data.error || "Something went wrong");
        console.error("Signup error:", data.error);
      }
    } catch (error) {
      messageApi.error("Failed to sign up. Try again later.");
      console.error("Signup request failed:", error);
    }

    setLoading(false);
  };

  return (
    <>
      {contextHolder}
      <Form
        data-cy="signup-form"
        className="w-full space-y-10"
        layout="vertical"
        onFinish={handleSignup}
      >
        {/* Header */}
        <div className="space-y-5">
          <h4 className="font-poppins text-4xl font-medium">
            Create an account
          </h4>
          <p className="font-poppins text-md">Enter your details below</p>
        </div>

        {/* Name */}
        <Form.Item<RegsiterFieldForm>
          name="name"
          rules={[{ required: true, message: "Please enter your name" }]}
        >
          <Input data-cy="signup-name" placeholder="Name" size="large" />
        </Form.Item>

        {/* Email */}
        <Form.Item<RegsiterFieldForm>
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input data-cy="signup-email" placeholder="Email" size="large" />
        </Form.Item>

        {/* Password */}
        <Form.Item<RegsiterFieldForm>
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password data-cy="signup-password" placeholder="Password" size="large" />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item<RegsiterFieldForm>
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password data-cy="signup-confirm-password" placeholder="Confirm Password" size="large" />
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button
            data-cy="signup-submit"
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            disabled={loading}
          >
            Sign Up
          </Button>
        </Form.Item>

        {/* Footer */}
        <div className="space-y-5">
          <p className="font-poppins text-md">
            Already have an account?{" "}
            <Link href="/login" className="text-black! underline!">
              Login
            </Link>
          </p>
        </div>
      </Form>
    </>
  );
};

export default SignupForm;
