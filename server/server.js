const express = require("express");
const cors = require("cors");
const KnowledgeArticle = require("./models/KnowledgeArticle");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const { OpenAI } = require("openai");
const IT_KEYWORDS = require("./data/itKeywords");
const multer = require("multer");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } =
  require("express-validator");

const Ticket = require("./models/Ticket");
const User = require("./models/User");

const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");

const http = require("http");
const { Server } = require("socket.io");

const {
  redisClient,
  connectRedis,
} = require("./redisClient");

dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, "uploads")
    );
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${file.originalname}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "application/pdf",
      "text/plain",
      "application/zip",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file type"
        )
      );
    }
  },
});

const app = express();

app.use(helmet());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Argos System API running",
  });
});


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 200,

  message: {
    error:
      "Too many requests. Please try again later.",
  },
});

app.use(limiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://argos-system-alpha.vercel.app",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("agent-online", (user) => {
    io.emit("agent-online", user);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const createActivity = (type, message) => ({
  type,
  message,
  createdAt: new Date(),
});

const formatTicket = (ticket) => ({
  id: ticket.ticketId,
  title: ticket.title,
  category: ticket.category,
  priority: ticket.priority,
  status: ticket.status,
  assignedTo: ticket.assignedTo,
  likelyCause: ticket.likelyCause,
  slaDueAt: ticket.slaDueAt,

  comments: ticket.comments.map((comment) => ({
    id: comment._id,
    text: comment.text,
    author: comment.author,
    createdAt: comment.createdAt,
  })),

  activities: ticket.activities.map((activity) => ({
    id: activity._id,
    type: activity.type,
    message: activity.message,
    createdAt: activity.createdAt,
  })),

  attachments: ticket.attachments || [],
});

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


app.post(
  "/api/auth/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({
        email,
      });

      if (existingUser) {
        return res.status(400).json({
          error: "User already exists",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "agent",
      });

      const token = createToken(user);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to register user",
      });
    }
  });

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to login",
    });
  }
});

app.patch(
  "/api/auth/update-email",
  authMiddleware,
  async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    try {
      const existingUser = await User.findOne({
        email,
      });

      if (
        existingUser &&
        existingUser._id.toString() !== req.user.id
      ) {
        return res.status(400).json({
          error: "Email already in use",
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      user.email = email;

      await user.save();

      const token = createToken(user);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to update email",
      });
    }
  }
);

app.patch(
  "/api/auth/update-password",
  authMiddleware,
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current and new password are required",
      });
    }

    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Current password is incorrect",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);

      await user.save();

      res.json({
        message: "Password updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to update password",
      });
    }
  }
);

app.post("/api/admin/create-admin", async (req, res) => {
  try {
    const existingAdmin = await User.findOne({
      email: "admin@argos.com",
    });

    if (existingAdmin) {
      return res.json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@argos.com",
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create admin",
    });
  }
});

app.get(
  "/api/knowledge",
  authMiddleware,
  async (req, res) => {
    try {
      const search = req.query.search || "";

      const query = search
        ? {
          $or: [
            {
              title: {
                $regex: search,
                $options: "i",
              },
            },
            {
              content: {
                $regex: search,
                $options: "i",
              },
            },
            {
              tags: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
        : {};

      const articles =
        await KnowledgeArticle.find(query).sort({
          createdAt: -1,
        });

      res.json(articles);
    } catch (error) {
      res.status(500).json({
        error: "Failed to load knowledge articles",
      });
    }
  }
);

app.post(
  "/api/knowledge",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        content,
        category,
        tags,
      } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          error: "Title and content are required",
        });
      }

      const article =
        await KnowledgeArticle.create({
          title,
          content,
          category,
          tags,
          createdBy: req.user.email,
        });

      res.status(201).json(article);
    } catch (error) {
      res.status(500).json({
        error: "Failed to create knowledge article",
      });
    }
  }
);

app.delete(
  "/api/knowledge/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const article =
        await KnowledgeArticle.findById(
          req.params.id
        );

      if (!article) {
        return res.status(404).json({
          error: "Article not found",
        });
      }

      await KnowledgeArticle.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Article deleted successfully",
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Failed to delete article",
      });

    }
  }
);

