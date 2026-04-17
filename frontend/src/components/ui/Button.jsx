"use client";

import clsx from "clsx";

export default function Button({ className, isLoading, children, ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}
