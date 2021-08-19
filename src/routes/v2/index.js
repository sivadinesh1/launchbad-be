const express = require('express');
const config = require('../../config/config');
const userV2 = require('./userv2.route');




const router = express.Router();

const defaultRoutes = [
  {
    path: '/userv2',
    route: userV2,
  }
];



defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});


module.exports = router;
