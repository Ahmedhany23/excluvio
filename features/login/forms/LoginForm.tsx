"use client";

import { Button, Form, Input, message } from "antd";

import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { emptyCart, useCart } from "../../products/store/useProductsStore";
import { useState } from "react";

export type LoginValues = { email: string; password: string };

const DEMO = {
  email: "ahmedhany.22@hotmail.com",
  password: "123456",
} as const;

const LoginForm = () => {
  const [form] = Form.useForm<LoginValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const cart = useCart();
  const [loading, setLoading] = useState(false);

  const handleFillDemo = () => {
    form.setFieldsValue({
      email: DEMO.email,
      password: DEMO.password,
    });
  };

  const handleLogin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: values.email.toLowerCase(),
        password: values.password,
        redirect: false,
      });

      if (!res) {
        messageApi.error("No response from server");
        return;
      }

      if (!res.ok) {
        if (res.error === "CredentialsSignin") {
          messageApi.error("Invalid email or password");
          return;
        }
        messageApi.error(res.error || "Login failed");
        return;
      }

      messageApi.success("Logged in successfully");

      const newSession = await getSession();

      if (newSession?.user) {
        const resMerge = await fetch("/api/cart/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart }),
        });

        if (!resMerge.ok) {
          messageApi.error("Error merging cart");
          return;
        }

        emptyCart();
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR CATCH:", error);
      messageApi.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <Form<LoginValues>
        data-cy="login-form"
        form={form}
        className="w-full space-y-10"
        layout="vertical"
        onFinish={handleLogin}
      >
        <div className="space-y-5">
          <h4 className="font-poppins text-4xl font-medium">
            Log in to Exclusive
          </h4>
          <p className="font-poppins text-md">Enter your details below</p>
        </div>

        <div className="rounded-2xl border p-4 text-sm">
          <div className="font-semibold">Demo Account</div>
          <div>Email: {DEMO.email}</div>
          <div>Password: {DEMO.password}</div>

          <div className="mt-3 flex gap-2">
            <Button type="primary" onClick={handleFillDemo}>
              Fill Demo Data
            </Button>
          </div>
        </div>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input data-cy="login-email" placeholder="Email" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password data-cy="login-password" placeholder="Password" size="large" />
        </Form.Item>

        <Form.Item>
          <Button
            data-cy="login-submit"
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            disabled={loading}
          >
            Login
          </Button>
        </Form.Item>

        <div className="space-y-5">
          <p className="font-poppins text-md">
            Don&apos;t have an account?{" "}
            <Link href="/signup">
              <span className="text-black! underline!">Sign up</span>
            </Link>
          </p>
        </div>
      </Form>
    </>
  );
};

export default LoginForm;