app.get(
  "/api/tickets/:id/suggested-articles",
  authMiddleware,
  async (req, res) => {
    try {
      const ticket = await Ticket.findOne({
        ticketId: req.params.id,
      });

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
        });
      }

      const searchTerms = [
        ticket.title,
        ticket.category,
        ticket.likelyCause,
        ticket.priority,
      ].filter(Boolean);

      const articles =
        await KnowledgeArticle.find({
          $or: [
            {
              title: {
                $regex: searchTerms.join("|"),
                $options: "i",
              },
            },
            {
              content: {
                $regex: searchTerms.join("|"),
                $options: "i",
              },
            },
            {
              tags: {
                $in: searchTerms,
              },
            },
          ],
        }).limit(5);

      res.json(articles);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error: "Failed to suggest articles",
      });

    }
  }
);

app.get(
  "/api/admin/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.find().select("-password");

      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: "Failed to load users",
      });
    }
  }
);

app.patch(
  "/api/admin/users/:id/role",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const { role } = req.body;

    const allowedRoles = ["admin", "agent"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
      });
    }

    try {
      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      app.delete(
        "/api/admin/users/:id",
        authMiddleware,
        adminMiddleware,
        async (req, res) => {
          try {
            if (req.params.id === req.user.id) {
              return res.status(400).json({
                error: "You cannot delete your own account",
              });
            }

            const user = await User.findById(req.params.id);

            if (!user) {
              return res.status(404).json({
                error: "User not found",
              });
            }

            await User.deleteOne({
              _id: req.params.id,
            });

            res.json({
              message: "User deleted successfully",
            });
          } catch (error) {
            res.status(500).json({
              error: "Failed to delete user",
            });
          }
        }
      );

      user.role = role;

      await user.save();

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to update user role",
      });
    }
  }
);


app.get(
  "/api/tickets",
  authMiddleware,
  async (req, res) => {
    try {
      const tickets = await Ticket.find().sort({
        createdAt: -1,
      });

      res.json(tickets.map(formatTicket));
    } catch (error) {
      res.status(500).json({
        error: "Failed to load tickets",
      });
    }
  }
);

app.get(
  "/api/tickets/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const ticket = await Ticket.findOne({
        ticketId: req.params.id,
      });

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
        });
      }

      res.json(formatTicket(ticket));
    } catch (error) {
      res.status(500).json({
        error: "Failed to load ticket",
      });
    }
  }
);

app.post(
  "/api/tickets",
  authMiddleware,
  async (req, res) => {
    try {
      const ticket = req.body;

      const newTicket = await Ticket.create({
        ticketId: `SD-${Date.now()}`,
        title: ticket.title,
        category: ticket.category,
        priority: ticket.priority,
        status: "Open",
        assignedTo: "Unassigned",
        likelyCause: ticket.likelyCause,
        slaDueAt: new Date(Date.now() + 1000 * 60 * 60 * 8),
        comments: [],
        activities: [
          createActivity("created", "Ticket created"),
        ],
      });

      const formattedTicket =
        formatTicket(newTicket);

      io.emit(
        "ticket-created",
        formattedTicket
      );

      io.emit("dashboard-refresh");

      res.status(201).json(
        formattedTicket
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to create ticket",
      });
    }
  }
);

app.patch(
  "/api/tickets/:id/assign",
  authMiddleware,
  async (req, res) => {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        error: "assignedTo is required",
      });
    }

    try {
      const ticket = await Ticket.findOne({
        ticketId: req.params.id,
      });

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
        });
      }

      ticket.assignedTo = assignedTo;

      ticket.activities.push(
        createActivity(
          "assignment",
          `Ticket assigned to ${assignedTo}`
        )
      );

      await ticket.save();

      const formattedTicket =
        formatTicket(ticket);

      io.emit(
        "ticket-updated",
        formattedTicket
      );

      io.emit("notification-created");

      res.json(formattedTicket);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to assign ticket",
      });
    }
  }
);

app.patch(
  "/api/tickets/:id/status",
  authMiddleware,
  async (req, res) => {
    const { status } = req.body;

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    try {
      const ticket = await Ticket.findOne({
        ticketId: req.params.id,
      });

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
        });
      }

      ticket.status = status;

      ticket.activities.push(
        createActivity(
          "status",
          `Status changed to ${status}`
        )
      );

      await ticket.save();

      const formattedTicket =
        formatTicket(ticket);

      io.emit(
        "ticket-updated",
        formattedTicket
      );

      io.emit("dashboard-refresh");

      res.json(formattedTicket);
    } catch (error) {
      res.status(500).json({
        error: "Failed to update status",
      });
    }
  }
);

