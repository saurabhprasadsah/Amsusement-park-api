FROM node:22-alpine3.20
WORKDIR /app
COPY ./ /app/
ENV PORT=3000

RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
