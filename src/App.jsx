import { useState, useEffect, useRef } from "react";
import {
  getTasks,
  createTask,
  deleteTaskApi,
  updateTaskApi,
  getAiPriority,
} from "./api/taskApi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [tasks, setTasks] = useState([]);

   const pageStyle = {
  ...styles.page,
  background: darkMode
    ? "#121212"
    : "linear-gradient(135deg,#667eea,#764ba2)",
  transition: "all 0.4s ease",
};
  const [user, setUser] = useState(null);
  
  const [newTask, setNewTask] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  const getDaysLeft = () => {
  if (!dueDate) return "";

  const today = new Date();
  const due = new Date(dueDate);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return `${diffDays} days left`;
  if (diffDays === 1) return "1 day left";
  if (diffDays === 0) return "Due today";

  return `Overdue by ${Math.abs(diffDays)} day(s)`;
};

const getDaysLeftForTask = (dueDate) => {
  if (!dueDate) return "";

  const today = new Date();
  const due = new Date(dueDate);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return `⏳ ${diffDays} days left`;
  if (diffDays === 1) return `⏳ 1 day left`;
  if (diffDays === 0) return `📅 Due today`;

  return `🔴 Overdue by ${Math.abs(diffDays)} day(s)`;
};

const isOverdue = (task) => {
  if (!task.due_date) return false;

  return (
    new Date(task.due_date) < new Date() &&
    task.status !== "completed"
  );
};

  const [showDueInfo, setShowDueInfo] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("low");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const totalTasks = tasks.length;

const safeTasks = Array.isArray(tasks) ? tasks : [];

const completedTasks = safeTasks.filter(
  (task) => task.status === "completed"
).length;

const inProgressTasks = safeTasks.filter(
  (task) => task.status === "inprogress"
).length;

const todoTasks = safeTasks.filter(
  (task) => task.status === "todo"
).length;

