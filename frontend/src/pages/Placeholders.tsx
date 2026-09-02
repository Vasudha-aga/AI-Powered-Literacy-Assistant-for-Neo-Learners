import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Profile() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User /> User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Curriculum() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <h1 className="text-3xl font-semibold text-textSecondary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        Curriculum is coming soon
      </h1>
    </div>
  );
}
