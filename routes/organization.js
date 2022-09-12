const router = require("express").Router({ mergeParams: true });
const {
  getOrgByUserEmail,
  getOrgById,
  postOrgAndAdminUserByOrgDetailsAndUserDetails,
} = require("../controllers/orgControllers");

router.get("", getOrgByUserEmail);
router.get("/:orgId", getOrgById);
router.post("", postOrgAndAdminUserByOrgDetailsAndUserDetails);

module.exports = router;
