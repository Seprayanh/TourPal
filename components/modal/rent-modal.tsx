"use client";

import * as React from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

import useRentModal from "@/hooks/use-rent-modal";
import Modal from "@/components/modal/modal";
import Heading from "@/components/heading";
import { categories } from "@/components/navbar/categories";
import CategoryInput from "@/components/inputs/category-input";
import CountrySelect from "@/components/inputs/country-select";
import Counter from "@/components/inputs/counter";
import ImageUpload from "@/components/inputs/image-upload";
import Input from "@/components/inputs/input";

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

const RentModal = () => {
  const router = useRouter();
  const rentModal = useRentModal();
  const [step, setStep] = React.useState(STEPS.CATEGORY);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      title: "",
      description: "",
      price: 1,
      category: "",
      location: null,
      guestCount: 1,
      duration: 4,
      timeSlot: "",
      languages: [] as string[],
      imageSrc: "",
    },
  });

  const category = watch("category");
  const location = watch("location");
  const guestCount = watch("guestCount");
  const duration = watch("duration");
  const timeSlot = watch("timeSlot");
  const languages = watch("languages") as string[];
  const imageSrc = watch("imageSrc");

  const TIME_SLOTS = [
    { value: "MORNING",   label: "Morning",   sub: "6 AM – 12 PM" },
    { value: "AFTERNOON", label: "Afternoon", sub: "12 PM – 6 PM" },
    { value: "EVENING",   label: "Evening",   sub: "6 PM – 10 PM" },
  ];

  const GUIDE_LANGUAGES = [
    "English", "Chinese", "French", "Spanish", "Italian",
    "German", "Japanese", "Korean", "Arabic", "Portuguese",
  ];

  const toggleLanguage = (lang: string) => {
    const current: string[] = languages ?? [];
    const updated = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang];
    setCustomValue("languages", updated);
  };

  const Map = React.useMemo(
    () => dynamic(() => import("@/components/map"), { ssr: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location]
  );

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onBack = () => setStep((value) => value - 1);
  const onNext = () => setStep((value) => value + 1);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.PRICE) {
      return onNext();
    }

    setIsLoading(true);

    try {
      await axios.post("/api/listings", data);
      toast.success("Listing created!");
      router.refresh();
      reset();
      setStep(STEPS.CATEGORY);
      rentModal.onClose();
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const actionLabel = React.useMemo(() => {
    if (step === STEPS.PRICE) {
      return "Create Listing";
    }

    return "Next";
  }, [step]);

  const secondaryActionLabel = React.useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }

    return "Back";
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Which of these best describes your place?"
        subtitle="Pick a category"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
        {categories.map((item) => (
          <div key={item.label} className="col-span-1">
            <CategoryInput
              label={item.label}
              icon={item.icon}
              selected={category === item.label}
              onClick={(category) => {
                setCustomValue("category", category);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Where is your place located?"
          subtitle="Help guests find you!"
        />
        <CountrySelect
          value={location}
          onChange={(value) => setCustomValue("location", value)}
        />
        <Map center={location?.latlng} />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Tell us about your experience"
          subtitle="Help tourists find the perfect tour."
        />

        {/* Group size */}
        <Counter
          title="Max Group Size"
          subtitle="How many participants can join at once?"
          value={guestCount}
          onChange={(value) => setCustomValue("guestCount", value)}
        />
        <hr />

        {/* Duration */}
        <Counter
          title="Duration (hours)"
          subtitle="How long does this experience last?"
          value={duration}
          onChange={(value) => setCustomValue("duration", value)}
        />
        <hr />

        {/* Time of day */}
        <div>
          <p className="font-medium text-gray-800 mb-2">Available time of day</p>
          <div className="grid grid-cols-3 gap-3">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                type="button"
                onClick={() =>
                  setCustomValue("timeSlot", timeSlot === slot.value ? "" : slot.value)
                }
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                  timeSlot === slot.value
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className="text-sm font-semibold text-gray-700">{slot.label}</span>
                <span className="text-xs text-gray-400">{slot.sub}</span>
              </button>
            ))}
          </div>
        </div>
        <hr />

        {/* Languages */}
        <div>
          <p className="font-medium text-gray-800 mb-2">Languages you speak</p>
          <div className="flex flex-wrap gap-2">
            {GUIDE_LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  (languages ?? []).includes(lang)
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add a photo of your place"
          subtitle="Showcase your place!"
        />
        <ImageUpload
          value={imageSrc}
          onChange={(value) => setCustomValue("imageSrc", value)}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="How would you describe your place?"
          subtitle="Write a brief description!"
        />
        <Input
          id="title"
          label="Title"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <hr />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="How much do you want to charge per night?"
          subtitle="Set a price!"
        />
        <Input
          id="price"
          label="Price"
          type="number"
          formatPrice
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  return (
    <Modal
      title="Add a property"
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      body={bodyContent}
      isOpen={rentModal.isOpen}
      onClose={rentModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
};

export default RentModal;
