const express = require('express');
const authenticateJWT = require('../middlewares/auth.middleware');
const groupController = require('../controllers/group.controller');


const router = express.Router();

router.post('/createGroup', authenticateJWT,groupController.createNewGroup); 
router.get('/getGroup/:groupId', authenticateJWT, groupController.getGroup); // Fetch group by ID

module.exports = router;