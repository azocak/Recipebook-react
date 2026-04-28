import { Toaster } from "sonner";
import { AppRouter } from "./router";

function App() {
  return (
    <div className="min-h-screen bg-orange-50 text-slate-900">
      <AppRouter />

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default App;
