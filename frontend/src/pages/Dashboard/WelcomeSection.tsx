interface WelcomeSectionProps {
  userName: string | undefined;
}

/**
 * Dashboard welcome header
 * Shows personalized greeting and description
 */
export const WelcomeSection = ({ userName }: WelcomeSectionProps) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900">
      Welcome back, {userName}!
    </h1>
    <p className="mt-2 text-gray-600">
      This is your dashboard. Create and manage your meetings here.
    </p>
  </div>
);
