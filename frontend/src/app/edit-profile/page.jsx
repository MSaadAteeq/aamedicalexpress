import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { profileSchema } from "@/lib/validators";
import api from "@/lib/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthLoading, updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [isAuthenticated, isAuthLoading, navigate, reset, user]);

  const onSubmit = async (values) => {
    try {
      const response = await api.put("/auth/profile", values);
      updateUser(response.data.user);
      toast.success("Profile updated.");
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.message || "Could not update profile.";
      toast.error(message);
    }
  };

  if (isAuthLoading || (!isAuthenticated && !isAuthLoading)) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-slate-600">Loading profile...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Keep your contact details current so dispatch can reach you quickly.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <Input id="name" label="Full Name *" error={errors.name?.message} {...register("name")} />
          <Input id="email" label="Email" value={user?.email || ""} disabled />
          <Input id="phone" label="Phone Number *" error={errors.phone?.message} {...register("phone")} />
          <div className="md:col-span-2">
            <Button type="submit" isLoading={isSubmitting} className="inline-flex items-center gap-2">
              <Save size={14} />
              Save Changes
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
