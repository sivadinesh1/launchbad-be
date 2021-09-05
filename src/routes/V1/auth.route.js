const express = require('express');
const router = express.Router();

const validate = require('../../middleware/validate');

const authController = require('../../controllers/auth.controller');
const authValidation = require('../../validations/auth.validation');

router.route('/super-admin').post(authController.updateCenterForSuperAdmin);

router.post('/login', validate(authValidation.login), authController.login);

router.route('/fetch-permissions/:centerid/:roleid').get(authController.fetchPermissions);

router.route('/logs').get(authController.fetchLogs);
router.route('/access-logs').get(authController.fetchAccessLogs);

module.exports = router;
