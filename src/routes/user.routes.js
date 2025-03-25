import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { changeandupdateVolunteerPassword, forgotVolunteerPassword, loginVolunteer, logoutVolunteer, registerVolunteer, updateFullNameVolunteer, updatevolunteername } from "../controllers/volunteer.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { changeandupdatePasswordNGO, forgotPasswordNGO, loginNGO, logoutNGO, registerNGO, updateFullNameNGO, updateUniqueIdentificationNumbe } from "../controllers/ngo.js";
import { reportAbuse, updateStatusofComplaint, viewAbusestoNGO, viewAbusestoVolunteer, viewAbusesUnderAttentionOfNGO } from "../controllers/abuse.controller.js";

const router = Router();

router.route("/registervolunteer").post(
    upload.single('profileImage'), 
    (req, res, next) => {
        if (!req.file || req.file==undefined) {
            return next(new ApiError(400, "Upload image correctly")); // Pass error to error handler
        }

        console.log(req.file);
        next(); // Proceed to registerVolunteer
    },
    registerVolunteer
);

router.route("/loginVolunteer").post(loginVolunteer)
router.route("/logoutVolunteer").post(verifyJWT,logoutVolunteer)
router.route("/updateVolunteerUserName").patch(verifyJWT,updatevolunteername)
router.route("/forgotpasswordVolunteer").post(forgotVolunteerPassword)
router.route("/setnewpassowrdVolunteer").patch(changeandupdateVolunteerPassword)
router.route("/updaeVolunteerFullName").patch(verifyJWT,updateFullNameVolunteer)

router.route("/registerNGO").post(
    upload.single('profileImage'), 
    (req, res, next) => {
        if (!req.file || req.file==undefined) {
            return next(new ApiError(400, "Upload image correctly")); // Pass error to error handler
        }

        console.log(req.file);
        next(); // Proceed to registerVolunteer
    },
    registerNGO
);

router.route("/loginNGO").post(loginNGO)
router.route("/logoutNGO").post(verifyJWT,logoutNGO)
router.route("/updateNGOName").patch(verifyJWT,updateFullNameNGO)
router.route("/forgotpasswordNGO").post(forgotPasswordNGO)
router.route("/setnewpassowrdNGO").patch(changeandupdatePasswordNGO)
router.route("/updateUniqueIdentificationNumber").patch(verifyJWT,updateUniqueIdentificationNumbe)

router.route("/reportAbuse").post(
    upload.single('Abuse_photoORvedio'), 
    (req, res, next) => {
        if (!req.file || req.file==undefined) {
            return next(new ApiError(400, "Upload image correctly")); // Pass error to error handler
        }

        console.log(req.file);
        next(); // Proceed to registerVolunteer
    },
    reportAbuse
);

router.post("/viewAbusesUnderAttentionOfNGO").post(verifyJWT,viewAbusesUnderAttentionOfNGO)
router.post("/viewAbusestoNGO").post(verifyJWT,viewAbusestoNGO)
router.post("/updateStatusofComplaint").post(verifyJWT,updateStatusofComplaint)
router.post("/viewAbusestoVolunteer").post(verifyJWT,viewAbusestoVolunteer)
export default router;
