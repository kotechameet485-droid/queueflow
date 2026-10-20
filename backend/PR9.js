const http = require("http");

const users = [
  {
    username: "meet",
    password: "1234",
    role: "admin"
  },
  {
    username: "student",
    password: "1234",
    role: "user"
  }
];

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  const pathname = req.url.split("?")[0];

  const username = req.headers.username;
  const password = req.headers.password;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    res.writeHead(401, {
      "Content-Type": "application/json"
    });
    return res.end(
      JSON.stringify({
        message: "Authentication failed"
      })
    );
  }

  if (pathname === "/admin") {
    if (user.role !== "admin") {
      res.writeHead(403, {
        "Content-Type": "application/json"
      });
      return res.end(
        JSON.stringify({
          message: "Access denied. Admin only."
        })
      );
    }

    res.writeHead(200, {
      "Content-Type": "application/json"
    });
    return res.end(
      JSON.stringify({
        message: "Welcome Admin!",
        user: user.username
      })
    );
  }

  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  return res.end(
    JSON.stringify({
      message: "Login successful",
      user: user.username,
      role: user.role
    })
  );
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
