
<h4 align="center">An awesome tour booking site built on top of <a href="https://nodejs.org/en/" target="_blank">NodeJS</a>.</h4>

 

## Key Features

- Authentication and Authorization
  - Signup, Login and logout
- Tour
  - Manage booking, check user's reviews and ratings
- User profile
  - Update username, profile photo, email, and password
- Credit card payment using Stripe


## How To Use

### Book a tour

- Login or Signup to the site
- Search for tours that you want to book
- Book a tour
- Proceed to the payment using Stripe
- Enter the card details (Test Mode):
  ```
  - Card No. : 4242 4242 4242 4242
  - Expiry date: any
  - CVV: any
  ```
- Finished!

### Manage your booking

- Check the tour you have booked in "Manage Booking" page in your user settings. You'll be automatically redirected to this
  page after you have completed the booking.

### Update your profile

- You can update your own username, profile photo, email and password.



## Build With

- [NodeJS](https://nodejs.org/en/) - JS runtime environment
- [Express](http://expressjs.com/) - The web framework used
- [Mongoose](https://mongoosejs.com/) - Object Data Modelling (ODM) library
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database service
- [Pug](https://pugjs.org/api/getting-started.html) - High performance template engine
- [JSON Web Token](https://jwt.io/) - Security token
- [esbuild](https://esbuild.github.io/) - An extremely fast bundler for the web
- [Stripe](https://stripe.com/) - Online payment API
- [Postman](https://www.getpostman.com/) - API testing
- [Mailtrap](https://mailtrap.io/) & [Mailgun](https://www.mailgun.com/) - Email delivery platform

## To-do

- Review and rating
  - Allow user to add a review directly at the website after they have booked a tour
- Booking
  - Prevent duplicate bookings after user has booked that exact tour, implement favourite tours
- Advanced authentication features
  - Signup, confirm user email, login with refresh token, two-factor authentication
- And More ! There's always room for improvement!


## Acknowledgement

- This project is part of the online course I've taken at Udemy. Thanks to [Jonas Schmedtmann](https://twitter.com/jonasschmedtman) for creating this awesome course!
