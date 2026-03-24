const router = require('express').Router();
const { create, listActive, getOne, update } = require('./campaign.controller');
const { validateCreate, validateUpdate } = require('./campaign.validation');
const authenticate = require('../../middlewares/authenticate'); 

router.post('/', authenticate, validateCreate, create);
router.get('/', listActive);
router.get('/:id', getOne);
router.put('/:id', authenticate, validateUpdate, update);

module.exports = router;
