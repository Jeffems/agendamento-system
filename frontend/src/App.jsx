import { Toaster } from "sonner";
import Agendamentos from "./pages/Agendamentos";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Agendamentos />
    </>
  );
}

export default App;

