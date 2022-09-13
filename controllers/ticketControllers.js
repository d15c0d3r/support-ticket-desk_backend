const { PrismaClient } = require("@prisma/client");
const { makeDocument } = require("@prisma/client/runtime");
const { user, ticket, customer } = new PrismaClient();
const { ticketFinder } = require("../controllers/helpers/find-ticket");
const { userFinder } = require("./helpers/find-user");

const getAllTicketsByOrgIdandFilters = async (req, res) => {
  const { orgId } = req.params;
  // console.log(req.query);
  try {
    const userData = await userFinder(req.body.email, orgId);
    let ticketsData;
    if (userData) {
      if (Object.keys(req.query).length === 0) {
        ticketsData = await ticket.findMany({
          where: {
            orgId: parseInt(orgId),
          },
          orderBy: {
            updatedAt: "desc",
          },
        });
        // console.log(ticketsData);
        ticketsData = ticketsData.map((ticket) => {
          const createdTimeStamp = String(ticket.createdAt).split(" ");
          const createdAt = `${createdTimeStamp[0]} ${createdTimeStamp[1]} ${createdTimeStamp[2]} ${createdTimeStamp[3]}`;
          const updatedTimeStamp = String(ticket.updatedAt).split(" ");
          const updatedAt = `${updatedTimeStamp[0]} ${updatedTimeStamp[1]} ${updatedTimeStamp[2]} ${updatedTimeStamp[3]}`;
          return {
            ...ticket,
            createdAt,
            updatedAt,
          };
        });
        return res.json(ticketsData);
      } else {
        // console.log(req.query);
        let ANDsearchList = [];
        let createdAt_filter = {};
        let ORsearchList = [];

        Object.keys(req.query).forEach((key, index) => {
          switch (key) {
            case "status":
              ANDsearchList.push({ status: req.query[key] });
              break;
            case "assigned-to":
              let assignedTo = req.query[key];
              if (assignedTo === "null")
                ANDsearchList.push({
                  ownerId: null,
                });
              else if (assignedTo === "self") {
                ANDsearchList.push({ ownerId: parseInt(userData.id) });
              } else {
                ANDsearchList.push({ ownerId: parseInt(req.query[key]) });
              }
              break;
            case "start-date":
              createdAt_filter = {
                gte: new Date(req.query[key]).toISOString(),
              };
              break;
            case "end-date":
              if (Object.keys(createdAt_filter).length !== 0) {
                createdAt_filter = {
                  ...createdAt_filter,
                  lte: new Date(req.query[key]).toISOString(),
                };
                ANDsearchList.push({ createdAt: createdAt_filter });
              }
              break;
            case "search":
              ORsearchList = [
                { title: { contains: req.query[key] } },
                { description: { contains: req.query[key] } },
              ];
              ANDsearchList.push({ OR: ORsearchList });
          }
        });
        // console.log("search List", ANDsearchList);
        ticketsData = await ticket.findMany({
          where: {
            AND: ANDsearchList,
          },
          orderBy: {
            updatedAt: "desc",
          },
        });
        ticketsData = ticketsData.map((ticket) => {
          const createdTimeStamp = String(ticket.createdAt).split(" ");
          const createdAt = `${createdTimeStamp[0]} ${createdTimeStamp[1]} ${createdTimeStamp[2]} ${createdTimeStamp[3]}`;
          const updatedTimeStamp = String(ticket.updatedAt).split(" ");
          const updatedAt = `${updatedTimeStamp[0]} ${updatedTimeStamp[1]} ${updatedTimeStamp[2]} ${updatedTimeStamp[3]}`;
          return {
            ...ticket,
            createdAt,
            updatedAt,
          };
        });
        return res.json(ticketsData);
      }
    }
  } catch (err) {
    return res.send({ error: err.message });
  }
};

