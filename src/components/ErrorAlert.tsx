import React from "react";

interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div
      className="alert alert--error"
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      style={{ outline: "none" }}
    >
      {message}
    </div>
  );
}
