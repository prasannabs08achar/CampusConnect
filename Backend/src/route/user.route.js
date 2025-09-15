import {Router} from "express"

import { getMe, updateProfile, searchUsers } from "../controller/user.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
const router=Router()

router.route("/getme").get(verifyJWT, getMe)

router.route("/update").put(verifyJWT,  updateProfile)
router.route("/search").get(verifyJWT,searchUsers)

export default router;