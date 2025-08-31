<h1 align="center">Spotify Clone API</h1>
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20-green.svg" alt="Node.js" />
  <img
    src="https://img.shields.io/badge/Express.js-v5.1.0-blue.svg"
    alt="Express"
  />
  <img
    src="https://img.shields.io/badge/MongoDB-v8.x-green.svg"
    alt="Mongo DB"
  />
  <img
    src="https://img.shields.io/badge/Cloudinary-Storage-4C5ECC"
    alt="Cloudinary"
  />
  <img src="https://img.shields.io/badge/Jest-Testing-red.svg" alt="Jest" />
</p>

<h4 align="center">
  A full-featured music streaming API built with Node.js and Express,
  replicating core Spotify functionality with robust authentication, file
  management, and comprehensive testing.
</h4>

---

## Deployed Version

Explore the live API here 👉🏻 :

---

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role management
- **Music Management** - Upload, stream, and organize songs, albums, and playlists
- **Artist & Album Management** - Complete CRUD operations for music metadata
- **File Upload & Storage** - Cloudinary integration for audio and image files with automatic cleanup
- **Smart Storage Management** - Automatic disk cleanup on upload errors and orphaned file removal
- **Search & Discovery** - Advanced search functionality across songs, artists, and albums
- **Playlist Management** - Create, update, and share custom playlists
- **User Profiles** - Comprehensive user management and preferences

---

## 🧹 Advanced File Management

- **Error-Safe Uploads** - Automatic cleanup of local files when Cloudinary upload fails
- **Orphan File Prevention** - Removes old Cloudinary files when documents are deleted from database
- **Disk Space Optimization** - Multer temporary files are cleaned immediately after processing

---

## API Routes

<p>The following routes are available for interacting with the API:</p>

- All routes are prefixed with `/api/v1/`. For example, to access the songs endpoint, use `/api/v1/songs`.

  | **Resource**  | **Route**    | **Methods**              |
  | ------------- | ------------ | ------------------------ |
  | **Users**     | `/users`     | GET, POST, PATCH, DELETE |
  | **Artists**   | `/artists`   | GET, POST, PATCH, DELETE |
  | **Albums**    | `/albums`    | GET, POST, PATCH, DELETE |
  | **Songs**     | `/songs`     | GET, POST, PATCH, DELETE |
  | **Playlists** | `/playlists` | GET, POST, PATCH, DELETE |

---