app.post(
  "/api/tickets/:id/attachments",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {

    try {

      const ticket = await Ticket.findOne({
        ticketId: req.params.id,
      });

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "File is required",
        });
      }

      const fileData = {
        filename: req.file.filename,
        originalName:
          req.file.originalname,
        mimetype:
          req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        uploadedAt: new Date(),
      };

      if (!ticket.attachments) {
        ticket.attachments = [];
      }

      ticket.attachments.push(fileData);

      ticket.activities.push(
        createActivity(
          "attachment",
          `File uploaded: ${req.file.originalname}`
        )
      );

      await ticket.save();

      io.emit(
        "ticket-updated",
        formatTicket(ticket)
      );

      res.status(201).json({
        message:
          "File uploaded successfully",
        attachment: fileData,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error: "Failed to upload file",
      });

    }

  }
);

app.post(
  "/api/tickets/:id/comments",
  authMiddleware,
  async (req, res) => {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Comment text is required",
      });
    }

    try {
      const ticket = await Ticket.findOne({
        ticketId: req.params.id,
      });

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
        });
      }

      ticket.comments.push({
        text,
        author: "Support Agent",
        createdAt: new Date(),
      });

      ticket.activities.push(
        createActivity(
          "comment",
          "Comment added by Support Agent"
        )
      );

      await ticket.save();

      res.status(201).json({
        ticket: formatTicket(ticket),
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to add comment",
      });
    }
  }
);

app.delete(
  "/api/tickets/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const ticket = await Ticket.findOne({
        ticketId: req.params.id,
      });

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
        });
      }

      await Ticket.deleteOne({
        ticketId: req.params.id,
      });

      res.json({
        message: "Ticket deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete ticket",
      });
    }
  }
);

app.get(
  "/api/stats",
  authMiddleware,
  async (req, res) => {
    try {

      const tickets = await Ticket.find();

      const stats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(
          (ticket) => ticket.status === "Open"
        ).length,
        inProgressTickets: tickets.filter(
          (ticket) => ticket.status === "In Progress"
        ).length,
        resolvedTickets: tickets.filter(
          (ticket) => ticket.status === "Resolved"
        ).length,
        highPriorityTickets: tickets.filter(
          (ticket) =>
            ticket.priority === "High" ||
            ticket.priority === "Critical"
        ).length,
      };

      res.json(stats);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to load stats",
      });
    }
  }
);

app.get(
  "/api/notifications",
  authMiddleware,
  async (req, res) => {
    try {
      const tickets = await Ticket.find();

      const notifications = [];

      tickets.forEach((ticket) => {

        if (
          !ticket.assignedTo ||
          ticket.assignedTo === "Unassigned"
        ) {
          notifications.push({
            type: "warning",
            title: "Unassigned Ticket",
            message: `${ticket.ticketId} has no assigned agent.`,
            ticketId: ticket.ticketId,
            createdAt: ticket.createdAt,
          });
        }

        if (
          ticket.priority === "Critical"
        ) {
          notifications.push({
            type: "critical",
            title: "Critical Incident",
            message: `${ticket.ticketId} is marked as critical priority.`,
            ticketId: ticket.ticketId,
            createdAt: ticket.createdAt,
          });
        }

        const now = new Date();

        if (
          ticket.status !== "Resolved" &&
          new Date(ticket.slaDueAt) < now
        ) {
          notifications.push({
            type: "sla",
            title: "SLA Overdue",
            message: `${ticket.ticketId} exceeded SLA deadline.`,
            ticketId: ticket.ticketId,
            createdAt: ticket.slaDueAt,
          });
        }

      });

      res.json(notifications);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to load notifications",
      });
    }
  }
);

app.get(
  "/api/audit-logs",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const tickets = await Ticket.find().sort({
        updatedAt: -1,
      });

      const logs = [];

      tickets.forEach((ticket) => {

        ticket.activities.forEach((activity) => {

          logs.push({
            ticketId: ticket.ticketId,
            title: ticket.title,
            type: activity.type,
            message: activity.message,
            createdAt: activity.createdAt,
          });

        });

      });

      logs.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

      res.json(logs);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to load audit logs",
      });
    }
  }
);

