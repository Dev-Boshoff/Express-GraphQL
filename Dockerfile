FROM node:12-alpine

# ARG MAX_OLD_SPACE_SIZE=8192

#  ENV NODE_OPTIONS=--max_old_space_size=$MAX_OLD_SPACE_SIZE

COPY . .

RUN yarn

CMD yarn start


