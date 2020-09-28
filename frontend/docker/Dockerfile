FROM node:latest

RUN apt-get update && \
    apt-get install -y libx11-xcb-dev libxcb-dri3-dev libxtst6 libnss3-dev libatk-bridge2.0-0 libgtk-3-0 libasound2 && \
    # cleanup
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace