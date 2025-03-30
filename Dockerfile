# Use Ubuntu as the base image
FROM --platform=linux/amd64 ubuntu:22.04

# Set environment variables to prevent user prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install OpenJDK 21, unzip, X11 libraries, and SSH server
RUN apt-get update && apt-get install -y \
    openjdk-21-jdk \
    unzip \
    libx11-6 libxext6 libxi6 libxtst6 libxrender1 libgtk-3-0 \
    x11-apps \
    openssh-server \
    xvfb \
    && apt-get clean

# Configure SSH for X11 forwarding
RUN mkdir /var/run/sshd
RUN echo "X11Forwarding yes" >> /etc/ssh/sshd_config
RUN echo "X11UseLocalhost no" >> /etc/ssh/sshd_config

# Create a user for SSH access (e.g., 'ghidrauser')
RUN useradd -m -s /bin/bash ghidrauser && echo "ghidrauser:ghidra" | chpasswd

# Copy Ghidra, the eBPF extension, and the binaries into the container
COPY ghidra_11.3.1_PUBLIC /opt/ghidra
COPY ghidra-ebpf-0.1.zip /opt/ghidra/Extensions/
COPY GhidraMCP-1-0.zip /opt/ghidra/Extensions/
COPY binaries /opt/ghidra/binaries
# Copy the script into the Ghidra scripts directory
COPY StartMCPServer.java /opt/ghidra/scripts/

# Set working directory
WORKDIR /opt/ghidra

# Install the extension by unzipping it into the Extensions directory
RUN unzip -q Extensions/ghidra-ebpf-0.1.zip -d Extensions/
RUN unzip -q Extensions/GhidraMCP-1-0.zip -d Extensions/

# Set JAVA_HOME environment variable
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

# Expose SSH port
EXPOSE 22

# Start SSH server
CMD ["/usr/sbin/sshd", "-D"]