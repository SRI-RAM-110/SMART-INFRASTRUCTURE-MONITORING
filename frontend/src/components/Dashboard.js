import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import io from "socket.io-client";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const socket = io("http://localhost:5000");

// 🔥 Crosshair Plugin
const crosshairPlugin = {
  id: "crosshairPlugin",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);

    if (!meta || meta.data.length === 0) return;

    const lastPoint = meta.data[meta.data.length - 1];

    const x = lastPoint.x;
    const y = lastPoint.y;

    const xAxis = chart.scales.x;
    const yAxis = chart.scales.y;

    ctx.save();
    ctx.strokeStyle = "#38bdf8";
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, yAxis.bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xAxis.left, y);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.restore();
  },
};

function Dashboard() {
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // 🔐 Protect Dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  useEffect(() => {
    const handleNewData = (newData) => {
      setData((prev) => [...prev.slice(-8), newData]);
    };

    const handleAlert = (alertData) => {
      setAlerts((prev) => {
        if (prev[0]?.time === alertData.time) return prev;
        return [alertData, ...prev.slice(0, 5)];
      });
    };

    socket.on("newData", handleNewData);
    socket.on("alert", handleAlert);

    return () => {
      socket.off("newData", handleNewData);
      socket.off("alert", handleAlert);
    };
  }, []);

  const labels = data.map((_, i) => i + 1);

  const createChart = (label, values) => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        borderWidth: 1.5,
        tension: 0.3,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.2)",
      },
    ],
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  const latest = data.length > 0 ? data[data.length - 1] : null;
  const latestRisk = latest ? latest.risk : "N/A";

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">

        <div className="sidebar-top">
          <h2 className="logo">OBSERVATORY</h2>
          <ul>
            <li className="active">Dashboard</li>
          </ul>
        </div>

        <div className="sidebar-bottom">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token"); // ✅ FIXED
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>

      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <h3>Global Health Status</h3>
          <div className="status">● Live Telemetry</div>
        </div>

        <div className="content">

          <div className="risk-box">
            Current Risk:
            <span className={`risk ${latestRisk}`}>{latestRisk}</span>
          </div>

          <div className="grid">
            {["temperature", "vibration", "pressure", "humidity"].map((key) => (
              <div className="card" key={key}>
                <h3>{key.toUpperCase()}</h3>
                {data.length > 0 && (
                  <Line
                    data={createChart(key, data.map((d) => d[key]))}
                    options={options}
                    plugins={[crosshairPlugin]}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="stats">
            <div className="stat-card blue">
              <p>TEMPERATURE</p>
              <h2>{latest ? `${latest.temperature}°C` : "--"}</h2>
            </div>

            <div className="stat-card yellow">
              <p>VIBRATION</p>
              <h2>{latest ? latest.vibration : "--"}</h2>
            </div>

            <div className="stat-card cyan">
              <p>PRESSURE</p>
              <h2>{latest ? latest.pressure : "--"}</h2>
            </div>

            <div className="stat-card cyan">
              <p>HUMIDITY</p>
              <h2>{latest ? `${latest.humidity}%` : "--"}</h2>
            </div>
          </div>

          <h2 className="section-title">Alerts</h2>

          <div className="alerts-container">
            {alerts.length === 0 ? (
              <p>No alerts yet...</p>
            ) : (
              alerts.map((a, i) => (
                <div key={i} className={`alert-card ${a.type}`}>
                  <div className="alert-header">
                    <span>[{a.type}]</span>
                    <span>{a.time}</span>
                  </div>
                  <div className="alert-message">{a.message}</div>
                  <div className="alert-footer">
                    <span>{a.sensor}</span>
                    <span>Value: {a.value}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;