const chartData = [
  { name: "Completed", value: completedTasks },
  { name: "In Progress", value: inProgressTasks },
  { name: "Todo", value: todoTasks },
];
const COLORS = ["#2ecc71", "#f39c12", "#3498db"];

  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const aiTimerRef = useRef(null);

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    loadTasks();
  }, []);
  useEffect(() => {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}, []);

  const loadTasks = async () => {
  try {
    const response = await getTasks();

    console.log("TYPE:", typeof response.data);
    console.log("IS ARRAY:", Array.isArray(response.data));
    console.log("API DATA:", response.data);

    setTasks(response.data);
  } catch (error) {
    console.log("Error fetching tasks:", error);
  }
};

  useEffect(() => {
    console.log("TASKS STATE:", tasks);
  }, [tasks]);

  const getPriorityColor = (p) =>
    p === "high" ? "#e74c3c" : p === "medium" ? "#f39c12" : "#2ecc71";
  const showNotification = (task) => {
  if (Notification.permission === "granted") {
    new Notification("⏰ Task Reminder", {
      body: `Task "${task.title}" is due or overdue!`,
    });
  }
};
  const getStatusColor = (s) => {
    switch (s) {
      case "completed":
        return "#2ecc71";
      case "inprogress":
        return "#f39c12";
      default:
        return "#3498db";
    }
  };
  useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();

    tasks.forEach((task) => {
      if (task.due_date && task.status !== "completed") {
        const due = new Date(task.due_date);

        // trigger notification if overdue or due time reached
        if (due <= now) {
          showNotification(task);
        }
      }
    });
  }, 60000); // runs every 1 minute

  return () => clearInterval(interval);
}, [tasks]);

  // ===================== AI SUGGESTION =====================
  const suggestPriority = async () => {
    if (!newTask.trim()) {
      alert("Please enter a task first.");
      return;
    }

    try {
      setLoading(true);

      const response = await getAiPriority(newTask);
      const result = response.data.result.toLowerCase();

      if (result.includes("high")) setNewPriority("high");
      else if (result.includes("medium")) setNewPriority("medium");
      else setNewPriority("low");

      setAiMessage(response.data.result);

      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }

      aiTimerRef.current = setTimeout(() => {
        setAiMessage("");
      }, 30000);
    } catch (error) {
      console.log(error);
      alert("AI suggestion failed.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== CLOSE AI MESSAGE =====================
  const closeAiMessage = () => {
  setAiMessage("");

  // stop auto timer
  if (aiTimerRef.current) {
    clearTimeout(aiTimerRef.current);
  }

  // ❌ clear Enter Task input
  setNewTask("");
};

  // ===================== TASK ACTIONS =====================
  const addTask = async () => {
    if (!newTask.trim()) return;

    await createTask({
      title: newTask,
      status: "todo",
      priority: newPriority,
      description: newDescription,
      due_date: dueDate  || null,
    });

    setNewTask("");
    setNewPriority("low");
    setNewDescription("");
    setDueDate("");
    loadTasks();
  };

  const deleteTask = async (id) => {
    await deleteTaskApi(id);
    loadTasks();
  };

  const startEdit = (task) => {
  setEditingId(task.id);
  setEditText(task.title);
  setEditDescription(task.description || "");
  setEditPriority(task.priority);
  setEditDueDate(task.due_date || "");  
};

  const updateTask = async (id) => {
  const task = tasks.find((t) => t.id === id);

  await updateTaskApi(id, {
    title: editText,
    status: task.status,
    priority: editPriority,
    description: editDescription,
    due_date: editDueDate
  });

  setEditingId(null);
  setEditText("");
  setEditDescription("");
  setEditPriority("low");
  setEditDueDate(""); 

  loadTasks();
};
  const changeStatus = async (task, status) => {
    await updateTaskApi(task.id, {
      title: task.title,
      status,
      priority: task.priority,
      description: task.description || "",
    });

    loadTasks();
  };

  // ===================== FILTERING =====================
  const filteredTasks = (Array.isArray(tasks) ? tasks : [])
  .filter((t) =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .filter((t) =>
    statusFilter === "all" ? true : t.status === statusFilter
  )
  .filter((t) =>
    priorityFilter === "all" ? true : t.priority === priorityFilter
  );
  return (
    <div style={pageStyle}>
      <div
  style={{
    ...styles.container,
    background: darkMode
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.15)",
  }}
>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h1 style={styles.heading}>📋 TASK TRACKER</h1>

  <button
    onClick={() => setDarkMode(!darkMode)}
    style={{ padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer" }}
  >
    {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
  </button>
</div>

       {/* ADD TASK */}
<div>
  <input
    style={styles.input}
    value={newTask}
    onChange={(e) => setNewTask(e.target.value)}
    placeholder="Enter task..."
  />

  <select
    style={styles.input}
    value={newPriority}
    onChange={(e) => setNewPriority(e.target.value)}
  >
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>

  <div style={{ display: "inline-block", marginRight: "10px" }}>
    <input
      type="date"
      style={styles.input}
      value={dueDate}
      onChange={(e) => {
        setDueDate(e.target.value);
        setShowDueInfo(true);
      }}
      onClick={() => setShowDueInfo(false)}
    />

    {dueDate && showDueInfo && (
      <div
        style={{
          fontSize: "11px",
          marginTop: "4px",
          textAlign: "center",
        }}
      >
        {getDaysLeft()}
      </div>
    )}
  </div>

  <button
    style={{
      ...styles.addBtn,
      marginRight: "10px",
      opacity: loading ? 0.6 : 1,
    }}
    onClick={suggestPriority}
    disabled={loading}
  >
    {loading ? "🤖 Thinking..." : "✨ AI Suggest"}
  </button>

  <button
    style={styles.addBtn}
    onClick={addTask}
  >
    + Add Task
  </button>


  {/* Description Box */}
  <textarea
    style={{
      width: "100%",
      padding: "10px",
      marginTop: "10px",
      borderRadius: "8px",
      border: "none",
      resize: "vertical",
      minHeight: "70px",
      boxSizing: "border-box",
    }}
    value={newDescription}
    onChange={(e) => setNewDescription(e.target.value)}
    placeholder="Enter task description..."
  />
</div>
        {/* AI MESSAGE BOX */}
        {aiMessage && (
          <div style={styles.aiBox}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>🤖 AI Suggestion</span>

              <span
                style={{ cursor: "pointer", fontSize: "18px" }}
                onClick={closeAiMessage}
              >
                ❌
              </span>
            </div>

            {"\n\n"}
            {aiMessage}
          </div>
        )}

        {/* SEARCH */}
        <input
          style={styles.inputFull}
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {/* FILTERS */}
        <div style={{ marginTop: "10px" }}>
          <select
            style={styles.input}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            style={styles.input}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
<div
  style={{
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <div style={styles.statCard}>
    📋 Total Tasks: {totalTasks}
  </div>

  <div style={styles.statCard}>
    ✅ Completed: {completedTasks}
  </div>

  <div style={styles.statCard}>
    ⏳ In Progress: {inProgressTasks}
  </div>

  <div style={styles.statCard}>
    📝 Todo: {todoTasks}
  </div>
</div>
<div
  style={{
    background: "rgba(255,255,255,0.15)",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  }}
>
  <h3 style={{ textAlign: "center" }}>
    📊 Task Progress Overview
  </h3>

  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        outerRadius={100}
        dataKey="value"
        label
      >
        {chartData.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>
        {/* TASK LIST */}
        {filteredTasks.map((task) => (
          <div
  key={task.id}
  style={{
    ...styles.taskCard,
    border: isOverdue(task)
      ? "2px solid red"
      : "none",
  }}
>
            {editingId === task.id ? (
  <>
    <input
      style={styles.input}
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
    />

    <textarea
      style={{
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        borderRadius: "8px",
        border: "none",
        resize: "vertical",
        minHeight: "70px",
        boxSizing: "border-box",
      }}
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      placeholder="Edit description..."
    />

    <select
      style={styles.input}
      value={editPriority}
      onChange={(e) => setEditPriority(e.target.value)}
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
    <input
  type="date"
  style={styles.input}
  value={editDueDate}
  onChange={(e) => setEditDueDate(e.target.value)}
/>
    <button
      style={styles.addBtn}
      onClick={() => updateTask(task.id)}
    >
      Save
    </button>
  </>
) : (
              <>
                <h3
  style={{
    textDecoration:
      task.status === "completed" ? "line-through" : "none",
  }}
>
  {task.title}
</h3>

{task.due_date && (
  <>
    <p
      style={{
        marginTop: "5px",
        fontSize: "13px",
      }}
    >
      📅 Due: {task.due_date}
    </p>

    <p
      style={{
        fontSize: "12px",
        fontWeight: "bold",
      }}
    >
      {getDaysLeftForTask(task.due_date)}
    </p>
  </>
)}

{task.description && (
  <p
    style={{
      marginTop: "5px",
      opacity: 0.85,
      fontSize: "14px",
    }}
  >
    {task.description}
  </p>
)}


                <div style={styles.badges}>
                  <span
                    style={{
                      ...styles.badge,
                      background: getStatusColor(task.status),
                    }}
                  >
                    {task.status}
                  </span>

                  <span
                    style={{
                      ...styles.badge,
                      background: getPriorityColor(task.priority),
                    }}
                  >
                    {task.priority}
                  </span>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <button style={styles.btn} onClick={() => startEdit(task)}>
                    Edit
                  </button>
                  <button style={styles.btn} onClick={() => changeStatus(task, "todo")}>
                    Todo
                  </button>
                  <button style={styles.btn} onClick={() => changeStatus(task, "inprogress")}>
                    Progress
                  </button>
                  <button style={styles.btn} onClick={() => changeStatus(task, "completed")}>
                    Done
                  </button>
                  <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
                ))}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            padding: "15px",
            opacity: "0.8",
            fontSize: "14px",
          }}
        >
          🚀 Task Tracker | Built with React + FastAPI + SQLite + OpenAI
        </div>

      </div>
    </div>
  );
}

// ===================== STYLES =====================
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    padding: "20px",
    fontFamily: "Arial",
  },
  container: {
    maxWidth: "900px",
    margin: "auto",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    color: "white",
    transition: "all 0.4s ease",
  },
  heading: {
    textAlign: "center",
    fontSize: "34px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    marginRight: "10px",
    borderRadius: "8px",
    border: "none",
  },
  inputFull: {
    padding: "10px",
    width: "100%",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
    boxSizing: "border-box",
  },
  addBtn: {
    padding: "10px 15px",
    background: "#00f2fe",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  taskCard: {
  background: "rgba(255,255,255,0.2)",
  padding: "15px",
  marginTop: "15px",
  borderRadius: "10px",
},

  statCard: {
  background: "rgba(255,255,255,0.2)",
  padding: "12px 18px",
  borderRadius: "10px",
  margin: "5px",
  fontWeight: "bold",
  minWidth: "150px",
  textAlign: "center",
},

  badges: {
    display: "flex",
    gap: "8px",
    marginTop: "5px",
  },
  badge: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
  },
  btn: {
    marginRight: "8px",
    padding: "6px 10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "6px",
    background: "red",
    color: "white",
    cursor: "pointer",
  },
  aiBox: {
    marginTop: "15px",
    marginBottom: "15px",
    padding: "15px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "10px",
    color: "white",
    whiteSpace: "pre-line",
  },
};

export default App;