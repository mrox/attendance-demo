FROM node:18
# RUN sudo echo "Asia/Ho_Chi_Minh" > /etc/timezone
# RUN sudo dpkg-reconfigure -f noninteractive tzdata
# Create app directory
ENV TZ="Asia/Ho_Chi_Minh"

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]