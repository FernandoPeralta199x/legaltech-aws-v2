import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { NewCaseWizard } from "@/components/cases/wizard/NewCaseWizard";

export default function NewCasePage() {
  return (
    <AuthGuard>
      <AppLayout>
        <NewCaseWizard />
      </AppLayout>
    </AuthGuard>
  );
}
