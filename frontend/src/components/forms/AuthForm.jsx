import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { authSchema } from "@/lib/validators";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AuthForm({ mode = "login" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const { login } = useAuth();

  const schema = isSignup
    ? authSchema.extend({
        name: authSchema.shape.name.unwrap(),
        phone: authSchema.shape.phone.unwrap(),
      })
    : authSchema.pick({ email: true, password: true });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login";
      const payload = isSignup
        ? {
            name: values.name,
            email: values.email,
            phone: values.phone,
            password: values.password,
          }
        : {
            email: values.email,
            password: values.password,
          };

      const response = await api.post(endpoint, payload);
      login(response.data.token, response.data.user);
      toast.success(isSignup ? "Account created successfully." : "Welcome back.");
      navigate(response.data.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error) {
      const message = error.response?.data?.message || "Authentication failed.";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{isSignup ? "Create your account" : "Sign in"}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {isSignup ? "Join PMT Member to request and track rides." : "Access your dashboard and request rides."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        {isSignup ? (
          <Input id="name" label="Full Name *" placeholder="Jane Doe" error={errors.name?.message} {...register("name")} />
        ) : null}
        <Input id="email" label="Email *" placeholder="jane@example.com" error={errors.email?.message} {...register("email")} />
        {isSignup ? (
          <Input id="phone" label="Phone Number *" placeholder="(571) 555-0199" error={errors.phone?.message} {...register("phone")} />
        ) : null}
        <Input
          id="password"
          label="Password *"
          type="password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          {isSignup ? "Create Account" : "Sign In"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-blue-600 hover:text-blue-700">
          {isSignup ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
