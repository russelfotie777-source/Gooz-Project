import AuthMobileFlow from "@/components/Auth/AuthMobileFlow";
import AuthDesktopPage from "@/components/Auth/AuthDesktopPage";

export default function Page() {
  return (
    <>
      <AuthMobileFlow initialMode="signup" />
      <AuthDesktopPage mode="signup" />
    </>
  );
}
