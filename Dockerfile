# base image
FROM node:22


# working directory inside container
WORKDIR /app

# copy files
COPY package*.json ./
RUN npm install

# copy all source code
COPY . .

# generate prisma client
RUN npx prisma generate

# expose port
EXPOSE 3001

# run the app
CMD ["npm", "start"]