app.get(
  "/api/export/tickets/csv",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const tickets = await Ticket.find().sort({
        createdAt: -1,
      });

      const data = tickets.map((ticket) => ({

        Ticket_ID:
          ticket.ticketId || "N/A",

        Title:
          ticket.title || "Untitled",

        Category:
          ticket.category || "N/A",

        Priority:
          ticket.priority || "N/A",

        Status:
          ticket.status || "N/A",

        Assigned_To:
          ticket.assignedTo || "Unassigned",

        Likely_Cause:
          ticket.likelyCause || "N/A",

        SLA_Due_At:
          ticket.slaDueAt
            ? new Date(
              ticket.slaDueAt
            ).toLocaleString()
            : "N/A",

        Created_At:
          ticket.createdAt
            ? new Date(
              ticket.createdAt
            ).toLocaleString()
            : "N/A",

        Updated_At:
          ticket.updatedAt
            ? new Date(
              ticket.updatedAt
            ).toLocaleString()
            : "N/A",

      }));

      const fields = [
        "Ticket_ID",
        "Title",
        "Category",
        "Priority",
        "Status",
        "Assigned_To",
        "Likely_Cause",
        "SLA_Due_At",
        "Created_At",
        "Updated_At",
      ];

      const parser = new Parser({
        fields,
      });

      const csv = parser.parse(data);

      res.header(
        "Content-Type",
        "text/csv"
      );

      res.attachment(
        "argos-enterprise-ticket-report.csv"
      );

      res.send(csv);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to export tickets CSV",
      });
    }
  }
);

