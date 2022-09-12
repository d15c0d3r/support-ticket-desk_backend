const router = require("express").Router({ mergeParams: true });
const {
  getAllTicketsByOrgIdandFilters,
  postTicketByDetails,
  updateTicketDetailsById,
  deleteTicketById,
  getTicketsForInsightsbyOrgId,
} = require("../controllers/ticketControllers");

router.get("/", getAllTicketsByOrgIdandFilters);
router.get("/insights", getTicketsForInsightsbyOrgId);
router.post("/", postTicketByDetails);
router.put("/:ticketId", updateTicketDetailsById);
router.delete("/:ticketId", deleteTicketById);

module.exports = router;
