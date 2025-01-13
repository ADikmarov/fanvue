import { TrpcRouter } from "@/trpc/trpcRouter";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

export const trpcServer = createTRPCProxyClient<TrpcRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
  transformer: SuperJSON,
});

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.PRODUCTION_URL)
    return `https://${process.env.PRODUCTION_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
