# EOXS Video Tool

A modern web application for video management, analytics, and playlist creation built with Next.js, Firebase, and Tailwind CSS.

## Features

- 🎥 Video Upload and Management
- 📊 Analytics Dashboard
- 📝 Playlist Creation
- 👥 User Authentication
- 📱 Responsive Design
- 🌙 Dark/Light Mode
- 📧 Email Notifications
- 📈 Real-time Analytics
- 🔒 Admin Dashboard
- 💬 Feedback System

## Tech Stack

- **Frontend Framework:** Next.js 15.1.0
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **UI Components:** Shadcn/ui
- **Charts:** Recharts
- **Email Service:** Nodemailer
- **Video Processing:** Cloudinary

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Cloudinary account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_SERVICE_USER=
EMAIL_SERVICE_PASS=
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Rohitjha17/eoxs-video-tool.git
cd eoxs-video-tool
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
eoxs-video-tool/
├── app/                    # Next.js app directory
│   ├── admin-dashboard/    # Admin dashboard pages
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   └── pages/            # Main pages
├── components/            # Shared components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/              # Static assets
```

## Features in Detail

### Video Management
- Upload videos with thumbnails
- Organize videos into playlists
- Track video performance metrics

### Analytics Dashboard
- View total views and watch time
- Track engagement metrics
- Monitor video performance
- Generate reports

### Admin Features
- Manage user access
- Monitor system performance
- Handle feedback and reports
- Configure system settings

### User Features
- Create and manage playlists
- Submit feedback
- Track personal video performance
- Customize profile settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Cloudinary](https://cloudinary.com/)

## Contact

Rohit Jha - [GitHub](https://github.com/Rohitjha17)

Project Link: [https://github.com/Rohitjha17/eoxs-video-tool](https://github.com/Rohitjha17/eoxs-video-tool) 