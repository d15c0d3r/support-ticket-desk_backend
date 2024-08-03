const router = require("express").Router();

router.get("", (req, res) => {
  return res.status(200).send("YOLO");
});

module.exports = router;
