"use client";

import { ReactNode } from "react";
import { UseFormRegister, FieldError } from "react-hook-form";
import { FormInput, FormInputProps } from "./form-input";

interface FormFieldProps extends Omit<FormInputProps, "error"> {
  name: string;
  register?: UseFormRegister<any>;
  error?: FieldError;
  children?: ReactNode;
}

export function FormField({
  name,
  register,
  error,
  children,
  ...props
}: FormFieldProps) {
  if (children) {
    return <div className="w-full space-y-2">{children}</div>;
  }

  return (
    <FormInput
      {...(register && register(name))}
      error={error?.message}
      {...props}
    />
  );
}
