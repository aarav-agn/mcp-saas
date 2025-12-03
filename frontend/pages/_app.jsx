import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { useEffect } from "react";
import { initOtel } from "../lib/otel";

function App({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    // initialize frontend telemetry (no-op if not configured)
    initOtel();
  }, []);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default App;
