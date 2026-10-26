# Standard Next.js standalone-output build (see next.config.ts's
# `output: "standalone"`) — three stages so the final image only carries
# the trimmed `.next/standalone` bundle, not the full node_modules/build tree.
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* vars are baked in at build time, not read at container
# start — pass the real ones here (see lib/api.ts's PUBLIC_API_URL/
# API_BASE_URL split for why the browser- and server-facing URLs differ).
# INTERNAL_API_URL also has to be set here, not just at container start:
# pages without generateStaticParams/force-dynamic (e.g. /boutique) are
# prerendered during `npm run build` itself, and that server-side fetch
# reads API_BASE_URL — which resolves to INTERNAL_API_URL, never
# NEXT_PUBLIC_API_URL, per lib/api.ts. The backend must be reachable from
# the builder stage at this exact value for that prerender to succeed
# (confirmed: pass `--network <net> --build-arg INTERNAL_API_URL=http://
# <backend-container>:8000/api/v1` with the backend already running on
# that network — plain `docker compose build` can't do this itself, since
# Compose doesn't support cross-service dependencies at build time).
ARG NEXT_PUBLIC_API_URL
ARG INTERNAL_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV INTERNAL_API_URL=${INTERNAL_API_URL}
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
