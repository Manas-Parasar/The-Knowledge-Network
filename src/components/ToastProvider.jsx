import React from "react";
import { Toaster } from "react-hot-toast";

const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "#10B981",
              secondary: "#fff",
            },
            style: {
              background: "#10B981",
            },
          },
          error: {
            duration: 5000,
            theme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
            style: {
              background: "#EF4444",
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider;
