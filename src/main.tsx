import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@radix-ui/themes/styles.css";
import { Theme, ThemePanel } from "@radix-ui/themes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme accentColor="lime" grayColor="sage" radius="small" scaling="110%">
      <App />
      <ThemePanel defaultOpen={false} />
    </Theme>
  </React.StrictMode>
);
