import {
  darkTheme,
  ThemeProvider,
  ToastProvider,
  ToastViewport,
  useClientStyle,
  useTheme,
} from "@kampus/ui";
import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";
import { favicons } from "./features/assets/favicons";
import { UserContextManager } from "./features/auth/user-context";
import loadingIndicatorStyles from "./features/loading-indicator/loading-indicator.css";
import { useLoadingIndicator } from "./features/loading-indicator/useLoadingIndicator";
import { Topnav } from "./features/topnav/Topnav";
import { getUser, getUserTheme } from "./session.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: loadingIndicatorStyles },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    { rel: "apple-touch-icon", href: favicons.apple, sizes: "180x180" },
    { rel: "icon", href: favicons[32], sizes: "32x32", type: "image/png" },
    { rel: "icon", href: favicons[16], sizes: "16x16", type: "image/png" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",
    },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "kamp.us pano",
  viewport: "width=device-width,initial-scale=1",
  "twitter:image": favicons.logo,
  "og:image": favicons.logo,
});

export const loader = async ({ request }: LoaderArgs) => {
  return json({
    user: await getUser(request),
    theme: await getUserTheme(request),
  });
};

const Document = () => {
  const { theme: userTheme } = useLoaderData<typeof loader>();
  const clientStyle = useClientStyle();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (userTheme) {
      setTheme(userTheme);
    }
  }, [setTheme, userTheme]);

  useLoadingIndicator();

  useEffect(() => {
    clientStyle.reset();
  }, [clientStyle]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <style
          id="stitches"
          dangerouslySetInnerHTML={{ __html: clientStyle.sheet }}
          suppressHydrationWarning
        />
        <style
          id="global"
          dangerouslySetInnerHTML={{
            __html: `
            * { margin: 0; padding: 0; }
            body {
              font-family: Inter, sans-serif;
              background: var(--colors-gray1);
            }
          `,
          }}
        />
      </head>
      <body className={theme === "DARK" ? darkTheme : ""}>
        <Topnav />
        <ToastViewport />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <ThemeProvider>
      <ToastProvider swipeDirection="right">
        <UserContextManager user={user}>
          <Document />
        </UserContextManager>
      </ToastProvider>
    </ThemeProvider>
  );
}
