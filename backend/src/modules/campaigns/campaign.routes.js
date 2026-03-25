const router = require('express').Router();
const { create, listActive, getOne, update } = require('./campaign.controller');
const { validateCreate, validateUpdate } = require('./campaign.validation');
const { ensureAuthenticated } = require('../auth/auth.middleware'); 

router.post('/', ensureAuthenticated, validateCreate, create);
router.get('/', listActive);
router.get('/:id', getOne);
router.put('/:id', ensureAuthenticated, validateUpdate, update);

module.exports = router;
