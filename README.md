# YelpCamp

fullstack app with cluster map, image upload, full authentication and authorization and other security features

## 📺 Watch Live [here](https://protected-dawn-09422.herokuapp.com/)

## 🚀 Getting Started with YelpCamp

1. [Install node](https://nodejs.org/en/) (in case you don't have it)
2. open terminal and run `git clone https://github.com/mazenadel19/YelpCamp.git`
3. `npm install -g nodemon` (in case you don't have it)
4. cd YelpCamp
5. `npm i`

#### NB: in order to use yelpcamp in your local machine you will need `.env` file that look like this

```
MAPBOX_TOKEN=*your_map_token_here*
SECRET=*some_gibberish_here*
CLOUDINARY_CLOUD_NAME=*cloud_name_here_*
CLOUDINARY_KEY=*API_key_here*
CLOUDINARY_SECRET=*API_secret_here_*
```

you can get a mapbox token from [here](https://account.mapbox.com/access-tokens/)
and your cloudinary cloud name, api key and api secret from [here](https://cloudinary.com/console)

6. `nodemon`
7. open `localhost:3000` in your browser

---

### some extra steps if you wish to have some initial data:

8. go to register tab and register as a user
9. take the `_id` printed in terminal and paste it instead of the author id in index file inside the seeds directory
10. stop the terminal
11. cd seeds
12. node `index.js`
13. cd ..
14. `nodemon`

<br/>

## 🧰 Tools I've used

- cloudinary
- colors
- connect-flash
- connect-mongo
- dotenv
- ejs
- ejs-mate
- express
- express mongo sanitize
- express-session
- helmet
- joi
- mapbox
- morgan
- method-override
- mongoose
- multer
- multer-storage-cloudinary
- passport
- passport-local
- passport-local-mongoose
- starability
