# LensTrack Pro - Client Management System

Welcome to LensTrack Pro! This is a modern, full-stack Client Management System (CRM) designed to help freelancers and small agencies track their clients, projects, and communications efficiently. The application is enhanced with powerful AI features to provide smart insights and automate summarization tasks.

![LensTrack Pro Screenshot](https://placehold.co/800x450.png?text=LensTrack+Pro+App+UI)
*<p align="center">A placeholder for the app's dashboard screenshot.</p>*

---

## ✨ Key Features

- **🔐 Authentication:** Secure user login and registration system.
- **📊 Interactive Dashboard:** Get a quick overview of key metrics like total clients, active projects, and new clients this month.
- **👤 Client Management:** Full CRUD (Create, Read, Update, Delete) functionality for managing client data.
- **📁 Project Tracking:** Keep track of all projects, their status, deadlines, and the person in charge.
- **📞 Communication Logging:** Record every interaction with clients, whether through email, WhatsApp, or meetings.
- **🤖 AI-Powered Overview:** With a single click, generate a comprehensive AI summary for any client, analyzing their projects and recent communications to identify risks and provide recommendations.
- **💡 AI Log Summarization:** Automatically summarize long communication histories to get the key points without reading everything.
- **↓ Export to CSV:** Easily export your client list to a CSV file.
- **📱 Responsive Design:** Fully responsive interface that works on both desktop and mobile devices.

---

## 🛠️ Tech Stack

This project is built with a modern, robust, and scalable tech stack:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration:** [Google AI & Genkit](https://firebase.google.com/docs/genkit)
- **Database:** [Firebase Realtime Database](https://firebase.google.com/docs/database)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your computer:
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation Guide

1.  **Clone the Repository**
    - If you have cloned this project from GitHub, you can skip this step. Otherwise, clone the repository to your local machine:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install Dependencies**
    - Open your terminal in the project directory and run the following command to install all the necessary packages:
    ```bash
    npm install
    ```

3.  **Set Up Firebase**
    - This application requires a Firebase project to handle the database and user authentication.
    - **a. Create a Firebase Project:**
        - Go to the [Firebase Console](https://console.firebase.google.com/).
        - Click on "Add project" and follow the on-screen instructions.
    - **b. Set Up Authentication:**
        - In your new Firebase project, go to the "Authentication" section from the left sidebar.
        - Click "Get started" and choose **Email/Password** from the list of sign-in methods.
        - Enable it and click "Save".
    - **c. Set Up Realtime Database:**
        - Go to the "Realtime Database" section (or "Build" > "Realtime Database").
        - Click "Create database" and choose a location.
        - Start in **test mode** for now (this allows read/write access without authentication rules, which is fine for local development).
    - **d. Get Your Firebase Config:**
        - Go to your Project Settings (click the ⚙️ icon next to "Project Overview").
        - Scroll down to the "Your apps" section.
        - Click on the web icon `</>` to register a new web app.
        - Give it a nickname (e.g., "LensTrack Web") and click "Register app".
        - Firebase will provide you with a `firebaseConfig` object. Copy this object.
    - **e. Add Config to the Project:**
        - Open the file `src/lib/firebase.ts`.
        - **Replace** the existing `firebaseConfig` object with the one you copied from your Firebase project.

4.  **Set Up Environment Variables for AI (Optional but Recommended)**
    - For AI features to work, you need a Google AI API key.
    - **a. Get an API Key:**
        - Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
        - Click "Create API key in new project".
        - Copy the generated API key.
    - **b. Add Key to Environment File:**
        - In the root of your project, find the `.env` file (if it doesn't exist, create it).
        - Add the following line, replacing `YOUR_API_KEY` with the key you just copied:
        ```
        GOOGLE_API_KEY=YOUR_API_KEY
        ```

### Running the Application

You need to run two processes in separate terminals for the full application (including AI features) to work.

1.  **Start the Main Application (Next.js):**
    - In your first terminal, run:
    ```bash
    npm run dev
    ```
    - Your app should now be running at [http://localhost:9002](http://localhost:9002).

2.  **Start the AI Service (Genkit):**
    - Open a **new, second terminal** in the same project directory.
    - Run the following command:
    ```bash
    npm run genkit:dev
    ```
    - This starts the local server that handles all the AI-related requests.

Now you can open your browser, navigate to `http://localhost:9002`, and start using LensTrack Pro!
