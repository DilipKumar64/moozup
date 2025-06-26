const express = require('express');
const authenticateJWT = require('../../middlewares/auth.middleware');
const groupController = require('../controllers/group.controller');


const router = express.Router();

router.post('/createGroup', authenticateJWT,groupController.createNewGroup); 
router.get('/getGroup/:groupId', authenticateJWT, groupController.getGroupById); // Fetch group by ID
router.get('/getAllGroups', authenticateJWT, groupController.getAllGroups); // Fetch all groups
router.delete("/deleteGroup/:groupId", groupController.deleteGroup);


module.exports = router;