const router = require("express").Router({ mergeParams: true });
const { PrismaClient } = require("@prisma/client");

const { getCustomersByOrgId } = require("../controllers/customerControllers");

router.get("/", getCustomersByOrgId);

module.exports = router;