const getTicketsForInsightsbyOrgId = async (req, res) => {
  const { orgId } = req.params;
  const d = new Date();
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;
  // console.log(d.getMonth());
  // console.log("get Tickets for Insights ");
  try {
    const userData = await userFinder(req.body.email, orgId);
    // console.log(userData);
    if (userData) {
      const ticketsData = await ticket.findMany({
        select: {
          status: true,
          createdAt: true,
          resolvedAt: true,
        },
        where: {
          orgId: parseInt(orgId),
        },
      });
      // console.log(ticketsData);
      let totalResolvedTickets = 0;
      let sumSLA = 0;
      const tickets = {};
      ticketsData.map((ticket) => {
        if (tickets[ticket.createdAt]) {
          tickets[ticket.createdAt] = {
            ...tickets[ticket.createdAt],
            generated: tickets[ticket.createdAt].generated + 1,
          };
        } else {
          tickets[ticket.createdAt] = { generated: 1, resolved: 0 };
        }
        if (ticket.resolvedAt) {
          totalResolvedTickets += 1;
          sumSLA +=
            (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / hour;
          if (tickets[ticket.resolvedAt]) {
            tickets[ticket.resolvedAt] = {
              ...tickets[ticket.resolvedAt],
              resolved: tickets[ticket.resolvedAt].resolved + 1,
            };
          } else {
            tickets[ticket.resolvedAt] = { generated: 0, resolved: 1 };
          }
        }
      });
      // console.log(tickets);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const dateTimes = Object.keys(tickets).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      // console.log(dateTimes);
      let ptr = -1;
      let dates = [];
      let ticketsGenerated = [];
      let ticketsResolved = [];
      dateTimes.forEach((dateTime) => {
        let key = `${new Date(dateTime).getDate()} ${
          months[new Date(dateTime).getMonth()]
        } ${new Date(dateTime).getFullYear()}`;
        if (ptr === -1 || dates[ptr] !== key) {
          dates.push(key);
          ticketsGenerated.push(tickets[dateTime].generated);
          ticketsResolved.push(tickets[dateTime].resolved);
          ptr += 1;
        } else {
          ticketsGenerated[ptr] += tickets[dateTime].generated;
          ticketsResolved[ptr] += tickets[dateTime].resolved;
        }
      });
      console.log(sumSLA, totalResolvedTickets);
      return res.json({
        tickets: { dates, ticketsGenerated, ticketsResolved },
        sla: sumSLA / totalResolvedTickets,
      });
    }
  } catch (err) {
    return res.send({ error: err.message });
  }
};

const postTicketByDetails = async (req, res) => {
  const {
    body: { ticketDetails, email, customerEmail },
    params: { orgId },
  } = req;
  // console.log(ticketDetails, email, customerEmail);
  if (customerEmail) {
    try {
      const customerData = await customer.findUnique({
        where: {
          email: customerEmail,
        },
      });
      // console.log(customerData);
      if (!customerData)
        throw new Error("no customer found with the email provided");
      else {
        const ticketData = await ticket.create({
          data: {
            customerId: parseInt(customerData.id),
            orgId: parseInt(orgId),
            title: ticketDetails.title,
            description: ticketDetails.description,
          },
        });
        console.log(ticketData);
        ticketData && res.send({ message: "ticket raised!" });
      }
    } catch (err) {
      return res.send({ error: err.message });
    }
  } else {
    const { ownerId } = ticketDetails;
    ticketDetails.customerId = parseInt(ticketDetails.customerId);
    try {
      const userData = await userFinder(email, orgId);
      ticketDetails.ownerId = !userData.isAdmin
        ? userData.id
        : ownerId !== "null"
        ? parseInt(ownerId)
        : null;
      const ticketData = await ticket.create({
        data: {
          orgId: parseInt(orgId),
          ...ticketDetails,
        },
      });
      // console.log(ticketData);
      return res.send(ticketData);
    } catch (err) {
      return res.send({ error: err.message });
    }
  }
};

const updateTicketDetailsById = async (req, res) => {
  const {
    body: { ticketDetails, email },
    params: { orgId, ticketId },
  } = req;
  // console.log(ticketDetails);
  ticketDetails.customerId &&
    (ticketDetails.customerId = parseInt(ticketDetails.customerId));
  ticketDetails.ownerId &&
    (ticketDetails.ownerId = parseInt(ticketDetails.ownerId));
  try {
    if (ticketDetails.orgId) {
      throw new Error("-_- Can't be done!");
    }
    const userData = await userFinder(email, orgId);
    // console.log(userData);
    let updatedTicketDetails;
    if (userData.isAdmin) {
      // console.log(userData.isAdmin);
      if (ticketDetails.status === "CLOSE") {
        ticketDetails.resolvedAt = new Date();
      } else if (ticketDetails.status === "OPEN") {
        ticketDetails.resolvedAt = null;
      }
      // console.log(ticketDetails.resolvedAt);
      updatedTicketDetails = await ticket.update({
        where: {
          id: parseInt(ticketId),
        },
        data: {
          ...ticketDetails,
        },
      });
      // console.log(updatedTicketDetails);
    } else {
      if (ticketDetails.ownerId) throw new Error("-_- Can't be done!");
      const ticketData = await ticket.findUnique({
        where: {
          id: parseInt(ticketId),
        },
      });
      if (ticketData.ownerId !== userData.id)
        throw new Error("-_- Can't be done!");
      if (ticketDetails.status === "CLOSE") {
        ticketDetails.resolvedAt = new Date();
      } else if (ticketDetails.status === "OPEN") {
        ticketDetails.resolvedAt = null;
      }
      updatedTicketDetails = await ticket.update({
        where: {
          id: parseInt(ticketId),
        },
        data: {
          ...ticketDetails,
        },
      });
      // console.log(updatedTicketDetails);
    }
    return res.json({
      message: "ticket details updated!",
      ticket: updatedTicketDetails,
    });
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
};

const deleteTicketById = async (req, res) => {
  const {
    body: { email },
    params: { orgId, ticketId },
  } = req;
  try {
    const userData = await userFinder(email, orgId);
    const ticketData = await ticketFinder(ticketId);
    // console.log(userData, ticketData);
    let deletedTicketDetails;
    if (
      userData.isAdmin ||
      parseInt(ticketData.ownerId) === parseInt(userData.id)
    ) {
      const deletedTicketDetails = await ticket.delete({
        where: {
          id: parseInt(ticketId),
        },
      });
      return res.status(200).send({ message: "ticket deleted!" });
    } else throw new Error("-_- Can't be done!");
  } catch (err) {
    return res.send({ error: err.message });
  }
};

module.exports = {
  getAllTicketsByOrgIdandFilters,
  postTicketByDetails,
  updateTicketDetailsById,
  deleteTicketById,
  getTicketsForInsightsbyOrgId,
};
