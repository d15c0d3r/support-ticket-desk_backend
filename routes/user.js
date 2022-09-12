const router = require("express").Router({ mergeParams: true });
const { PrismaClient } = require("@prisma/client");
const { user } = new PrismaClient();

const {
  postUserByOrgIdAndEmail,
  getUsersByOrgId,
  updateUserDetailsByUserId,
  getUserByEmail,
} = require("../controllers/userControllers");

// router.get("/", getUserByEmail);
// router.get("/:orgId", getUsersByOrgId);
// router.post("/:orgId", postUserByOrgIdAndEmail);
// router.put("/:orgId/:userId", updateUserDetailsByUserId);

router.get("", getUsersByOrgId);
router.get("/by-email", getUserByEmail);
router.post("", postUserByOrgIdAndEmail);
router.put("/:userId", updateUserDetailsByUserId);

module.exports = router;
