import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../forms/LoginForm";
import { signIn, getSession } from "next-auth/react";
import { emptyCart } from "../../products/store/useProductsStore";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  getSession: jest.fn(),
}));

jest.mock("next/link", () => {
  return function Link({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("../../products/store/useProductsStore", () => ({
  useCart: () => [{ id: 1, quantity: 2 }],
  emptyCart: jest.fn(),
}));

const messageApi = {
  success: jest.fn(),
  error: jest.fn(),
};

jest.mock("antd", () => {
  const React = require("react");

  function Form({
    children,
    onFinish,
  }: {
    children: React.ReactNode;
    onFinish?: (values: any) => void;
  }) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onFinish?.({ email: "TEST@TEST.COM", password: "123456" });
        }}
      >
        {children}
      </form>
    );
  }

  Form.Item = function FormItem({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };

  function Input(props: any) {
    return <input {...props} />;
  }

  Input.Password = function PasswordInput(props: any) {
    return <input type="password" {...props} />;
  };

  function Button({
    children,
    htmlType,
  }: {
    children: React.ReactNode;
    htmlType?: string;
  }) {
    return (
      <button type={htmlType === "submit" ? "submit" : "button"}>
        {children}
      </button>
    );
  }

  return {
    Button,
    Form,
    Input,
    message: {
      useMessage: () => [messageApi, <div key="holder" />],
    },
  };
});

describe("LoginForm handleLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockClear();
    refreshMock.mockClear();
    messageApi.success.mockClear();
    messageApi.error.mockClear();
  });

  it("success: calls signIn, navigates, merges cart, and empties cart", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "1" } });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /login/i }));

    waitFor(() => {
      expect(signIn).toHaveBeenCalledTimes(1);
    });

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "test@test.com",
      password: "123456",
      redirect: false,
    });

    expect(messageApi.success).toHaveBeenCalledWith("Logged in successfully");

    expect(pushMock).toHaveBeenCalledWith("/");
    expect(refreshMock).toHaveBeenCalled();
    expect(getSession).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/cart/merge", {
      method: "POST",
      body: JSON.stringify({ items: [{ id: 1, quantity: 2 }] }),
    });

    expect(emptyCart).toHaveBeenCalledTimes(1)

  });

  it("invalid credentials: shows error and does not navigate", async () => {
    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: "CredentialsSignin",
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(messageApi.error).toHaveBeenCalledWith(
        "Invalid email or password",
      );
    });

    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
    expect(getSession).not.toHaveBeenCalled();
  });
});
