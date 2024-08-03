FROM node:20.16.0-alpine

WORKDIR /app

COPY /package*.json ./

RUN npm install
RUN npm install prisma
RUN npm install @prisma/client

COPY /prisma prisma/

RUN npx prisma generate

COPY . .

EXPOSE 8080

CMD ["sh", "startup.sh"]