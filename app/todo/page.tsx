"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import "./todo.css";

interface Task {
  id: number;
  text: string;
  progress?: number; // Made optional to fix the Vercel/TypeScript build error
  completedAt?: number;
  completedDateStr?: string;
}

type ViewState = "main" | "history";

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskHistory, setTaskHistory] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<ViewState>("main");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [draggableItemId, setDraggableItemId] = useState<number | null>(null);

  // Performance and Tracking Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scheduledTimeouts = useRef<Set<number>>(new Set());
  
  const activeSlider = useRef<{
    id: number;
    card: HTMLDivElement;
    fill: HTMLDivElement;
    pctText: HTMLSpanElement;
    pContainer: HTMLDivElement;
  } | null>(null);
  const draggedIdRef = useRef<number | null>(null);

  // Hydration logic with auto-deduplication to clear corrupted Local Storage
  useEffect(() => {
    const rawTasks = JSON.parse(localStorage.getItem("sideTasks") || "[]");
    const rawHistory = JSON.parse(localStorage.getItem("sideHistory") || "[]");

    const deduplicate = (list: Task[]) => {
      const seenIds = new Set();
      return list.map((item) => {
        if (seenIds.has(item.id)) {
          const fixedId = Date.now() + Math.floor(Math.random() * 100000);
          seenIds.add(fixedId);
          return { ...item, id: fixedId };
        }
        seenIds.add(item.id);
        return item;
      });
    };

    setTasks(deduplicate(rawTasks));
    setTaskHistory(deduplicate(rawHistory));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("sideTasks", JSON.stringify(tasks));
      localStorage.setItem("sideHistory", JSON.stringify(taskHistory));
    }
  }, [tasks, taskHistory, isHydrated]);

  const playSuccessSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  const moveToHistory = useCallback((id: number) => {
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === id);
      if (taskIndex === -1) return prev;

      const newTasks = [...prev];
      const [completedTask] = newTasks.splice(taskIndex, 1);
      
      const historyTask: Task = {
        ...completedTask,
        completedDateStr: new Date().toLocaleString(),
      };
      delete historyTask.completedAt;
      delete historyTask.progress;

      // Update history OUTSIDE the synchronous execution of setTasks to avoid Strict Mode double-firing
      setTimeout(() => {
        setTaskHistory((hPrev) => {
          // Absolute safeguard: Do not add if ID already exists in history
          if (hPrev.some((t) => t.id === historyTask.id)) return hPrev;
          return [historyTask, ...hPrev];
        });
      }, 0);

      return newTasks;
    });
  }, []);

  const completeTask = useCallback((id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completedAt: Date.now(), progress: 100 } : t))
    );
    playSuccessSound();
  }, [playSuccessSound]);

  useEffect(() => {
    if (!isHydrated) return;
    const now = Date.now();
    
    tasks.forEach((task) => {
      if (task.completedAt && !scheduledTimeouts.current.has(task.id)) {
        scheduledTimeouts.current.add(task.id);
        const timePassed = now - task.completedAt;
        
        if (timePassed >= 30000) {
          moveToHistory(task.id);
        } else {
          setTimeout(() => moveToHistory(task.id), 30000 - timePassed);
        }
      }
    });
  }, [isHydrated, tasks, moveToHistory]);

  const triggerCheckbox = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completedAt) {
      const fill = document.getElementById(`fill-${id}`);
      const pct = document.getElementById(`pct-${id}`);
      if (fill) {
        fill.classList.add("snapping");
        fill.style.width = "100%";
      }
      if (pct) pct.innerText = "100%";
      setTimeout(() => completeTask(id), 200);
    }
  };

  const submitTask = () => {
    const text = inputValue.trim();
    if (text) {
      const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
      setTasks((prev) => [...prev, { id: uniqueId, text, progress: 0 }]);
      setInputValue("");
      setIsModalOpen(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your task history?")) {
      setTaskHistory([]);
      scheduledTimeouts.current.clear();
    }
  };

  const spawnParticle = (container: HTMLDivElement, x: number, y: number) => {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 6 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${x}px`;
    const topPos = y + (Math.random() * 40 - 20);
    p.style.top = `${topPos}px`;
    p.style.setProperty("--y-drift", `${Math.random() * 60 - 30}px`);
    container.appendChild(p);
    setTimeout(() => p.remove(), 600);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: number) => {
    if ((e.target as HTMLElement).closest(".checkbox")) return;
    const card = e.currentTarget;
    const fill = card.querySelector(".slider-fill") as HTMLDivElement;
    const pctText = card.querySelector(".percentage") as HTMLSpanElement;
    const pContainer = card.querySelector(".particle-container") as HTMLDivElement;

    if (fill) fill.classList.remove("snapping");
    card.setPointerCapture(e.pointerId);

    activeSlider.current = { id, card, fill, pctText, pContainer };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeSlider.current) return;
    const { id, card, fill, pctText, pContainer } = activeSlider.current;

    let rect = card.getBoundingClientRect();
    let draggedDistance = e.clientX - rect.left;
    draggedDistance = Math.max(0, Math.min(draggedDistance, rect.width));

    let percentage = Math.floor((draggedDistance / rect.width) * 100);

    if (fill) fill.style.width = `${percentage}%`;
    if (pctText) pctText.innerText = `${percentage}%`;

    if (draggedDistance > 10 && Math.random() > 0.4) {
      spawnParticle(pContainer, draggedDistance, e.nativeEvent.offsetY || 50);
    }

    if (percentage >= 100) {
      card.releasePointerCapture(e.pointerId);
      activeSlider.current = null;
      completeTask(id);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, id: number) => {
    if (!activeSlider.current || activeSlider.current.id !== id) return;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const rect = activeSlider.current.card.getBoundingClientRect();
    const draggedDistance = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, Math.floor((draggedDistance / rect.width) * 100)));

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, progress: percentage } : t)));
    activeSlider.current = null;
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: number) => {
    draggedIdRef.current = id;
    e.currentTarget.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const targetLi = e.currentTarget;
    if (!targetLi.classList.contains("dragging") && !targetLi.classList.contains("task-completed")) {
      targetLi.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetId: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    if (e.currentTarget.classList.contains("task-completed")) return;

    const draggedId = draggedIdRef.current;
    if (draggedId && draggedId !== targetId) {
      setTasks((prev) => {
        const newTasks = [...prev];
        const fromIndex = newTasks.findIndex((t) => t.id === draggedId);
        const toIndex = newTasks.findIndex((t) => t.id === targetId);
        const [movedTask] = newTasks.splice(fromIndex, 1);
        newTasks.splice(toIndex, 0, movedTask);
        return newTasks;
      });
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove("dragging");
    draggedIdRef.current = null;
    document.querySelectorAll("li").forEach((li) => li.classList.remove("drag-over"));
  };

  if (!isHydrated) return null;

  return (
    <div className="todo-container">
      <div className={`view-container ${activeView === "main" ? "view-active" : ""}`}>
        <main>
          <ul>
            {tasks.length === 0 ? (
              <div className="empty-state">All caught up! Add a new objective.</div>
            ) : (
              tasks.map((task) => {
                if (task.completedAt) {
                  const timePassed = Date.now() - task.completedAt;
                  const remainingPct = Math.max(0, 100 - (timePassed / 30000) * 100);
                  const remainingSec = Math.max(0, (30000 - timePassed) / 1000);

                  return (
                    <li key={task.id} className="task-row task-completed">
                      <div className="drag-handle" style={{ visibility: "hidden" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8h16M4 16h16"/></svg>
                      </div>
                      <div className="task-card glass">
                        <div
                          className="slider-fill countdown-active"
                          style={{
                            width: `${remainingPct}%`,
                            transition: `width ${remainingSec}s linear`,
                          }}
                          ref={(el) => {
                            if (el) setTimeout(() => (el.style.width = "0%"), 50);
                          }}
                        />
                        <div className="task-content">
                          <div className="checkbox">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg-color)" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                          </div>
                          <span className="task-text">{task.text}</span>
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={task.id}
                    className="task-row"
                    draggable={draggableItemId === task.id}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div 
                      className="drag-handle"
                      onPointerEnter={() => setDraggableItemId(task.id)}
                      onPointerLeave={() => setDraggableItemId(null)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8h16M4 16h16"/></svg>
                    </div>
                    <div
                      className="task-card glass"
                      onPointerDown={(e) => handlePointerDown(e, task.id)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={(e) => handlePointerUp(e, task.id)}
                    >
                      <div className="slider-fill" id={`fill-${task.id}`} style={{ width: `${task.progress || 0}%` }} />
                      <div className="particle-container" />
                      <div className="task-content">
                        <div className="checkbox" onClick={() => triggerCheckbox(task.id)} />
                        <span className="task-text">{task.text}</span>
                        <span className="percentage" id={`pct-${task.id}`}>
                          {task.progress || 0}%
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </main>
      </div>

      <div className={`view-container ${activeView === "history" ? "view-active" : ""}`}>
        <main>
          <ul>
            {taskHistory.length === 0 ? (
              <div className="empty-state">No completed tasks yet.</div>
            ) : (
              taskHistory.map((task) => (
                <li key={task.id} className="task-row task-completed">
                  <div className="drag-handle" style={{ display: "none" }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8h16M4 16h16"/></svg>
                  </div>
                  <div className="task-card glass">
                    <div className="task-content">
                      <div className="history-checked">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bg-color)" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span className="task-text" style={{ display: "block" }}>
                          {task.text}
                        </span>
                        <span className="timestamp">Completed: {task.completedDateStr}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          {taskHistory.length > 0 && (
            <button className="btn-clear" onClick={clearHistory}>
              Clear History
            </button>
          )}
        </main>
      </div>

      <div className="fab-container">
        <button
          className="fab glass fab-history"
          onClick={() => setActiveView(activeView === "main" ? "history" : "main")}
        >
          {activeView === "main" ? (
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ) : (
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          )}
        </button>
        {activeView === "main" && (
          <button className="fab fab-add" onClick={() => setIsModalOpen(true)}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        )}
      </div>

      <div
        className={`input-modal ${isModalOpen ? "active" : ""}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).classList.contains("input-modal")) setIsModalOpen(false);
        }}
      >
        <div className="input-content">
          <input
            type="text"
            className="glass"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitTask();
              if (e.key === "Escape") setIsModalOpen(false);
            }}
            ref={(input) => { 
                if (isModalOpen && input) input.focus(); 
            }}          />
          <div className="input-hint">
            Press <strong>Enter</strong> to add, or <strong>Escape</strong> to cancel
          </div>
        </div>
      </div>
    </div>
  );
}