app.get(
  "/api/export/tickets/pdf",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const tickets = await Ticket.find().sort({
        createdAt: -1,
      });

      const totalTickets = tickets.length;
      const openTickets = tickets.filter(
        (ticket) => ticket.status === "Open"
      ).length;
      const inProgressTickets = tickets.filter(
        (ticket) => ticket.status === "In Progress"
      ).length;
      const resolvedTickets = tickets.filter(
        (ticket) => ticket.status === "Resolved"
      ).length;
      const criticalTickets = tickets.filter(
        (ticket) => ticket.priority === "Critical"
      ).length;
      const highTickets = tickets.filter(
        (ticket) => ticket.priority === "High"
      ).length;

      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=argos-ticket-report.pdf"
      );

      doc.pipe(res);

      const purple = "#6d28d9";
      const dark = "#111827";
      const gray = "#6b7280";
      const border = "#d8dee9";

      const pageWidth = doc.page.width;
      const contentX = 55;
      const contentWidth = pageWidth - 110;

      doc
        .fontSize(34)
        .fillColor(purple)
        .text("ARGOS SYSTEM", 0, 35, {
          align: "center",
        });

      doc
        .fontSize(20)
        .fillColor(dark)
        .text("Enterprise Incident Report", 0, 82, {
          align: "center",
        });

      doc
        .fontSize(11)
        .fillColor(gray)
        .text(`Generated: ${new Date().toLocaleString()}`, 0, 115, {
          align: "center",
        });

      doc
        .moveTo(contentX, 150)
        .lineTo(contentX + contentWidth, 150)
        .strokeColor(purple)
        .lineWidth(1.5)
        .stroke();

      const summaryY = 180;

      doc
        .roundedRect(contentX, summaryY, contentWidth, 170, 10)
        .fillAndStroke("#fbfdff", border);

      doc
        .fontSize(18)
        .fillColor(purple)
        .text("Executive Summary", contentX, summaryY + 22, {
          width: contentWidth,
          align: "center",
        });

      const leftX = contentX + 65;
      const rightX = contentX + 320;

      doc.fontSize(12).fillColor(dark);

      doc.text(`Total Tickets: ${totalTickets}`, leftX, summaryY + 70);
      doc.text(`Open Tickets: ${openTickets}`, leftX, summaryY + 105);
      doc.text(
        `In Progress Tickets: ${inProgressTickets}`,
        leftX,
        summaryY + 140
      );

      doc.text(`Resolved Tickets: ${resolvedTickets}`, rightX, summaryY + 70);
      doc.text(`High Priority: ${highTickets}`, rightX, summaryY + 105);
      doc.text(
        `Critical Incidents: ${criticalTickets}`,
        rightX,
        summaryY + 140
      );

      const sectionY = 395;

      doc
        .moveTo(contentX, sectionY + 13)
        .lineTo(contentX + 170, sectionY + 13)
        .strokeColor(purple)
        .lineWidth(1)
        .stroke();

      doc
        .moveTo(contentX + contentWidth - 170, sectionY + 13)
        .lineTo(contentX + contentWidth, sectionY + 13)
        .strokeColor(purple)
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(18)
        .fillColor(purple)
        .text("Incident Details", contentX, sectionY, {
          width: contentWidth,
          align: "center",
        });

      let y = sectionY + 55;

      tickets.forEach((ticket) => {
        if (y > 650) {
          doc.addPage();
          y = 60;
        }

        doc
          .roundedRect(contentX, y, contentWidth, 150, 8)
          .fillAndStroke("#ffffff", border);

        doc
          .fontSize(15)
          .fillColor(dark)
          .text(
            `${ticket.ticketId} - ${ticket.title || "Untitled"}`,
            contentX + 18,
            y + 18,
            {
              width: contentWidth - 36,
            }
          );

        doc.fontSize(11).fillColor(dark);

        doc.text(
          `Category: ${ticket.category || "N/A"}`,
          contentX + 18,
          y + 55
        );

        doc.text(
          `Priority: ${ticket.priority || "N/A"}`,
          contentX + 230,
          y + 55
        );

        doc.text(
          `Status: ${ticket.status || "N/A"}`,
          contentX + 410,
          y + 55
        );

        doc.text(
          `Assigned To: ${ticket.assignedTo || "Unassigned"}`,
          contentX + 18,
          y + 80
        );

        doc.text(
          `Likely Cause: ${ticket.likelyCause || "N/A"}`,
          contentX + 18,
          y + 105,
          {
            width: contentWidth - 36,
          }
        );

        doc.text(
          `Created: ${new Date(ticket.createdAt).toLocaleString()}`,
          contentX + 18,
          y + 130
        );

        y += 175;
      });

      doc
        .moveTo(contentX, 770)
        .lineTo(contentX + contentWidth, 770)
        .strokeColor(purple)
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(10)
        .fillColor(gray)
        .text(
          "Argos System • AI-powered Enterprise ITSM Platform",
          0,
          785,
          {
            align: "center",
          }
        );

      doc.end();
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to export PDF",
      });
    }
  }
);
app.post(
  "/api/chat",
  authMiddleware,
  async (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required.",
      });
    }

    const normalizedMessage =
      message.toLowerCase();

    const isITRequest =
      IT_KEYWORDS.some((keyword) =>
        normalizedMessage.includes(
          keyword.toLowerCase()
        )
      ) ||
      normalizedMessage.split(" ").length >= 3;

    if (!isITRequest) {
      return res.json({
        reply: JSON.stringify({
          title: "Unsupported Request",
          category: "Other",
          priority: "Low",
          likelyCause:
            "Non-IT request detected",
          troubleshootingSteps: [
            "Only IT support related requests are allowed.",
          ],
          manualTestCases: [
            "Rejected non-IT request",
          ],
          recommendedResolution:
            "Please submit an IT related incident.",
          allowed: false,
        }),
      });
    }

    if (!isITRequest) {
      return res.json({
        reply: JSON.stringify({
          title: "Unsupported Request",
          category: "Other",
          priority: "Low",
          likelyCause:
            "Non-IT request detected",
          troubleshootingSteps: [
            "Only IT support related requests are allowed.",
          ],
          manualTestCases: [
            "Rejected non-IT request",
          ],
          recommendedResolution:
            "Please submit an IT related incident.",
          allowed: false,
        }),
      });
    }

    try {
      const response =
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are Argos AI, an enterprise IT support assistant. Only handle IT support incidents. Automatically detect the language of the user's message. If the user writes in Hungarian, return ALL fields in Hungarian. If the user writes in English, return ALL fields in English. Never ask the user which language should be used. Never mix languages. Return valid JSON only. Do not use markdown. Allowed IT topics: VPN, network, servers, databases, cybersecurity, ransomware, DDoS, data leak, login issues, email issues, printer issues, Microsoft 365, Windows, Linux, firewalls, Active Directory, cloud systems and endpoint issues. Priority rules: Critical for ransomware, cyber attack, security breach, DDoS, data leak or production outage. High for VPN outage, server issue, network outage, database issue or infrastructure issue. Medium for login issue, email issue, printer issue or application bug. Low for minor UI issue, cosmetic problem or information request. For valid IT requests return exactly this JSON shape: {\"title\":\"\",\"category\":\"\",\"priority\":\"Low | Medium | High | Critical\",\"likelyCause\":\"\",\"troubleshootingSteps\":[\"\"],\"manualTestCases\":[\"\"],\"recommendedResolution\":\"\",\"allowed\":true}.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        });

      res.json({
        reply: response.choices[0].message.content,
      });
    } catch (error) {
      console.error("OpenAI error:", error.message);

      res.status(500).json({
        error:
          "Something went wrong with OpenAI request.",
      });
    }
  }
);

