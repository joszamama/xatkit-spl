# Use a smaller Python image as a parent image
FROM python:3.9-slim

# Install git and other dependencies
RUN apt-get update && apt-get install -y git 

# Set the working directory to /app
WORKDIR /app

# Clone the GitHub repository
RUN git clone https://github.com/flamapy/core.git /app

# Install the requirements
RUN pip install --no-cache-dir wheel hug==2.6.1 prospector==1.3.0 pytest==5.4.3 urllib3>=1.26.7 python-sat>=0.1.7.dev6

# Start the server
CMD ["hug", "-f", "flamapy/endpoint/diverso_lab.py"]
