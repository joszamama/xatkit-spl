# Use an official Java image as the base image
FROM openjdk:14-jdk-alpine

# Set the environment variables
ENV CHATBOT_NAME=CHANGE_NAME
ENV CHATBOT_DEFINITION='CHANGE_DEF'

# Install Git
RUN apk add git maven

# Set the working directory in the image
WORKDIR /app

# Clone your repository
RUN git clone https://github.com/joszamama/xatkit-main.git

# Set the working directory to the cloned repository
WORKDIR /app/xatkit-main

# Build the project using Maven
RUN git submodule update --init --recursive
RUN mvn clean install -DskipTests

# Set the working directory to the xatkit-spl-parser project
WORKDIR /app/xatkit-main/xatkit-spl-parser
RUN mkdir -p /app/xatkit-main/xatkit-spl-parser/src/bots/${CHATBOT_NAME}
RUN echo ${CHATBOT_DEFINITION} > /app/xatkit-main/xatkit-spl-parser/src/bots/${CHATBOT_NAME}/${CHATBOT_NAME}.json
RUN mvn clean compile
RUN mvn exec:java -e -Dexec.mainClass="com.xatkit.spl.parser.XatkitParser" -Dexec.args="/app/xatkit-main/xatkit-spl-parser/src/bots/${CHATBOT_NAME}/${CHATBOT_NAME}"
RUN cp -r /app/xatkit-main/xatkit-spl-parser/src/bots/${CHATBOT_NAME}/${CHATBOT_NAME}.java /app/xatkit-main/xatkit-examples/GreetingsBots/GreetingsBot/src/main/java/com/xatkit/example

# Set the working directory to the example project
WORKDIR /app/xatkit-main/xatkit-examples/GreetingsBots/GreetingsBot
RUN mvn clean compile

# Specify the command to run the compiled application
CMD ["sh", "-c", "mvn exec:java -e -Dexec.mainClass=\"com.xatkit.example.${CHATBOT_NAME}\""]