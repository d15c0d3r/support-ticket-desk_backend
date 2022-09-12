const { PrismaClient } = require("@prisma/client");
const { userFinder } = require("./helpers/find-user");
const { customer } = new PrismaClient();

const getCustomersByOrgId = async (req, res) => {
  const {
    body: { email },
    params: { orgId },
  } = req;
  try {
    const userData = await userFinder(email, orgId);
    if (userData) {
      const customersData = await customer.findMany({
        where: {
          orgId: parseInt(orgId),
        },
      });
      // console.log(customersData);
      return res.json(customersData);
    }
    return res.send({ message: "user not found!" });
  } catch (err) {
    return res.send({ message: err.message });
  }
};

module.exports = { getCustomersByOrgId };
