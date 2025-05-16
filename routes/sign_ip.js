var express = require('express');
var router = express.Router();
import { getPassHash } from '../database'

const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

router.post('/',async function (req, res, next){
    try{

    }catch(ex){
        
    }
});