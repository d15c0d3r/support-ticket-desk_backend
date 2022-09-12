const { PrismaClient, Prisma } = require("@prisma/client");
const { user, organization } = new PrismaClient();

const userFinder = async (email, orgId) => {
  const userData = await user.findUnique({
    where: {
      email_orgId: {
        orgId: parseInt(orgId),
        email,
      },
    },
  });
  return userData;
};

module.exports = { userFinder };
