const express = require('express');
const router = express.Router();

const authController = require('../../controllers/auth.controller');

router.route('/super-admin').post(authController.updateCenterForSuperAdmin);

router.route('/login').post(authController.login);

router.route('/fetch-permissions/:centerid/:roleid').get(authController.fetchPermissions);

router.route('/logs').get(authController.fetchLogs);
router.route('/access-logs').get(authController.fetchAccessLogs);

module.exports = router;
