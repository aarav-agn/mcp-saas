FROM node:20-alpine@sha256:secure-digest-here

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "start"]
