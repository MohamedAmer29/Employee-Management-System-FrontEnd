import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "./api/queryClient";
import { store } from "./store/store";
import { ThemeProvider } from "./hooks/ThemeProvider";
import { useTheme } from "./hooks/useTheme";
import { useSessionRestore } from "./features/auth/useSessionRestore";
import { useSessionMonitor } from "./features/auth/useSessionMonitor";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

// eslint-disable-next-line react-refresh/only-export-components
const ThemedToastContainer = () => {
  const { theme } = useTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
      className="toast-container"
      toastClassName="toast-item"
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
const SessionRestore = () => {
  useSessionRestore();
  return null;
};

// eslint-disable-next-line react-refresh/only-export-components
const SessionMonitor = () => {
  useSessionMonitor();
  return null;
};

// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <SessionRestore />
            <SessionMonitor />
            <AppRoutes />
            <ThemedToastContainer />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
