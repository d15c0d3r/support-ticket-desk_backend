const { PrismaClient, Prisma } = require("@prisma/client");
const { ticket } = new PrismaClient();

const ticketFinder = async (ticketId) => {
  const ticketData = await ticket.findUnique({
    where: {
      id: parseInt(ticketId),
    },
  });
  return ticketData;
};

module.exports = { ticketFinder };
