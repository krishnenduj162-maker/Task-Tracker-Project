import { useState, useEffect, useRef } from "react";
import {
  getTasks,
  createTask,
  deleteTaskApi,
  updateTaskApi,
  getAiPriority,
} from "./api/taskApi";

function App() {
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("low");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("low");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const aiTimerRef = useRef(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await getTasks();
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

  // ===================== AI =====================
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

      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

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

  // ===================== CLOSE AI =====================
  const closeAiMessage = () => {
    setAiMessage("");

    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
    }

    setNewTask("");
  };

  // ===================== ADD TASK (FIXED) =====================
  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const response = await createTask({
        title: newTask,
        status: "todo",
        priority: newPriority,
        description: "",
      });

      const createdTask = response.data;

      // ✅ instant UI update
      setTasks((prev) => [...prev, createdTask]);

      setNewTask("");
      setNewPriority("low");
    } catch (error) {
      console.log("Error adding task:", error);
    }
  };

  // ===================== DELETE TASK (FIXED) =====================
  const deleteTask = async (id) => {
    try {
      await deleteTaskApi(id);

      // ✅ instant UI update
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.title);
    setEditPriority(task.priority);
  };

  const updateTask = async (id) => {
    const task = tasks.find((t) => t.id === id);

    await updateTaskApi(id, {
      title: editText,
      status: task.status,
      priority: editPriority,
      description: task.description || "",
    });

    setEditingId(null);
    setEditText("");
    setEditPriority("low");

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

  const filteredTasks = tasks
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
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>📋 TASK TRACKER</h1>

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

          <button
            style={{ ...styles.addBtn, marginRight: "10px", opacity: loading ? 0.6 : 1 }}
            onClick={suggestPriority}
            disabled={loading}
          >
            {loading ? "🤖 Thinking..." : "✨ AI Suggest"}
          </button>

          <button style={styles.addBtn} onClick={addTask}>
            + Add Task
          </button>
        </div>

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

        <input
          style={styles.inputFull}
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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

        {filteredTasks.map((task) => (
          <div key={task.id} style={styles.taskCard}>
            {editingId === task.id ? (
              <>
                <input
                  style={styles.input}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
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

                <button style={styles.addBtn} onClick={() => updateTask(task.id)}>
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
      </div>
    </div>
  );
}

// styles unchanged
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