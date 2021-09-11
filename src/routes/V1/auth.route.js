const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate');
const { auth } = require('../../middleware/auth');
const authController = require('../../controllers/auth.controller');
const authValidation = require('../../validations/auth.validation');

router.route('/super-admin').post(authController.updateCenterForSuperAdmin);

router.post('/login', validate(authValidation.login), authController.login);

router.route('/fetch-permissions/:roleid').get(auth('getUsers'), authController.fetchPermissions);

router.route('/logs').get(authController.fetchLogs);
router.route('/access-logs').get(authController.fetchAccessLogs);

router.route('/user/:id').get(authController.fetchUser);

module.exports = router;
