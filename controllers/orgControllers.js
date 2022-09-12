const { PrismaClient } = require("@prisma/client");
const { organization, user } = new PrismaClient();

const getOrgByUserEmail = async (req, res) => {
  const {
    body: { email },
  } = req;
  try {
    const orgDetails = await user.findUnique({
      select: { organization: true },
      where: { email },
    });
    if (!orgDetails) {
      // console.log(orgDetails);
      return res.status(307).send({ message: "user not found in any org" });
    }
    return res.json(orgDetails);
  } catch (err) {
    res.send({ error: err.message });
  }
};

const getOrgById = async (req, res) => {
  const {
    params: { orgId },
  } = req;
  console.log("in org controllers, getOrgById", orgId);
  try {
    const orgDetails = await organization.findUnique({
      where: {
        id: parseInt(orgId),
      },
    });
    if (orgDetails) {
      return res.json(orgDetails);
    }
    throw new Error("org not found!");
  } catch (err) {
    return res.send({ error: err.message });
  }
};

const postOrgAndAdminUserByOrgDetailsAndUserDetails = async (req, res) => {
  const { body } = req;
  // console.log("post req", body);
  const adminDetails = {
    name: body.name,
    email: body.email,
    isAdmin: true,
    tickets: {},
  };
  try {
    const data = await organization.create({
      data: {
        name: body.organizationName,
        users: {
          create: {
            ...adminDetails,
          },
        },
        customer: {},
      },
    });
    // console.log(data);
    return res.json(data);
  } catch (err) {
    return res.send({ error: err.message });
  }
};

module.exports = {
  getOrgByUserEmail,
  postOrgAndAdminUserByOrgDetailsAndUserDetails,
  getOrgById,
};
