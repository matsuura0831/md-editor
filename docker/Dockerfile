FROM node:latest

ARG WINE_BRANCH="stable"

RUN apt-get update && \
    apt-get install -y git \
        libx11-xcb-dev libxcb-dri3-dev libxtst6 libnss3-dev libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 && \
    # install wine
    apt-get install -y software-properties-common apt-transport-https ca-certificates && \
    wget -nv -O- https://dl.winehq.org/wine-builds/winehq.key | APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1 apt-key add - && \
    apt-add-repository "deb https://dl.winehq.org/wine-builds/debian/ $(grep VERSION_CODENAME= /etc/os-release | cut -d= -f2) main" && \
    dpkg --add-architecture i386 && \
    apt-get update && \
    DEBIAN_FRONTEND="noninteractive" apt-get install -y --install-recommends winehq-${WINE_BRANCH} && \
    # cleanup
    apt-get clean && rm -rf /var/lib/apt/lists/*


ADD ssh/config /root/.ssh/config

WORKDIR /workspace
CMD ["npm", "run", "electron:build", "--", "--linux", "deb", "--win", "portable"]