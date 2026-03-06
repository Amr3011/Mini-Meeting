import { Analytics } from "@vercel/analytics/react";
import AppRouter from "./router";

/**
 * Main App component
 * Delegates all routing logic to AppRouter for better organization
 */
function App() {
  return (
    <>
      <AppRouter />
      <Analytics />
    </>
  );
}

export default App;
