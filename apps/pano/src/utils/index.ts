import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import type { Comment } from "~/models/comment.server";
import type { PostWithCommentCount } from "~/models/post.server";
import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function validateURL(url: string) {
  const expression =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

  if (url.match(expression)) {
    return true;
  }
}

export function validate(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateUsername(username: unknown): username is string {
  return validate(username) && username.length >= 2;
}
export function validatePassword(password: unknown): password is string {
  return validate(password) && password.length > 8;
}

export function getExternalPostURL(post: PostWithCommentCount) {
  const location = global.location;
  const postUrl = `${location.origin}/posts/${post.slug}-${post.id}`;
  return postUrl;
}
export function getExternalCommentURL(comment: Comment) {
  const location = global.location;
  const commentUrl = `${location.origin}${location.pathname}#c_${comment.id}`;
  return commentUrl;
}
export declare type $ElementProps<T> = T extends React.ComponentType<
  infer Props
>
  ? Props extends object
    ? Props
    : never
  : never;
