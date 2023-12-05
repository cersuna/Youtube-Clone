# Use an official Node runtime as a parent image
FROM node:18

# Set working directory in container (can be used to contain more than one container)
WORKDIR /app

# Copy package.json into package-lock.json into the working directory
COPY package*.json ./

# install ffmpeg into the container (independent environment)
RUN apt-get update && apt-get install -y ffmpeg

# install other required packages
RUN npm install 

# Copy source code
COPY . .

# Make port 3000 available outside of container
EXPOSE 3000

# Start app with CMD
CMD [ "npm", "start" ]