# Task Tracker with AI Priority Suggestion

## Project Overview

Task Tracker is a full-stack web application built using React, FastAPI, and SQLite. It helps users manage tasks efficiently by allowing them to create, update, delete, and track tasks. The application also includes an AI-powered feature that suggests task priority levels.

---

## Features

- Create tasks
- View all tasks
- Update task status
- Delete tasks
- Store tasks in SQLite database
- AI-powered priority suggestion
- Responsive user interface

---

## Technologies Used

### Frontend
- React
- Vite
- Axios

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- OpenAI API

---

## API Documentation

The backend API is documented using FastAPI Swagger UI.

### Swagger UI
http://127.0.0.1:8000/docs

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Retrieve all tasks |
| POST | /tasks | Create a new task |
| PUT | /tasks/{task_id} | Update an existing task |
| DELETE | /tasks/{task_id} | Delete a task |

---

## Project Structure

### Frontend
- React Application
- API Integration Layer
- User Interface Components

### Backend
- FastAPI Application
- Database Models
- API Routes
- AI Integration

---

## Environment Variables

Create a `.env` file in the backend folder:

```bash
OPENAI_API_KEY=your_api_key_here