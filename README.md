# ciBulletin

**ciBulletin** Student led unified platform that serves as a Digital bulletin board application. It's designed to be used as an outlet for students to connect and promote student involvement. Built with a focus on user experience, utilizes a MERN stack to handle modern web technologies.

---

## 🚀 Project Goals

- **Focus on Student Led Communication**: Provide a platform for sharing announcements, updates, events, and discussions.
- **Real-Time Updates**: Ensuring students receive the latest information of ongoing topics and events around campus consistently.
- **Modern Architecture**: Demonstrate a good web application architecture that showcases skills learned in classes througout my time at CSUCI.
- **User-Friendly Interface**: Ensure that the application is student focused and easy to navigate for students of all backgrounds.

---

## 🧠 How It Works

ciBulletin operates on a full-stack JavaScript framework:

- **Frontend**: Developed using React, specifically for its fast user interface.
- **Backend**: Powered by Node.js and Express, handling API requests and server-side logic.
- **Database**: Utilizes MongoDB.
- **Real-Time Communication**: Incorporates WebSocket technology to enable communication amoungst users. (NOT A CORE FEATURE BUT WILL TRY TO IMPLEMENT)

---

## 📁 Project Structure

The current directory structure is as follows:

```text
ciBulletin/
├── client/             # React frontend application
├── server/             # Express backend server
├── ssl/                # SSL certificates (not in version control)
├── .gitignore          # Specifies files to ignore in Git
├── README.md           # Project documentation
├── PRODUCTION.md       # Production deployment guide
├── package-lock.json   # Dependency tree lock file
└── package.json        # Project metadata and scripts
```

---

## 🛠️ Getting Started

To set up the project locally:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/rxckxtx/ciBulletin.git
   cd ciBulletin
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **SSL Certificates Setup** (for HTTPS):

   Create an `ssl` directory in the project root:

   ```bash
   mkdir -p ssl
   ```

   For development, generate self-signed certificates:

   ```bash
   # On Linux/Mac
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/private.key -out ssl/certificate.crt

   # On Windows (using Git Bash or similar)
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/private.key -out ssl/certificate.crt
   ```

   > **Important**: SSL certificates should never be committed to version control. The `ssl` directory is included in `.gitignore`.

4. **Start the development server**:

   ```bash
   # HTTP only
   npm run dev

   # With HTTPS support
   npm run dev-full-https
   ```

The application will be accessible at:

- HTTP: `http://localhost:3000` (frontend) and `http://localhost:5000` (backend)
- HTTPS: `https://localhost:3000` (frontend) and `https://localhost:8443` (backend)

---

## 📚 Framework Documentation

- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/start/framework/routing)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

## 🤝 Contributing

Any contributions are welcome, as well as potential bug reports.