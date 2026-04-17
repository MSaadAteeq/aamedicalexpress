import AuthForm from "@/components/forms/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <AuthForm mode="login" />
    </div>
  );
}