app.post(
  "/api/tests/run",
  authMiddleware,
  async (req, res) => {
    const results = [];

    const addResult = (name, passed, details, duration) => {
      results.push({
        name,
        passed,
        details,
        duration,
      });
    };

    try {
      const mongoStart = Date.now();

      await mongoose.connection.db.admin().ping();

      addResult(
        "MongoDB Connection",
        true,
        "MongoDB responded successfully.",
        Date.now() - mongoStart
      );
    } catch (error) {
      addResult(
        "MongoDB Connection",
        false,
        error.message,
        0
      );
    }

    try {
      const authStart = Date.now();

      const user = await User.findById(req.user.id);

      if (!user) {
        throw new Error("Authenticated user not found.");
      }

      addResult(
        "JWT Authentication",
        true,
        `Authenticated as ${user.email}`,
        Date.now() - authStart
      );
    } catch (error) {
      addResult(
        "JWT Authentication",
        false,
        error.message,
        0
      );
    }

    try {
      const ticketStart = Date.now();

      const testTicket = await Ticket.create({
        ticketId: `TEST-${Date.now()}`,
        title: "Automated Test Ticket",
        category: "QA",
        priority: "Low",
        status: "Open",
        assignedTo: "QA Bot",
        likelyCause: "Automated integration test",
        slaDueAt: new Date(),
        comments: [],
        activities: [
          createActivity(
            "created",
            "Automated test ticket created"
          ),
        ],
      });

      addResult(
        "Ticket Creation",
        true,
        `Created ${testTicket.ticketId}`,
        Date.now() - ticketStart
      );

      const updateStart = Date.now();

      testTicket.status = "In Progress";
      testTicket.assignedTo = "QA Agent";

      await testTicket.save();

      addResult(
        "Ticket Update",
        true,
        "Ticket status and assignee updated successfully.",
        Date.now() - updateStart
      );

      const deleteStart = Date.now();

      await Ticket.deleteOne({
        _id: testTicket._id,
      });

      addResult(
        "Ticket Cleanup",
        true,
        "Temporary test ticket deleted.",
        Date.now() - deleteStart
      );
    } catch (error) {
      addResult(
        "Ticket Workflow",
        false,
        error.message,
        0
      );
    }

    try {
      const statsStart = Date.now();

      const tickets = await Ticket.find();

      addResult(
        "Stats Endpoint Logic",
        true,
        `${tickets.length} tickets analyzed.`,
        Date.now() - statsStart
      );
    } catch (error) {
      addResult(
        "Stats Endpoint Logic",
        false,
        error.message,
        0
      );
    }

    try {
      const aiStart = Date.now();

      const aiResponse =
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content:
                "Generate a simple IT issue summary.",
            },
          ],
        });

      if (
        !aiResponse.choices?.[0]?.message?.content
      ) {
        throw new Error("AI returned empty response.");
      }

      addResult(
        "OpenAI Integration",
        true,
        "AI response generated successfully.",
        Date.now() - aiStart
      );
    } catch (error) {
      addResult(
        "OpenAI Integration",
        false,
        error.message,
        0
      );
    }

    const passed = results.filter(
      (test) => test.passed
    ).length;

    const failed = results.filter(
      (test) => !test.passed
    ).length;

    res.json({
      success: failed === 0,
      summary: {
        total: results.length,
        passed,
        failed,
      },
      results,
      testedAt: new Date(),
    });
  }
);

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket.IO realtime server active");
});

module.exports = app;