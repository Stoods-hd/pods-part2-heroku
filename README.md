# pods-part2-heroku
Pods Part 2 example which is deployable to Heroku

# Instructions for creating POD POC in Heroku
NPM Packages that require installing:

npm i -D  webpack webpack-cli webpack-dev-server
npm i html-webpack-plugin html-loader --save-dev
npm install @inrupt/solid-client @inrupt/solid-client-authn-browser @inrupt/vocab-common-rdf
npm install buffer
npm install express

# Instructions for running
To run locally:

npm run dev
http://127.0.0.1:8080/

To run in Heroku, once uploaded as an app:
# Assumption here that the app will be deployed to heroku, and linked through Github for the build deployment upon pushing the branch
