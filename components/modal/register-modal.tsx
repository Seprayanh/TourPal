"use client";

import * as React from "react";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { AiFillGithub } from "react-icons/ai";
import { signIn } from "next-auth/react";

import useRegisterModal from "@/hooks/use-register-modal";
import useLoginModal from "@/hooks/use-login-modal";

import Modal from "./modal";
import Heading from "@/components/heading";
import Input from "@/components/inputs/input";
import Button from "@/components/button";

enum STEPS {
  CREDENTIALS = 0,
  ROLE = 1,
}

const ROLES = [
  {
    value: "TOURIST",
    title: "Tourist",
    subtitle: "I'm a traveler looking for unique local experiences with expert guides.",
    emoji: "🌏",
  },
  {
    value: "GUIDE",
    title: "导游 / Guide",
    subtitle: "我是懂外语的本地向导，提供专业的旅游导览服务。",
    emoji: "🧭",
  },
];

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(STEPS.CREDENTIALS);
  const [selectedRole, setSelectedRole] = React.useState<string>("TOURIST");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onCredentialsNext: SubmitHandler<FieldValues> = () => {
    setStep(STEPS.ROLE);
  };

  const onRegister = async () => {
    setIsLoading(true);
    try {
      const data = getValues();
      await axios.post("/api/register", { ...data, role: selectedRole });
      toast.success("Account created! Please log in.");
      registerModal.onClose();
      setStep(STEPS.CREDENTIALS);
      setSelectedRole("TOURIST");
      loginModal.onOpen();
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onClose = () => {
    registerModal.onClose();
    setStep(STEPS.CREDENTIALS);
    setSelectedRole("TOURIST");
  };

  const credentialsBody = (
    <div className="flex flex-col gap-4">
      <Heading title="Welcome to TourPal" subtitle="Create an account" />
      <Input
        id="name"
        label="Name"
        type="text"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="email"
        label="Email"
        type="email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="password"
        label="Password"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
    </div>
  );

  const roleBody = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Who are you?"
        subtitle="Choose your role — you can update this later in your profile."
      />
      <div className="flex flex-col gap-3">
        {ROLES.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => setSelectedRole(role.value)}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              selectedRole === role.value
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span className="text-3xl">{role.emoji}</span>
            <div>
              <p className="font-semibold text-gray-800">{role.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{role.subtitle}</p>
            </div>
            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
              selectedRole === role.value
                ? "border-indigo-500 bg-indigo-500"
                : "border-gray-300"
            }`} />
          </button>
        ))}
      </div>
    </div>
  );

  const footerContent = step === STEPS.CREDENTIALS ? (
    <React.Fragment>
      <hr />
      <Button
        outline
        label="Continue with Google"
        icon={FcGoogle}
        onClick={() => signIn("google")}
      />
      <Button
        outline
        label="Continue with GitHub"
        icon={AiFillGithub}
        onClick={() => signIn("github")}
      />
      <div className="flex items-center justify-center text-center gap-2 mt-4">
        <p className="font-light text-neutral-500">Already have an account?</p>
        <button
          onClick={() => {
            onClose();
            loginModal.onOpen();
          }}
          className="text-neutral-800 hover:underline cursor-pointer"
        >
          Login
        </button>
      </div>
    </React.Fragment>
  ) : undefined;

  return (
    <Modal
      title={step === STEPS.CREDENTIALS ? "Register" : "Select your role"}
      body={step === STEPS.CREDENTIALS ? credentialsBody : roleBody}
      footer={footerContent}
      actionLabel={step === STEPS.CREDENTIALS ? "Continue" : "Create Account"}
      secondaryActionLabel={step === STEPS.ROLE ? "Back" : undefined}
      secondaryAction={step === STEPS.ROLE ? () => setStep(STEPS.CREDENTIALS) : undefined}
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      onClose={onClose}
      onSubmit={
        step === STEPS.CREDENTIALS
          ? handleSubmit(onCredentialsNext)
          : onRegister
      }
    />
  );
};

export default RegisterModal;
