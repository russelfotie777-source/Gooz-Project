import { execSync } from "node:child_process";
import path from "node:path";

// Idempotent — safe to run before every suite execution. A few E2E tests
// need fixtures that don't exist through any public API (there's no
// "create a coupon" endpoint short of admin auth), so this shells out to
// the backend's own tinker the same way local manual testing already does
// throughout this project.
export default function globalSetup(): void {
  const backendDir = path.resolve(__dirname, "..", "..", "backend");

  execSync(
    'C:\\php84\\php.exe artisan tinker --execute="App\\Models\\Coupon::firstOrCreate([\'code\' => \'E2ETEST10\'], [\'type\' => \'percentage\', \'value\' => 10, \'is_active\' => true]);"',
    { cwd: backendDir, stdio: "inherit" }
  );
}
