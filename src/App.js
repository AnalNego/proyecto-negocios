import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from "recharts";
import {
  ThemeProvider, createTheme, CssBaseline, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box
} from "@mui/material";
import "./App.css";

// Utilidad para cargar el CSV
const fetchCSV = async () => {
  const response = await fetch(process.env.PUBLIC_URL + "/datos.csv");
  const csv = await response.text();
  return new Promise((resolve) => {
    Papa.parse(csv, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        // Filtrar filas vacías
        const filtered = results.data.filter(
          (row) => row && Object.values(row).some((v) => v !== null && v !== "")
        );
        resolve(filtered);
      },
    });
  });
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#181c20", paper: "#23272b" },
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

function SummaryTable({ data }) {
  // Calcular promedios
  const metrics = ["accuracy", "precision", "recall", "loss", "tiempo_entrenamiento"];
  const summary = {};
  metrics.forEach((m) => {
    summary[m] = (data.reduce((acc, row) => acc + Number(row[m] || 0), 0) / data.length).toFixed(3);
  });
  return (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Métrica</TableCell>
            <TableCell align="right">Promedio</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map((m) => (
            <TableRow key={m}>
              <TableCell>{m}</TableCell>
              <TableCell align="right">{summary[m]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchCSV().then(setData);
  }, []);

  // Agrupar por modelo para comparar
  const groupByModel = (metric) => {
    const grouped = {};
    data.forEach((row) => {
      if (!grouped[row.modelo]) grouped[row.modelo] = [];
      grouped[row.modelo].push(Number(row[metric]));
    });
    return Object.entries(grouped).map(([modelo, values]) => ({
      modelo,
      promedio: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(3),
    }));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Resultados de Red Neuronal
        </Typography>
        {data.length === 0 ? (
          <Paper sx={{ p: 4, my: 4, textAlign: "center" }}>
            <Typography variant="h6" color="error">
              No se encontraron datos. Asegúrate de que <b>datos.csv</b> esté en la carpeta <b>public</b>.
            </Typography>
          </Paper>
        ) : (
          <>
            <SummaryTable data={data} />

            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Histograma de Accuracy por Modelo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={groupByModel("accuracy")}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="modelo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="promedio" fill="#90caf9" name="Accuracy Promedio" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Distribución de Loss en el Tiempo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="loss" stroke="#f48fb1" name="Loss" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Tabla de Resultados
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Modelo</TableCell>
                      <TableCell>Dataset</TableCell>
                      <TableCell>Accuracy</TableCell>
                      <TableCell>Precision</TableCell>
                      <TableCell>Recall</TableCell>
                      <TableCell>Loss</TableCell>
                      <TableCell>Tiempo Entrenamiento</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.fecha}</TableCell>
                        <TableCell>{row.modelo}</TableCell>
                        <TableCell>{row.dataset}</TableCell>
                        <TableCell>{row.accuracy}</TableCell>
                        <TableCell>{row.precision}</TableCell>
                        <TableCell>{row.recall}</TableCell>
                        <TableCell>{row.loss}</TableCell>
                        <TableCell>{row.tiempo_entrenamiento}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}

        <Box sx={{ textAlign: "center", mt: 4, color: "#888" }}>
          <Typography variant="body2">
            App de visualización de resultados de redes neuronales &copy; 2024
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
