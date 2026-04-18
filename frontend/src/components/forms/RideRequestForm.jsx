import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import api from "@/lib/api";
import { mobilityTypeOptions, tripTypeOptions } from "@/lib/constants";
import { rideRequestSchema } from "@/lib/validators";

export default function RideRequestForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: {
      tripType: "one-way",
      mobilityType: "ambulatory",
      pickupLocation: "",
      dropoffLocation: "",
      dateTime: "",
      notes: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await api.post("/rides", values);
      toast.success("Ride requested successfully.");
      navigate("/dashboard");
    } catch (error) {
      const validationError = error.response?.data?.errors?.[0]?.message;
      const message = validationError || error.response?.data?.message || "Could not submit ride request.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <Input
        id="pickupLocation"
        label="Pickup Location *"
        placeholder="123 Main St, City, VA"
        error={errors.pickupLocation?.message}
        {...register("pickupLocation")}
      />
      <Input
        id="dropoffLocation"
        label="Drop-off Location *"
        placeholder="Hospital / Clinic address"
        error={errors.dropoffLocation?.message}
        {...register("dropoffLocation")}
      />
      <Input
        id="dateTime"
        label="Date & Time *"
        type="datetime-local"
        required
        error={errors.dateTime?.message}
        {...register("dateTime")}
      />
      <Select id="tripType" label="Trip Type *" options={tripTypeOptions} error={errors.tripType?.message} {...register("tripType")} />
      <Select
        id="mobilityType"
        label="Mobility Type *"
        options={mobilityTypeOptions}
        error={errors.mobilityType?.message}
        {...register("mobilityType")}
      />
      <div className="md:col-span-2">
        <Textarea
          id="notes"
          label="Additional Notes"
          placeholder="Include gate code, wheelchair details, companion notes, etc."
          error={errors.notes?.message}
          {...register("notes")}
        />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" isLoading={isSubmitting}>
          Submit Ride Request
        </Button>
      </div>
    </form>
  );
}
