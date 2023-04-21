<div id="top"></div>
<br />
<div align="center">

  <h3 align="center">Xatkit-SPL Backend</h3>

  <p align="center">
    A new and easy way to generate product-line-based chatbots
    <br />
    <a href="https://github.com/joszamama/xatkit-spl-backend/issues">Report Bug</a>
    ·
    <a href="https://github.com/joszamama/xatkit-spl-backend/issues">Request Feature</a>
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

Xatkit-SPL Backend provides an API for chatbot modeling through different technologies. The main goal is to improve the utility of chatbots making them more accesible to the public with our automatic chatbot builder tool.

Intended workflow explained:
* User logs-in the website, creating a new user.
* Navigates to the configurator, and start defining a product-line-based chatbot family in an easy and understandable way + providing some basic information.
* Once the user has finished the modelling, hit enter and you will be prompted to create the chatbots you need.
* Define the name, the description and the intent information for this new chatbot product.
* Now, your chatbot is being tested with [FLAMA](https://github.com/diverso-lab/core), which is an automated tool for feature model analysis.
* Once everything is ready, the chatbot gets created through [Xatkit](https://github.com/joszamama/xatkit-main), compiles all the necesary packages and gets automatically deployed in the localhost through Docker.

There are a few known bugs that we acknowledge, described in the projects section. If you detect any other new bug, please consider reporting it!

<p align="right">(<a href="#top">back to top</a>)</p>



### Built With

* [MongoDB](https://www.mongodb.com/)
* [NodeJS](https://nodejs.org/en/)
* [ExpressJS](https://expressjs.com/es/)
* [Xatkit](https://xatkit.com/)
* [FLAMA](https://github.com/diverso-lab/core)
* [Docker](https://www.docker.com/)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

First, you will need to install [NPM](https://nodejs.org/en/download/), a [MongoDB](https://www.mongodb.com/) database and [Docker](https://docs.docker.com/desktop/).

### Instalation

1. Clone the repository

2. Install the NPM requisites:
  ```sh
  $ cd xatkit-spl-api
  $ npm install
  ```
3. Update the .env file providing the different values shown in .env.example

4. Run the app:
  ```sh
  $ npm start
  ```
  
Then, you can access all the endpoints through an application like [Postman](https://www.postman.com/), or using the Swagger UI in /docs.

<p align="right">(<a href="#top">back to top</a>)</p>

### Using the Tool

Now, you can provide a valid Feature Model in UVL format, and a JSON file with information about the features in the model. You can take a look of the examples we provide in the bots/ExampleBot directory.

### Deploying a Chatbot

Once the PL -> Intent -> Chatbot process has been completed with this tool, you will have access to a Dockerfile. For running your new chatbot, you will need to execute the following commands, having [Docker](https://docs.docker.com/desktop/) previously installed.

1. Build the bot image:
  ```sh
  $ docker build -t newbot . 
  ```
2. Run the chatbot:
  ```sh
  $ docker run -it -p 5000:5000 -p 5001:5001 newbot 
  ```
 
Now you can access http://localhost:5000/admin and start chatting!

### NLP Services

If you want to take one step further and improve your bots adding a NLP layer, you will need to follow this [tutorial](https://github.com/xatkit-bot-platform/nlp.js-server). This Docker image will generate a NLP Server for Intent Recognition, and its ready to go, Xatkit-SPL will detect the server automatically and link the bots to it.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>
