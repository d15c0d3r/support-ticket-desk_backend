const { PrismaClient, Prisma } = require("@prisma/client");
const { user, organization } = new PrismaClient();
const { userFinder } = require("./helpers/find-user");
const sgMail = require("@sendgrid/mail");

const getUserByEmail = async (req, res) => {
  console.log("Iam being called, get User by Email");
  const {
    body: { email },
  } = req;
  try {
    const userData = await user.findUnique({
      where: {
        email,
      },
    });
    // console.log(userData);
    res.json(userData);
  } catch (err) {
    res.send({ message: err.message });
  }
};

const getUsersByOrgId = async (req, res) => {
  console.log("get All Users by OrgId being called");

  const {
    params: { orgId },
  } = req;
  console.log(req.params);
  try {
    const { users } = await organization.findUnique({
      select: {
        users: true,
      },
      where: {
        id: parseInt(orgId),
      },
    });
    console.log(users);
    res.status(200).json(users);
  } catch (err) {
    res.send({ error: err.message });
  }
};

const postUserByOrgIdAndEmail = async (req, res) => {
  const {
    body,
    params: { orgId },
  } = req;
  console.log(body.userEmail, body.userName);
  try {
    const userData = await userFinder(body.email, orgId);
    if (!userData.isAdmin)
      throw new Error("-_- can't be done because you aren't admin");

    const userDetails = await user.create({
      data: {
        email: body.userEmail,
        name: body.userName,
        orgId: parseInt(orgId),
      },
    });
    if (userDetails) {
      console.log(userDetails);
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: userDetails.email, // Change to your recipient
        from: "naga@beautifulcode.in", // Change to your verified sender
        subject: "User Added : Intimation",
        text: "You have been added to Support Ticket Desk, Please login to the app with the same email",
        // html: "<strong>and easy to do anywhere, even with Node.js</strong>",
      };
      sgMail
        .send(msg)
        .then((result) => {
          console.log(result);
          return res.send({ message: "user created!" });
        })
        .catch((error) => {
          console.log(error.message);
          throw new Error(error.message);
        });
    } else throw new Error("Error creating user with provided email & name");
  } catch (err) {
    return res.send({ error: err.message });
  }
};

const updateUserDetailsByUserId = async (req, res) => {
  const {
    body,
    params: { orgId, userId },
  } = req;

  console.log(body.email, body.userName, orgId, userId);
  try {
    const userData = await userFinder(body.email, orgId);
    console.log(userData);
    if (userData.isAdmin) {
      const updatedUserDetails = await user.update({
        where: {
          id_orgId: {
            id: parseInt(userId),
            orgId: parseInt(orgId),
          },
        },
        data: {
          name: body.userName,
        },
      });
      if (updatedUserDetails) {
        res.send({
          updatedUserDetails,
        });
      }
    } else {
      throw new Error("you aren't admin -_-");
    }
  } catch (err) {
    return res.send({ error: err.message });
  }
};

module.exports = {
  postUserByOrgIdAndEmail,
  getUsersByOrgId,
  getUserByEmail,
  updateUserDetailsByUserId,
};
