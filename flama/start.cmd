@ECHO OFF

REM Build the Docker image
docker build --no-cache -t flamapy .

REM Run the Docker container
docker run -p 8000:8000 -it --name flama.py flamapy

REM Stop the Docker container
docker stop flama.py

REM Remove the Docker container
docker rm flama.py

REM Remove the Docker image
docker rmi flamapy