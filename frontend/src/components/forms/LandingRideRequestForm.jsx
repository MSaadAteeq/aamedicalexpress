"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import api from "@/lib/api";
import { mobilityTypeOptions, tripTypeOptions } from "@/lib/constants";
import { emergencyRideSchema } from "@/lib/validators";

const defaultValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  tripType: "one-way",
  mobilityType: "ambulatory",
};

export default function LandingRideRequestForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(emergencyRideSchema),
    defaultValues,
  });

  const onSubmit = async (values) => {
    try {
      await api.post("/public-rides/emergency", values);
      toast.success("Emergency ride request submitted. Dispatch will call you shortly.");
      reset(defaultValues);
    } catch (error) {
      const message = error.response?.data?.message || "Could not submit emergency request.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <Input id="firstName" label="First Name *" placeholder="Jane" error={errors.firstName?.message} {...register("firstName")} />
      <Input id="lastName" label="Last Name *" placeholder="Doe" error={errors.lastName?.message} {...register("lastName")} />
      <Input id="phone" label="Phone Number *" placeholder="(571) 555-0199" error={errors.phone?.message} {...register("phone")} />
      <Input id="email" label="Email (Optional)" placeholder="jane@example.com" error={errors.email?.message} {...register("email")} />
      <Select id="tripType" label="Number of Legs / Trip Type" options={tripTypeOptions} error={errors.tripType?.message} {...register("tripType")} />
      <Select
        id="mobilityType"
        label="Mobility & Assistance"
        options={mobilityTypeOptions}
        error={errors.mobilityType?.message}
        {...register("mobilityType")}
      />
      <div className="md:col-span-2">
        <Button type="submit" isLoading={isSubmitting} className="w-full md:w-auto">
          Request Emergency Ride
        </Button>
      </div>
    </form>
  );
}
